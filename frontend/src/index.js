import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import { AiFillCaretDown, AiFillCaretUp } from "react-icons/ai"


class Search extends React.Component{
  constructor(props){
    super(props);
    this.state = {keyword:'', numResult:'', result:'', test:''};
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.executeSearch = this.props.executeSearch.bind(this);
  }

  handleChange(event){
    if(event.target.id === "keyword"){
      this.setState({keyword:event.target.value});
    }
    else if(event.target.id === "numResult"){
      this.setState({numResult:event.target.value})
    }
  }

  handleSubmit(event){
    event.preventDefault();
    this.executeSearch(this.state.keyword, this.state.numResult);
  }

  render(){
    const BarStyling = {width:"20rem",background:"#F2F1F9", border:"none", padding:"0.5rem", margin:"5px"};
    return(
      <form onSubmit={this.handleSubmit}>
        <input 
          id="keyword"
          style={BarStyling}
          value={this.state.keyword}
          onChange={this.handleChange}
          placeholder={"search clinical trials"}
        />
        <input 
          id="numResult"
          type="text"
          style={BarStyling}
          value={this.state.numResult}
          onChange={this.handleChange}
          placeholder= {"number of results"}
        />
        <input 
          type="submit"
        />
      </form>
      );
  }

}

//This is the main (parent) class. This is the first component to be created.
class Display extends React.Component{
  //Runs only on refresh
  constructor(props){
    super(props);
    const numDisplays = 2; //Determines how many trials to display on screen. 
    const wrappers = []; //array of trial display wrappers
    let i;
    this.executeSearch=this.executeSearch.bind(this);
    this.sortResults = this.sortResults.bind(this);
      
    /*for (i = 0; i < numDisplays; i++) { 
      wrappers.push(<TrialWrapper key={"key"+ i} numDisplays={numDisplays}
        displayInCriteria={false} //Initial values for criteria dropdown
        displayOutCriteria={false}
        displayOutMeasures={false}
        displayResults={false}
        toggleInCriteria={()=>this.toggleInCriteria()} //Sending dropdown toggle functions down to child components
        toggleOutCriteria={() => this.toggleOutCriteria()} 
        toggleOutMeasures={() => this.toggleOutMeasures()}
        toggleResults={() => this.toggleResults()}
        trialChoice={i}
        dateChoice={i}
        typeChoice={i}
        conditionChoice={i}
        treatmentsChoice={i}
        inclusionChoice={i}
        linkChoice={i}
        outcomeChoice={i}
        resultChoice={i} 
        trialData={null}
        />);
    }*/
    //Since we want to use these values elsewhere, add them to the state since state is persistent (each componenet instance has own state).
    this.state = {numDisplays: numDisplays, displayInCriteria: false, displayOutCriteria: false, displayOutMeasures: false, displayResults: false, trial1: null, trial2: null}; 
  }

  executeSearch(keyword, numResult){
    keyword = keyword.split(" ");
    let search = "";
    for(let i = 0; i < keyword.length; i++){
      search += keyword[i];
      if(i !== keyword.length-1){
        search += "+";
      }
    }
    let queryString = "/api/query/full_studies?expr=" + search + "&min_rnk=1&max_rnk=" + numResult + "&fmt=json";
    let results = []
    fetch(queryString)
      .then(response => response.json())
      .then((result) => {
        for(let i = 0; i < result.FullStudiesResponse.FullStudies.length; i++){
          results.push(result.FullStudiesResponse.FullStudies[i]);
        }
        this.setState({trials: results, numDisplays: result.FullStudiesResponse.FullStudies.length});
        this.updateCriteria();
      },
      (error) => {alert(error)});
    return false;

  }

  //This function is called when the sorting criteria form is submitted. Inputs are the elements from the form.
  sortResults(_age, condition, inc, exc, ongoing, completed, includeDrug, excludeDrug){
    let currentResults = this.state.trials; //Retrieve the current list of trials
    let currentResultsJSON = JSON.stringify(currentResults)

    const content = {
      data: currentResultsJSON,
      age: _age,
      order: "ascending"
    };

    const requestMetadata = {
      method: 'GET',
      headers: {
          'Content-Type': 'application/json'
      },
      body: content
    };
    
    fetch("http://127.0.0.1:5000/api/sortTrialsByCriteria", requestMetadata)
      .then(res => res.json())
      .then(
        (result) => {
          this.setState({
            trials: result.items
          });
        },
        // Note: it's important to handle errors here
        // instead of a catch() block so that we don't swallow
        // exceptions from actual bugs in components.
        (error) => {
          alert(error)
        }
      )
    
    this.updateCriteria(); //Re-render our elements
  }


