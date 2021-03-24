import flask
from flask import request, jsonify
from flask_cors import CORS, cross_origin
import requests
import json

app = flask.Flask(__name__)
app.config["DEBUG"] = True
app.config['JSONIFY_PRETTYPRINT_REGULAR'] = False
CORS(app, support_credentials=True)

@app.route('/', methods=['POST'])
@cross_origin(supports_credentials=True)
def home():
    return '''
    <h1>Comparison Backend</h1>
    '''

def get_trials(keyword, num_results):
    
    # Use keyword and numResults to query the API
    key = keyword.split()
    search = ""
    last_ind = len(key) - 1

    for i in range(0, len(key)):
        search = search + key[i]
        if i != last_ind:
            search += "+"
            
    query_string = "https://clinicaltrials.gov/api/query/full_studies?expr=" + search + "&min_rnk=1&max_rnk=" + num_results + "&fmt=json"
    response = requests.get(query_string)

    full_studies_response = response.json()['FullStudiesResponse']
    try:
        full_studies = full_studies_response['FullStudies']
    except KeyError:
        print("No FullStudies Section")
        return None
    
    return full_studies
    
def apply_sorting_criteria(trial_data, criteria):
    set_up_score(trial_data, criteria)
    sort_trials(trial_data)

# Sort Trials By Criteria Route
@app.route('/api/sortTrialsByCriteria', methods=['POST'])
def api_sortTrialsByCriteria():
    
    ### Assign a default value For testing ###
    # keyword = 'heart'
    keyword = request.form['keyword']
    num_results = '21'
    # num_results = request.form['numResults']
    
    
    ### Assign a default value For testing ###
    criteria = {
        'age':'18',
        'ageWeight':2,
        'condition':'',
        'conditionWeight':1,
        'inclusion':'breast cancer',
        'inclusionWeight':3,
        'exclusion':'',
        'exclusionWeight':2,
        'ongoing':'true',
        'includeDrug':'',
        'includeDrugWeight':0,
        'excludeDrug':'',
        'excludeDrugWeight':0
    }
    criteria_json = json.dumps(criteria)
    
    # criteria = parse_request(request)
    
    # get trial data based on keyword and numResults from front end request
    trial_data = get_trials(keyword, num_results)
    if trial_data == None:
        return jsonify(
            status=False,
            message="Cannot search trials"
        )
    
    apply_sorting_criteria(trial_data, criteria)
    
    response = jsonify(
        status=True,
        message="Successfully sorted trials",
        data=trial_data
    )
    
    response.headers.add("Access-Control-Allow-Origin", "*")
    return response, 200

# sort trials from highest score to lowest (if there is no score, put this trial to tail)
def sort_trials(trial_data):
    def score(trial_data):
        try:
            return int(trial_data['score'])
        except KeyError:
            return float('-inf')
    trial_data.sort(key=score, reverse=True)
    
def parse_request(request):
    result = {
        'age':request.form['age'],
        'ageWeight':int(request.form['ageWeight']),
        'condition':request.form['condition'],
        'conditionWeight':int(request.form['conditionWeight']),
        'inclusion':request.form['inclusion'],
        'inclusionWeight':int(request.form['inclusionWeight']),
        'exclusion':request.form['exclusion'],
        'exclusionWeight':int(request.form['exclusionWeight']),
        'ongoing':request.form['ongoing'],
        'includeDrug':request.form['includeDrug'],
        'includeDrugWeight':int(request.form['includeDrugWeight']),
        'excludeDrug':request.form['excludeDrug'],
        'excludeDrugWeight':int(request.form['excludeDrugWeight'])
    }
    return json.dumps(result)

# Assign score to all trials
def set_up_score(trial_data, criteria): #(fullStudies, age, condition, inclusion, exclusion, ongoing, includeDrug, excludeDrug):
    for study in trial_data:
        try:
            protocol_section=study['Study']['ProtocolSection']
        except KeyError:
            print("No Protocol Section")
            continue
            
        score=0
        if protocol_section['EligibilityModule']:
            eligibility_module=protocol_section['EligibilityModule']
            # Check if age is in range
            try:
                min_age = eligibility_module['MinimumAge']
                int_min_age = int(min_age.split(' ')[0])
                if not criteria['age'] == '':
                    if int(criteria['age'])>int_min_age:
                        score+=criteria['ageWeight']
            except KeyError:
                print("No minimumAge Section")
            
            # Check eligibilityCriteria
            try:
                eligibility_criteria=eligibility_module['EligibilityCriteria']
                eligibility_criteria=eligibility_criteria.split('\n')
                eligibility_criteria = filter(None, eligibility_criteria)
                
                in_criteria=False
                ex_criteria=False
                in_list=[]
                ex_list=[]

                for element in eligibility_criteria:
                    if element == 'Inclusion Criteria:':
                        in_criteria=True
                        ex_criteria=False
                        continue
                    elif element == 'Exclusion Criteria:':
                        in_criteria=False
                        ex_criteria=True
                        continue
                    
                    if in_criteria:
                        in_list.append(element)
                    if ex_criteria:
                        ex_list.append(element)
                
                # Check inclusion
                if not criteria['inclusion'] == '':
                    for element in in_list:
                        if criteria['inclusion'] in element:
                            score+=criteria['inclusionWeight']
                            break
                
                # Check exclusion
                if not criteria['exclusion'] == '':
                    for element in ex_list:
                        if criteria['exclusion'] in element:
                            score+=criteria['exclusionWeight']
                            break
            except KeyError:
                print("No EligibilityCriteria Section")
            
        # Check if this condition exists
        try:
            con_list=protocol_section['ConditionsModule']['ConditionList']['Condition']
            if not criteria['condition'] == '':
                if criteria['condition'] in con_list:
                    score+=criteria['conditionWeight']
        except KeyError:
            print("No condition Section")
        
        try:
            completed_date=protocol_section['StatusModule']['PrimaryCompletionDateStruct']['PrimaryCompletionDateType']
            # Check ongoing
            if criteria['ongoing'] == 'true':
                if completed_date=='Anticipated':
                    score+=1
            else:
                if completed_date=='Actual':
                    score+=1
        except KeyError:
            print("No completion date Section")
            
        try:
            # Check includeDrug and excludeDrug
            arm_group=protocol_section['ArmsInterventionsModule']['ArmGroupList']['ArmGroup']
            for arm in arm_group:
                drug_list=arm['ArmGroupInterventionList']['ArmGroupInterventionName']
                for drug in drug_list:
                    if not criteria['includeDrug'] == '':
                        if criteria['includeDrug'].lower() in drug.lower(): # Make drug string to lower case 
                            score+=criteria['includeDrugWeight'] # includeDrug
                    if not criteria['excludeDrug'] == '':
                        if criteria['excludeDrug'].lower() in drug.lower():
                            score-=criteria['excludeDrugWeight'] # excludeDrug
        except KeyError:
            print("No includeDrug and excludeDrug Section")
            
        study.update({'score':score})

app.run(debug=True, host='0.0.0.0')
