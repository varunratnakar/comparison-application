import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import { AiFillCaretDown, AiFillCaretUp } from "react-icons/ai"

import { makeStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';

//This is the main (parent) class. This is the first component to be created.
class Display extends React.Component{
  //Runs only on refresh
  constructor(props){
    super(props);
    const numDisplays = 2; //Determines how many trials to display on screen. 
    const wrappers = []; //array of trial display wrappers
    let i;
    this.executeSearch=this.executeSearch.bind(this);
    this.displayTrial = this.displayTrial.bind(this);
    //Since we want to use these values elsewhere, add them to the state since state is persistent (each componenet instance has own state).
    this.state = {numDisplays: numDisplays, displayInCriteria: false, displayOutCriteria: false, displayOutMeasures: false, displayResults: false, ready: false, table: true}; 
  }

  executeSearch(formData){

    formData.set('keyword', formData.get('keyword'));
    let results = []
    fetch('http://127.0.0.1:5000/api/sortTrialsByCriteria', {method: 'POST', body: formData})
      .then(response => response.json())
      .then((result) => {
        console.log(result);
        // result.data contains all sorted trails
        console.log(result.data);
        
        for(let i = 0; i < result.data.length; i++){
          results.push(result.data[i]);
        }
        this.setState({trials: results, numDisplays: result.data.length, ready: true});
      },
      (error) => {alert(error)});
    return false;

  }

  displayTrial(trialRank){
    let i = 0;
    let curTrial;
    for(i; i < this.state.numDisplays; i++){
      if(this.state.trials[i].rank === trialRank){
        curTrial = <TrialWrapper key={"key"+ i} numDisplays={1} 
        displayInCriteria={this.state.displayInCriteria}
        displayOutCriteria={this.state.displayOutCriteria}
        displayOutMeasures={this.state.displayOutMeasures}
        displayResults={this.state.displayResults}
        toggleInCriteria={()=>this.toggleInCriteria()}
        toggleOutCriteria={() => this.toggleOutCriteria()}
        toggleOutMeasures={() => this.toggleOutMeasures()}
        toggleResults={() => this.toggleResults()}
        trialData={JSON.stringify(this.state.trials[i])}
        />;
        break;
      }
    }
    this.setState({curTrial: curTrial, displayRank: trialRank, table: false});
  }

  //Toggles the criteria dropdowns and the calls updateCriteria
  toggleInCriteria(){
    this.setState({displayInCriteria: !this.state.displayInCriteria}, () => this.displayTrial(this.state.displayRank));
  }

  toggleOutCriteria(){
    this.setState({displayOutCriteria: !this.state.displayOutCriteria}, () => this.displayTrial(this.state.displayRank));
  }

  toggleOutMeasures(){
    this.setState({displayOutMeasures: !this.state.displayOutMeasures}, () => this.displayTrial(this.state.displayRank));
  }

  toggleResults(){
    this.setState({displayResults: !this.state.displayResults}, () => this.displayTrial(this.state.displayRank));
  }

  //Displays to the screen
  render(){
    var table = true;
    return(
      <div className="Background">
        <div className = 'PatientAndTrials'>
          <PatientDisplay className="PatienDisplay" executeSearch={this.executeSearch}/>
          <div className="TrialCollection" overflow="auto">
            {this.state.ready ? (this.state.table ? <TableDisplay overflow="auto" data={this.state.trials} displayTrial={this.displayTrial}/> : this.state.curTrial) : null}
          </div>
        </div>
        
      </div>
    );
  }
}


class PatientDisplay extends React.Component {
  constructor(props){
    super(props);
    this.state = {executeSearch: this.props.executeSearch};
    this.handleSubmit = this.handleSubmit.bind(this);

  }

  handleSubmit(event){
    event.preventDefault();
    let formData = new FormData(event.target);
    this.state.executeSearch(formData);
  }

  /*REQUEST FORMAT: key/value pairs with HTML form
  keys: 'keyword', 'numResult', 'age', 'ageWeight', 'condition', 'conditionWeight', 'inclusion', 'inclusionWeight',
  'exclusion', 'exclusionWeight', 'ongoing', 'includeDrug', 'includeDrugWeight', 'excludeDrug, excludeDrugWeight'
  */

  render(){
    const BarStyling = {width:"17rem",background:"#F2F1F9", border:"none", padding:"0.5rem", margin:"5px"};
    const smallerBar = {width:"14rem",background:"#F2F1F9", border:"none", padding:"0.5rem", margin:"5px"}
    const WeightStyling = {width:"1rem",background:"#F2F1F9", border:"none", padding:"0.5rem", margin:"5px"}
    return(
      <div className='PatientDisplay'>
        <form onSubmit={this.handleSubmit}>
          <p className="Header1">Search Parameters</p>
          <div>
            <input 
            name="keyword"
            style={BarStyling}
            onChange={this.handleKeywordChange}
            placeholder={"Enter Keyword(s) *REQUIRED"}
            />
          </div>
          <div>
            <input 
            name="numResult"
            type="text"
            style={BarStyling}
            placeholder= {"number of results to return (default 10)"}
            />
          </div>
          <p className="Header1">Sorting Criteria</p>
          <p className="Header2">Patient Information</p>
          <div>
            <input
            name="age"
            style={smallerBar}
            className="TextInput"
            placeholder="Age"
            />
            <input
            name="ageWeight"
            style={WeightStyling}
            placeholder="0-10"
            />
          </div>
          <div>
            <input
            name="condition"
            style={smallerBar}
            placeholder="Condition"
            />
            <input
            name="conditionWeight"
            placeholder="0-10"
            style={WeightStyling}
            />
          </div>
          <div>
            <input
            name="inclusion"
            style={smallerBar}
            placeholder="Inclusion Criteria"
            />
            <input
            name="inclusionWeight"
            style={WeightStyling}
            placeholder="0-10"
            />
          </div>
          <div>
            <input
            name="exclusion"
            style={smallerBar}
            placeholder="Exlusion Criteria"
            />
            <input
            name="exclusionWeight"
            style={WeightStyling}
            placeholder="0-10"
            />
          </div>
          <p className="Header2">Trial Status</p>
          <input
          className="TextInput"
          type="checkbox"
          name="ongoing"
          />
          <label htmlFor="option1">Study Must be Completed</label>
          <br/>
          <p className="Header2">Drug Information</p>
          <div>
            <input
            name="includeDrug"
            placeholder="Include Drug"
            style={smallerBar}
            />
            <input
            name="includeDrugWeight"
            placeholder="0-10"
            style={WeightStyling}
            />
          </div>
          <div>
            <input
            name="excludeDrug"
            className="TextInput"
            placeholder="Exclude Drug"
            style={smallerBar}
            />
            <input
            name="excludeDrugWeight"
            placeholder="0-10"
            style={WeightStyling}
            />
          </div>
          <br/>
          <br/>
          <input type='submit' value="Search"/>
        </form>
      </div>
    );
  }
}

class TableDisplay extends React.Component {

  constructor(props){
    super(props);
    this.createData = this.createData.bind(this);
    this.displayTrial = this.props.displayTrial.bind(this);
    this.state = {trials: this.props.data};
    console.log(this.props.data);

  }

  createData(trial) {
    //trial = JSON.parse(trial);
    let score = trial.score;
    let rank = trial.rank;
    let criteriaMatch = JSON.parse(trial.criteriaMatch);
    let age = criteriaMatch.age;
    let condition = criteriaMatch.condition;
    let inclusion = criteriaMatch.inclusion;
    let exclusion = criteriaMatch.exclusion;
    let completed = !criteriaMatch.ongoing;
    let includeDrug = criteriaMatch.includeDrug;
    let excludeDrug = criteriaMatch.excludeDrug;

    let name = trial.Study.ProtocolSection.IdentificationModule.BriefTitle;

    console.log(trial);
    return {score, age, name, condition, inclusion, exclusion, completed, includeDrug, excludeDrug};
  }



  componentDidUpdate(prevProps){
    if(this.props.data != prevProps.data){
      this.setState({trials: this.props.data});
    }
  }
  
  render(){
    const useStyles = makeStyles({
      table: {
        minWidth: 650,
      },
    });

    const classes = useStyles;

    const trials = [];
    let i;
    for(i = 0; i < this.state.trials.length; i++){
      trials.push(this.createData(this.state.trials[i]));
    }
    console.log(trials);

    return (
      <TableContainer component={Paper}>
        <Table className={classes.table} aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell>Score</TableCell>
              <TableCell>Trial</TableCell>
              <TableCell align="right">Age</TableCell>
              <TableCell align="right">Condition</TableCell>
              <TableCell align="right">Inclusion Criteria</TableCell>
              <TableCell align="right">Exclusion Criteria</TableCell>
              <TableCell align="right">Trial Completed</TableCell>
              <TableCell align="right">Include Drug</TableCell>
              <TableCell align="right">Exclude Drug</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {trials.map((row) => (
              <TableRow key={row.name} onClick={() => this.displayTrial(row.rank)}>
                <TableCell component="th" scope="row">
                  {row.score}
                </TableCell>
                <TableCell>{row.name}</TableCell>
                <TableCell className="MyTableCell" align="right">{!row.age ? "No match" : "Match"}</TableCell>
                <TableCell className="MyTableCell" align="right">{!row.condition ? "No match" : "Match"}</TableCell>
                <TableCell className="MyTableCell" align="right">{!row.inclusion ? "No match" : "Match"}</TableCell>
                <TableCell className="MyTableCell" align="right">{!row.exclusion ? "No match" : "Match"}</TableCell>
                <TableCell className="MyTableCell" align="right">{!row.completed ? "No match" : "Match"}</TableCell>
                <TableCell className="MyTableCell" align="right">{!row.includeDrug ? "No match" : "Match"}</TableCell>
                <TableCell className="MyTableCell" align="right">{!row.excludeDrug ? "No match" : "Match"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
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