  //When we change the dropdown state in toggleInCriteria or toggleOutCriteria, we need to re-create the display wrappers
  //to reflect the change
  updateCriteria(){
    let i;
    const wrappers = [];
    for (i = 0; i < this.state.numDisplays; i++) { 
      wrappers.push(<TrialWrapper key={"key"+ i} numDisplays={this.state.numDisplays} 
        displayInCriteria={this.state.displayInCriteria}
        displayOutCriteria={this.state.displayOutCriteria}
        displayOutMeasures={this.state.displayOutMeasures}
        displayResults={this.state.displayResults}
        toggleInCriteria={()=>this.toggleInCriteria()}
        toggleOutCriteria={() => this.toggleOutCriteria()}
        toggleOutMeasures={() => this.toggleOutMeasures()}
        toggleResults={() => this.toggleResults()}
        trialData={JSON.stringify(this.state.trials[i])}
        />);
    }
    //Calling setState triggers the render function to run and essentially updates the component
    this.setState({wrappers: wrappers}) 
  }

  //Toggles the criteria dropdowns and the calls updateCriteria
  toggleInCriteria(){
    this.setState({displayInCriteria: !this.state.displayInCriteria}, () => this.updateCriteria());
  }

  toggleOutCriteria(){
    this.setState({displayOutCriteria: !this.state.displayOutCriteria}, () => this.updateCriteria());
  }

  toggleOutMeasures(){
    this.setState({displayOutMeasures: !this.state.displayOutMeasures}, () => this.updateCriteria());
  }

  toggleResults(){
    this.setState({displayResults: !this.state.displayResults}, () => this.updateCriteria());
  }

  //Displays to the screen
  render(){
    return(
      <div className="Background">
        <Search executeSearch={this.executeSearch}/>
        <div className = 'PatientAndTrials'>
          <PatientDisplay sortResults={this.sortResults}/>
          <div className="TrialCollection">
            {this.state.wrappers}
          </div>
        </div>
        
      </div>
    );
  }
}


class PatientDisplay extends React.Component {
  constructor(props){
    super(props);

    this.state = {
      m_age: '',
      m_condition: '',
      m_inclusion: '',
      m_exclusion: '',
      m_ongoing: true,
      m_completed: true,
      m_includeDrug: '',
      m_excludeDrug: '',
    }

    this.handleAgeChange = this.handleAgeChange.bind(this);
    this.handleConditionChange = this.handleConditionChange.bind(this);
    this.handleInclusionChange = this.handleInclusionChange.bind(this);
    this.handleExclusionChange = this.handleExclusionChange.bind(this);
    this.handleOngoingChange = this.handleOngoingChange.bind(this);
    this.handleCompletedChange = this.handleCompletedChange.bind(this);
    this.handleIncludeDrugChange = this.handleIncludeDrugChange.bind(this);
    this.handleExcludeDrugChange = this.handleExcludeDrugChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.sortResults = this.props.sortResults.bind(this);

  }

  handleAgeChange(event){
    this.setState({m_age: event.target.value});
    console.log(this.state.age);
  }
  handleConditionChange(event){
    this.setState({m_condition: event.target.value});
  }
  handleInclusionChange(event){
    this.setState({m_inclusion: event.target.value});
  }
  handleExclusionChange(event){
    this.setState({m_exclusion: event.target.value});
  }
  handleOngoingChange(event){
    this.setState({m_ongoing: !this.state.m_ongoing});
  }
  handleCompletedChange(event){
    this.setState({m_completed: !this.state.m_completed});
  }
  handleIncludeDrugChange(event){
    this.setState({m_includeDrug: event.target.value});
  }
  handleExcludeDrugChange(event){
    this.setState({m_excludeDrug: event.target.value});
  }

