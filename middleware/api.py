import flask
from flask import request, jsonify
from flask_cors import CORS, cross_origin
import requests
import json
from datetime import datetime

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
            
    query_string = "https://clinicaltrials.gov/api/query/full_studies?expr=" + search + "&min_rnk=1&max_rnk=" + str(num_results) + "&fmt=json"
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
    # keyword = 'paloma'
    keyword = request.form['keyword']
    # num_results=2
    num_results = request.form['numResult']
    
    ### Assign a default value For testing ###
    '''
    criteria = {
        'age':'31',
        'ageWeight':2,
        'condition':'',
        'conditionWeight':1,
        'inclusion':'breast cancer',
        'inclusionWeight':3,
        'exclusion':'',
        'exclusionWeight':2,
        'ongoing':True,
        'includeDrug':'',
        'includeDrugWeight':0,
        'excludeDrug':'',
        'excludeDrugWeight':0
    }
    criteria_json = json.dumps(criteria)
    '''
    criteria = parse_request(request)
    
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
    
    #response.headers.add("Access-Control-Allow-Origin", "*")
    return response, 200

def set_criteria_match():
    result = {
        'age':False,
        'condition':False,
        'inclusion':False,
        'exclusion':False,
        'ongoing':True,
        'includeDrug':False,
        'excludeDrug':False
    }
    return result

# sort trials from highest score to lowest (if there is no score, put this trial to tail)
def sort_trials(trial_data):
    def score(trial_data):
        try:
            return int(trial_data['score'])
        except KeyError:
            return float('-inf')
    trial_data.sort(key=score, reverse=True)
    
def parse_request(request):
    print request
    result = {
        'age':request.form['age'],
        'ageWeight':0,
        'condition':request.form['condition'],
        'conditionWeight':0,
        'inclusion':request.form['inclusion'],
        'inclusionWeight':0,
        'exclusion':request.form['exclusion'],
        'exclusionWeight':0,
        'ongoing':True,
        'includeDrug':request.form['includeDrug'],
        'includeDrugWeight':0,
        'excludeDrug':request.form['excludeDrug'],
        'excludeDrugWeight':0
    }
    if request.form['ageWeight'] != '':
        result['ageWeight']=int(request.form['ageWeight'])
    if request.form['conditionWeight'] != '':
        result['conditionWeight']=int(request.form['conditionWeight'])
    if request.form['inclusionWeight'] != '':
        result['inclusionWeight']=int(request.form['inclusionWeight'])
    if request.form['exclusionWeight'] != '':
        result['exclusionWeight']=int(request.form['exclusionWeight'])
    try:
        if request.form['ongoing'] == 'on':
            result['ongoing']=False
    except KeyError:
        print("No ongoing")
        
    if request.form['includeDrugWeight'] != '':
        result['includeDrugWeight']=int(request.form['includeDrugWeight'])
    if request.form['excludeDrugWeight'] != '':
        result['excludeDrugWeight']=int(request.form['excludeDrugWeight'])
    
    return result

# Assign score to all trials
def set_up_score(trial_data, criteria):
    for study in trial_data:
        try:
            protocol_section=study['Study']['ProtocolSection']
        except KeyError:
            print("No Protocol Section")
            continue
            
        score=0
        criteriaMatch=set_criteria_match()
        if protocol_section['EligibilityModule']:
            eligibility_module=protocol_section['EligibilityModule']
            # Check if age is in range
            min_age=''
            max_age=''
            try:
                min_age = eligibility_module['MinimumAge']
            except KeyError:
                print("No minimumAge Section")
                
            try:
                max_age = eligibility_module['MaximumAge']
            except KeyError:
                print("No MaximumAge Section")
            
            # Convert to int
            int_min_age=0
            int_max_age=0
            if min_age != '':
                int_min_age = int(min_age.split(' ')[0])
            if max_age != '':
                int_max_age = int(max_age.split(' ')[0])
            
            if not criteria['age'] == '':
                int_age=int(criteria['age'])
                if min_age != '' and max_age != '':
                    if int_age>=int_min_age and int_age<=int_max_age:
                        score+=criteria['ageWeight']
                        criteriaMatch['age']=True
                elif min_age != '':
                    if int_age>=int_min_age:
                        score+=criteria['ageWeight']
                        criteriaMatch['age']=True
                elif max_age != '':
                    if int_age<=int_max_age:
                        score+=criteria['ageWeight']
                        criteriaMatch['age']=True
                
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
                            criteriaMatch['inclusion']=True
                            break
                
                # Check exclusion
                if not criteria['exclusion'] == '':
                    for element in ex_list:
                        if criteria['exclusion'] in element:
                            score+=criteria['exclusionWeight']
                            criteriaMatch['exclusion']=True
                            break
            except KeyError:
                print("No EligibilityCriteria Section")
            
        # Check if this condition exists
        try:
            con_list=protocol_section['ConditionsModule']['ConditionList']['Condition']
            if not criteria['condition'] == '':
                if criteria['condition'] in con_list:
                    score+=criteria['conditionWeight']
                    criteriaMatch['condition']=True
        except KeyError:
            print("No condition Section")
        
        try:
            completed_date=protocol_section['StatusModule']['PrimaryCompletionDateStruct']['PrimaryCompletionDate']
            # Check ongoing
            date_list=completed_date.split(' ')
            date_str=''
            if len(date_list)==2:
                date_str += date_list[1] + '-' + date_list[0] + '-01'
            else:
                date_str += date_list[2] + '-' + date_list[0] + '-' + date_list[1][:len(date_list[1])-1]
                
            dt = datetime.strptime(date_str, '%Y-%B-%d')
            now_dt = datetime.now()
            
            if criteria['ongoing']:
                if now_dt < dt:
                    score+=1
                    criteriaMatch['ongoing']=False
            else:
                if now_dt > dt:
                    score+=1
                    criteriaMatch['ongoing']=False
            
            '''
            completed_date=protocol_section['StatusModule']['PrimaryCompletionDateStruct']['PrimaryCompletionDateType']
            # Check ongoing
            if criteria['ongoing']:
                if completed_date=='Anticipated':
                    score+=1
                    criteriaMatch['ongoing']=False
            else:
                if completed_date=='Actual':
                    score+=1
                    criteriaMatch['ongoing']=False
            '''
        except KeyError:
            print("No completion date Section")
            
        try:
            # Check includeDrug and excludeDrug
            arm_group=protocol_section['ArmsInterventionsModule']['ArmGroupList']['ArmGroup']
            for arm in arm_group:
                drug_list=arm['ArmGroupInterventionList']['ArmGroupInterventionName']
                for drug in drug_list:
                    if not criteriaMatch['includeDrug']:
                        if not criteria['includeDrug'] == '':
                            if criteria['includeDrug'].lower() in drug.lower(): # Make drug string to lower case 
                                score+=criteria['includeDrugWeight'] # includeDrug
                                criteriaMatch['includeDrug']=True
                    if not criteriaMatch['excludeDrug']:
                        if not criteria['excludeDrug'] == '':
                            if criteria['excludeDrug'].lower() in drug.lower():
                                score+=criteria['excludeDrugWeight'] # excludeDrug
                                criteriaMatch['excludeDrug']=True
        except KeyError:
            print("No includeDrug and excludeDrug Section")
            
        study.update({'score':score, 'criteriaMatch':json.dumps(criteriaMatch)})

app.run(debug=True, host='0.0.0.0')