  handleSubmit(event){
    event.preventDefault();
    this.sortResults(this.state.m_age, this.state.m_condition, this.state.m_inclusion, this.state.m_exclusion,
      this.state.m_ongoing, this.state.m_completed, this.state.m_includeDrug, this.state.m_excludeDrug);
  }

  render(){
    return(
      <div className='PatientDisplay' style={{width:'200px'}}>
        <p className="Header1">Sorting Criteria</p>
        <form onSubmit={this.handleSubmit}>
          <p className="Header2">Patient Information</p>
          <input
          className="TextInput"
          placeholder="Age"
          value={this.state.m_age}
          onChange={this.handleAgeChange}
          />
          <input
          className="TextInput"
          placeholder="Condition"
          value={this.state.m_condition}
          onChange={this.handleConditionChange}
          />
          <input
          className="TextInput"
          placeholder="Inclusion Criteria"
          value={this.state.m_inclusion}
          onChange={this.handleInclusionChange}
          />
          <input
          className="TextInput"
          placeholder="Exlusion Criteria"
          value={this.state.m_exclusion}
          onChange={this.handleExclusionChange}
          />
          <p className="Header2">Trial Status</p>
          <input
          className="TextInput"
          type="checkbox"
          id="option1"
          value="Study Ongoing"
          onChange={this.handleOngoingChange}
          />
          <label htmlFor="option1">Study Ongoing</label>
          <br/>
          <input
          className="TextInput"
          type="checkbox"
          id="option3"
          value="Study Completed"
          onChange={this.handleCompletedChange}
          />
          <label htmlFor="option3">Study Completed</label>
          <p className="Header2">Drug Information</p>
          <input
          className="TextInput"
          placeholder="Include Drug"
          value={this.state.m_includeDrug}
          onChange={this.handleIncludeDrugChange}
          />
          <input
          className="TextInput"
          placeholder="Exclude Drug"
          value={this.state.m_excludeDrug}
          onChange={this.handleExcludeDrugChange}
          />
          <br/>
          <br/>
          <input type='submit' value="Apply Criteria"/>
        </form>
      </div>
    );
  }
}

//This class represents an individual clinical trial
class TrialWrapper extends React.Component {
  //Runs on refresh
  constructor(props){
    super(props);
    this.state = {
      width: ((window.innerWidth - 200) / props.numDisplays) - 50,
      displayInCriteria: this.props.displayInCriteria,
      displayOutCriteria: this.props.displayOutCriteria,
      displayOutMeasures: this.props.displayOutMeasures,
      displayResults: this.props.displayResults,
      trialData: JSON.parse(this.props.trialData)
    };
  }

  //Runs when a prop passed down from the parent changes. Used to trigger re-rendering on dropdown toggle
  componentDidUpdate(prevProps) {
    if(this.props.displayInCriteria !==prevProps.displayInCriteria){
      this.setState({displayInCriteria: this.props.displayInCriteria});  
    }
    if(this.props.displayOutCriteria !== prevProps.displayOutCriteria){
      this.setState({displayOutCriteria: this.props.displayOutCriteria});
    }
    if(this.props.displayOutMeasures !== prevProps.displayOutMeasures){
      this.setState({displayOutMeasures: this.props.displayOutMeasures});
    }
    if(this.props.displayResults !== prevProps.displayResults){
      this.setState({displayResults: this.props.displayResults});
    }
    if(this.props.trialData !== prevProps.trialData){
      this.setState({trialData: JSON.parse(this.props.trialData)});
    }
  }

   parseTreatments(data) {
    var treatments = [];
    for(var i = 0; i < data.length; i++) {
      treatments.push(data[i].InterventionType + ": " + data[i].InterventionName);
    }
    return treatments;
  }

  //For criteria, we pass down the current state of dropdowns and the toggle function that we got from the parent
  render() {
    return (
      <div className="TrialWrapper" style={{width: this.state.width}}>
        <TrialName 
          data={this.state.trialData.Study.ProtocolSection.IdentificationModule.BriefTitle? 
            JSON.stringify(this.state.trialData.Study.ProtocolSection.IdentificationModule.BriefTitle) : null} />
        <TrialDate 
          data={this.state.trialData.Study.ProtocolSection.StatusModule? 
            this.state.trialData.Study.ProtocolSection.StatusModule : null}
        />
        <TrialType
          data={this.state.trialData.Study.ProtocolSection.DesignModule.StudyType ? 
            this.state.trialData.Study.ProtocolSection.DesignModule.StudyType : null}
        />
        <TrialCondition 
          data={this.state.trialData.Study.ProtocolSection.ConditionsModule.ConditionList.Condition ? 
            this.state.trialData.Study.ProtocolSection.ConditionsModule.ConditionList.Condition : null}
        />
        <TrialTreatment
          treatmentsList={this.state.trialData.Study.ProtocolSection.ArmsInterventionsModule.hasOwnProperty('InterventionList') ? 
            this.parseTreatments(this.state.trialData.Study.ProtocolSection.ArmsInterventionsModule.InterventionList.Intervention) : null}
        />
        <TrialInCriteria 
         displayInCriteria={this.state.displayInCriteria} 
         toggleInCriteria={() => this.props.toggleInCriteria()}
         inclusionStr = {this.state.trialData.Study.ProtocolSection.EligibilityModule.EligibilityCriteria ? 
          this.state.trialData.Study.ProtocolSection.EligibilityModule.EligibilityCriteria : null}
        />
        <TrialExCriteria 
         displayOutCriteria={this.state.displayOutCriteria} 
         toggleOutCriteria={() => this.props.toggleOutCriteria()}
         exclusionStr = {this.state.trialData.Study.ProtocolSection.EligibilityModule.EligibilityCriteria ? 
          this.state.trialData.Study.ProtocolSection.EligibilityModule.EligibilityCriteria : null}
        />
        <TrialOutcomeMeasures 
          displayOutMeasures={this.state.displayOutMeasures} 
          toggleOutMeasures={() => this.props.toggleOutMeasures()}
          data={this.state.trialData.Study.ProtocolSection.OutcomesModule ? 
            JSON.stringify(this.state.trialData.Study.ProtocolSection.OutcomesModule) : null}
        /> 
        <TrialResult
          displayResults={this.state.displayResults} 
          toggleResults={() => this.props.toggleResults()}
          data={this.state.trialData.Study.hasOwnProperty('ResultsSection') ? 
            this.state.trialData.Study.ResultsSection : null}
        />
        <TrialLink
          link={this.state.trialData ? "https://clinicaltrials.gov/ct2/show/study/" + this.state.trialData.Study.ProtocolSection.IdentificationModule.NCTId : null}
        />
      </div>
    );
  }
}

class TrialName extends React.Component {
  constructor(props){
    super(props);
    this.state= {data: this.props.data}
  }

  componentDidUpdate(prevProps){
    if(this.props.data !== prevProps.data){
      this.setState({data: this.props.data});
    }
  }

  render(){
    return(
      <div className="TrialSection" >
        <p>Clinical Trials:</p>
        <div className="text">
            {this.state.data}
        </div>
      </div>
    );
  }
}

class TrialDate extends React.Component {
  constructor(props){
    super(props);
    let data = this.props.data;
    let start;
    let primary;
    let estComp;
    if(!data.hasOwnProperty('PrimaryCompletionDateStruct')){
      primary = 'n/a';
    }
    else{
      primary = data.PrimaryCompletionDateStruct.PrimaryCompletionDate;
    }
    if(!data.hasOwnProperty('CompletionDateStruct')){
      estComp = 'n/a';
    }
    else{
      estComp = data.CompletionDateStruct.CompletionDate;
    }
    this.state= {
      start: this.props.data.StartDateStruct.StartDate,
      primary: primary,
      estComp: estComp
    };
  }

  render(){
    return(
      <div className="TrialSection" >
        <p>Actual Study Start Date:
          <span className="text">
            {" " + this.state.start}
          </span>
        </p>
        <p>Actual Primary Completion Date:
          <span className="text">
            {" " + this.state.primary}
          </span>
        </p>
        <p>Estimated Study Completion Date:
          <span className="text">
            {" " + this.state.estComp}
          </span>
        </p>
      </div>
    );
  }
}

class TrialType extends React.Component {
  constructor(props){
    super(props);
    this.state = {data: this.props.data}
  }

  componentDidUpdate(prevProps){
    if(this.props.data !== prevProps.data){
      this.setState({data: this.props.data});
    }
  }

  render(){
    return(
      <div className="TrialSection" >
        <p>Type of Trial: 
          <span className="text">
            {" " + this.state.data}
          </span>
        </p>
      </div>
    );
  }
}

class TrialCondition extends React.Component {
  constructor(props){
    super(props);
    this.state = {data: this.props.data}
  }

  componentDidUpdate(prevProps){
    if(this.props.data !== prevProps.data){
      this.setState({data: this.props.data});
    }
  }

  render(){
    return(
      <div className="TrialSection" >
        <p>Condition: 
          <span className="text">
            {" " + this.state.data}
          </span>
        </p>
      </div>
    );
  }
}

class TrialTreatment extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      treatmentsList: this.props.treatmentsList ? this.props.treatmentsList : []
    };
  }

  componentDidUpdate(prevProps) {
    if(this.props !== prevProps) {
      this.setState( {
        treatmentsList: this.props.treatmentsList ? this.props.treatmentsList : []
      });
    }
  }


  render(){
    return(
      <div className="TrialSection" >
        <div>Treatments:
          <span className="text">
            <ul>
              {
                this.state.treatmentsList.map((listitem, i) => (
                  <li key={i}>
                    {listitem}
                  </li>
                ))
              }
            </ul>
          </span>
        </div>
      </div>
    );
  }
}

//Wrapper for inclusion criteria component
class TrialInCriteria extends React.Component {
  constructor(props){
    super(props);
    this.state = {displayInCriteria: this.props.displayInCriteria, inclusionStr: this.props.inclusionStr}
  }

  //Triggers when prop from parent changes (dropdown toggle)
  componentDidUpdate(prevProps){
    if(this.props !== prevProps){
      this.setState({inclusionStr: this.props.inclusionStr});
    }
    if(prevProps.displayInCriteria !== this.props.displayInCriteria){
      this.setState({displayInCriteria: this.props.displayInCriteria});
    }
  }

  //On click, this component calls toggleInCriteria(), the function defined in the Display component
  //This triggers the inclusion dropdown of all trial displays to either appear or disappear
  render(){
    return(
      <div className="TrialSection" onClick={() => this.props.toggleInCriteria()} >
        <p>
          Inclusion Criteria 
          {this.state.displayInCriteria ? <AiFillCaretUp /> : <AiFillCaretDown />}
        </p>
        {this.state.displayInCriteria ? <CriteriaBox type="Inclusion" data={this.state.inclusionStr}/> : null}
      </div>
    );
  }
}

//Same but for exlusion 
class TrialExCriteria extends React.Component {
  constructor(props){
    super(props);
    this.state = {displayOutCriteria: this.props.displayOutCriteria, exclusionStr: this.props.exclusionStr}
  }

  componentDidUpdate(prevProps){
    if(this.props !== prevProps){
      this.setState({exclusionStr: this.props.exclusionStr});
    }
    if(prevProps.displayOutCriteria !== this.props.displayOutCriteria){
      this.setState({displayOutCriteria: this.props.displayOutCriteria});
    }
  }

  render(){
    return(
      <div className="TrialSection" onClick={() => this.props.toggleOutCriteria()} >
        <p>
          Exclusion Criteria 
          {this.state.displayOutCriteria ? <AiFillCaretUp /> : <AiFillCaretDown />}
        </p>
        {this.state.displayOutCriteria ? <CriteriaBox type="Exclusion" data={this.state.exclusionStr}/> : null}
      </div>
    );
  }
}

class TrialOutcomeMeasures extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      displayOutMeasures: this.props.displayOutMeasures, 
      data: JSON.parse(this.props.data)
    };
  }

  componentDidUpdate(prevProps){
    if(prevProps.displayOutMeasures !== this.props.displayOutMeasures){
      this.setState({displayOutMeasures: this.props.displayOutMeasures});
    }
    if(prevProps.data !== this.props.data){
      this.setState({data: JSON.parse(this.props.data)});
    }
  }

  render(){
    return(
      <div className="TrialSection" onClick={() => this.props.toggleOutMeasures()}>
        <p>
          Outcome Measures
          {this.state.displayOutMeasures ? <AiFillCaretUp /> : <AiFillCaretDown />}
        </p>
        {this.state.displayOutMeasures ? <MeasuresBox data={JSON.stringify(this.state.data)}/> : null}
      </div>
    );
  }
}

class TrialResult extends React.Component {
  constructor(props){
    super(props);
    this.state = {displayResults: this.props.displayResults, 
      data: this.props.data
    };
  }

  componentDidUpdate(prevProps){
    if(prevProps.displayResults !== this.props.displayResults){
      this.setState({displayResults: this.props.displayResults});
    }

    if(this.props !== prevProps){
      this.setState({
        data: this.props.data
      });
    }
  }

  render(){
    return(
      <div className="TrialSection" onClick={() => this.props.toggleResults()}>
        <p>
          Result
          {this.state.displayResults ? <AiFillCaretUp /> : <AiFillCaretDown />}
        </p>
        {this.state.displayResults ? <ResultTable data={this.state.data}/> : null}
      </div>
    );
  }
}

class TrialLink extends React.Component {
  constructor(props){
    super(props);
    this.state= {link: this.props.link}
  }

  componentDidUpdate(prevProps){
    if(this.props.link !== prevProps.link){
      this.setState({link: this.props.link});
    }
  }

  render(){
    return(
      <div className="TrialSection" >
        <p>Link: 
          <span className="Link">
            <a href={this.state.link}>{this.state.link}</a>
          </span>
        </p>
      </div>
    );
  }
}

//This component represents a single exclusion or inclusion criteria
class SingleCriteria extends React.Component {
  constructor(props){
    super(props);
    this.state = {criteria: this.props.criteria}
  }

  render(){
    return(
      <div className="Criteria" >
        <p> {this.state.criteria}</p>
      </div>
    );
  }
}

function inclusion(str) {
  let si = str.indexOf("Inclusion Criteria:") + 1
  let ei = str.indexOf("Exclusion Criteria:")
  let newStr = str.slice(si, ei);
  let ans = []

  for (let i = 0; i < newStr.length; i++){
    if (newStr[i] != "") {
      ans.push(newStr[i])
    }
  }

  return ans
}

function exclusion(str) {
  let si = str.indexOf("Exclusion Criteria:") + 1
  let ei = str.length
  let newStr = str.slice(si, ei);
  let ans = []

  for (let i = 0; i < newStr.length; i++){
    if (newStr[i] != "") {
      ans.push(newStr[i])
    }
  }

  return ans
}

class IndividualResult extends React.Component{
  constructor(props){
    super(props);
    this.state = {
      title: this.props.data.FlowGroupTitle,
      description: this.props.data.FlowGroupDescription
    };
  }

  render(){
    return(
      <div className='IndividualResult'>
        <p className='Header2'>{this.state.title}</p>
        {this.state.description}
      </div>
    );
  }

}

class ResultTable extends React.Component {
  constructor(props){
    super(props);
    let results = [];
    let found = true;
    if(!this.props.data){
      this.state = {results: results};
      return;
    }
    if(!this.props.data.hasOwnProperty('ParticipantFlowModule')){
      found = false;
    }
    else if(!this.props.data.ParticipantFlowModule.hasOwnProperty('FlowGroupList')){
      found = false;
    }
    if(found){
      let groups = this.props.data.ParticipantFlowModule.FlowGroupList.FlowGroup;
      for(let i = 0; i < groups.length; i++){
        results.push(<IndividualResult data={groups[i]} key={'result'+ i}/>);
      }
    }
    this.state = { 
      results: results
    }
  }

  render(){
    return(
      <div>
        {this.state.results}
      </div>
    );
  }
}

class MeasuresBox extends React.Component {
  constructor(props){
    super(props);
    let numPrimary;
    if(!JSON.parse(this.props.data).hasOwnProperty('PrimaryOutcomeList')){
      numPrimary = 0;
    }else if(!JSON.parse(this.props.data).PrimaryOutcomeList.hasOwnProperty('PrimaryOutcome')){
      numPrimary = 0;
    }
    else{
      numPrimary = JSON.parse(this.props.data).PrimaryOutcomeList.PrimaryOutcome.length;
    }
    let numSecondary;
    if(!JSON.parse(this.props.data).hasOwnProperty('SecondaryOutcomeList')){
      numSecondary = 0;
    }else if(!JSON.parse(this.props.data).SecondaryOutcomeList.hasOwnProperty('SecondaryOutcome')){
      numSecondary = 0;
    }else{
      numSecondary = JSON.parse(this.props.data).SecondaryOutcomeList.SecondaryOutcome.length;
    }
    let primaryOutcomes = [];
    let secondaryOutcomes = [];
    for(let i = 0; i < numPrimary; i++){
      primaryOutcomes.push(
        <IndividualMeasure key={"measure" + i}
        data={JSON.stringify(JSON.parse(this.props.data).PrimaryOutcomeList.PrimaryOutcome[i])}
        type="primary"
        />
      );

    }
    for(let i = 0; i < numSecondary; i++){
      secondaryOutcomes.push(
        <IndividualMeasure key={"measure" + i}
        data={JSON.stringify(JSON.parse(this.props.data).SecondaryOutcomeList.SecondaryOutcome[i])}
        type="secondary"
        />
  
      );
    }
    this.state = { 
      outcomeChoice: props.outcomeChoice, 
      data: JSON.parse(this.props.data),
      numPrimary: numPrimary,
      numSecondary: numSecondary,
      primaryOutcomes: primaryOutcomes,
      secondaryOutcomes: secondaryOutcomes
    }

  }

  render(){
    return(
      <div className="MeasureBox">
        <p className="OutcomeTitle">Primary Outcome Measures</p>
        {this.state.primaryOutcomes}
        <p className="OutcomeTitle">Secondary Outcome Measures</p>
        {this.state.secondaryOutcomes}
      </div>
    );
  }
    
}

class IndividualMeasure extends React.Component {
  constructor(props){
    super(props);
    if(this.props.type === "primary"){
      this.state = {
        Measure: JSON.parse(this.props.data).PrimaryOutcomeMeasure,
        Description: JSON.parse(this.props.data).PrimaryOutcomeDescription,
        TimeFrame: JSON.parse(this.props.data).PrimaryOutcomeTimeFrame
      };
    }
    else if(this.props.type === "secondary"){
      this.state = {
        Measure: JSON.parse(this.props.data).SecondaryOutcomeMeasure,
        Description: JSON.parse(this.props.data).SecondaryOutcomeDescription,
        TimeFrame: JSON.parse(this.props.data).SecondaryOutcomeTimeFrame
      }
    }
    
  }

  render(){
    return(
      <div className="IndividualMeasure">
        <p>Outcome Measure: {this.state.Measure}</p>
        <p>Description: {this.state.Description}</p>
        <p>Time Frame: {this.state.TimeFrame}</p>
      </div>
    );
  }
}

//Contains one type (inclusion or exclusion) of criteria for one trial display
class CriteriaBox extends React.Component {
  constructor(props){
    super(props);
    let str;
    if(this.props.type === "Inclusion"){
      this.state = {
        type: this.props.type,
        criteria: this.props.data.split("Exclusion Criteria:")[0].split("\n")
      };
    }
    else{
      if(this.props.data.split("Exclusion Criteria:").length < 2){
        this.state = {type: this.props.type, criteria: []}
        return;
      }
      this.state = {
        type: this.props.type,
        criteria: this.props.data.split("Exclusion Criteria:")[1].split("\n")
      };
    }


    
  }
  render(){
    let i;
    const allCriteria = [];
    for (i = 0; i < this.state.criteria.length; i++) { 
      if(this.state.criteria[i] !== "Inclusion Criteria:" && this.state.criteria[i] !== ""){
        allCriteria.push(<SingleCriteria criteria={this.state.criteria[i]} type={this.state.type} key={"criteria" + i}/>);
      }     
    }
    return(
      <div className="CriteriaBox" >
        {allCriteria}
      </div>
    );
  }
}


// ========================================

ReactDOM.render(
  <Display />, //Triggers main component to display
  document.getElementById('root')
);

