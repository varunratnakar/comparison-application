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
  }

  handleChange(event){
    if(event.target.id === "keyword"){
      this.setState({keyword:event.target.value});
      this.props.keyword = event.target.value;
    }
    else if(event.target.id === "numResult"){
      this.setState({numResult:event.target.value})
      this.props.numResult = event.target.value;
    }
  }

  handleSubmit(event){
    fetch("/api/query/full_studies?expr=heart+attack&min_rnk=1&max_rnk=1&fmt=json")
      .then(response => response.json())
      .then((result) => {alert(result)},
        (error) => {alert(error)})
  }

  render(){
    const BarStyling = {width:"20rem",background:"#F2F1F9", border:"none", padding:"0.5rem", margin:"5px"};
    return(
      <form onSubmit={() => this.props.executeSearch(this.state.keyword, this.state.numResult)}>
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
      
    for (i = 0; i < numDisplays; i++) { 
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
    }
    //Since we want to use these values elsewhere, add them to the state since state is persistent (each componenet instance has own state).
    this.state = {numDisplays: numDisplays, displayInCriteria: false, displayOutCriteria: false, displayOutMeasures: false, displayResults: false, wrappers: wrappers, trial1: null, trial2: null}; 
  }

  componentDidMount(){

    fetch("/api/query/full_studies?expr=paloma+3%0D%0A&min_rnk=1&max_rnk=2&fmt=json")
      .then(response => response.json())
      .then((result) => {this.setState({trial1: result.FullStudiesResponse.FullStudies[0], trial2: result.FullStudiesResponse.FullStudies[1]}); this.updateCriteria()},
        (error) => {alert(error)});

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
        trialChoice={i}
        dateChoice={i}
        typeChoice={i}
        conditionChoice={i}
        treatmentsChoice={i}
        inclusionChoice={i}
        outcomeChoice={i}
        resultChoice={i}
        linkChoice={i}
        trialData={i===0 ? JSON.stringify(this.state.trial1) : JSON.stringify(this.state.trial2)}
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
        <Search />
        <div className = 'PatientAndTrials'>
          <PatientDisplay/>
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
  }

  render(){
    return(
      <div className='PatientDisplay' style={{width:'200px'}}>
        <p className="Header1">Sorting Criteria</p>
        <form>
          <p className="Header2">Patient Information</p>
          <input
          className="TextInput"
          placeholder="Age"
          />
          <input
          className="TextInput"
          placeholder="Condition"
          />
          <input
          className="TextInput"
          placeholder="Inclusion Criteria"
          />
          <input
          className="TextInput"
          placeholder="Exlusion Criteria"
          />
          <p className="Header2">Trial Status</p>
          <input
          className="TextInput"
          type="checkbox"
          id="option1"
          value="Primary Ongoing"
          />
          <label htmlFor="option1">Primary Ongoing</label>
          <br/>
          <input
          className="TextInput"
          type="checkbox"
          id="option2"
          value="Primary Completed"
          />
          <label htmlFor="option2">Primary Completed</label>
          <br/>
          <input
          className="TextInput"
          type="checkbox"
          id="option3"
          value="Study Completed"
          />
          <label htmlFor="option3">Study Completed</label>
          <p className="Header2">Drug Information</p>
          <input
          className="TextInput"
          placeholder="Include Drug"
          />
          <input
          className="TextInput"
          placeholder="Exclude Drug"
          />
          <p className="Header2">Outcome Measures</p>
          <input
          className="TextInput"
          placeholder="Desired Outcome Measure"
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
      trialChoice: this.props.trialChoice,
      dateChoice: this.props.dateChoice,
      typeChoice: this.props.typeChoice,
      conditionChoice: this.props.conditionChoice,
      treatmentsChoice: this.props.treatmentsChoice,
      inclusionChoice: this.props.inclusionChoice,
      outcomeChoice: this.props.outcomeChoice, 
      resultChoice: this.props.resultChoice, 
      linkChoice: this.props.linkChoice,
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
          trialChoice={this.state.trialChoice} 
          data={this.state.trialData? JSON.stringify(this.state.trialData.Study.ProtocolSection.IdentificationModule.BriefTitle) : null} />
        <TrialDate 
          dateChoice={this.state.dateChoice}
          startDate= {this.state.trialData ? this.state.trialData.Study.ProtocolSection.StatusModule.StartDateStruct.StartDate : null}
          primaryCompDate = {this.state.trialData ? this.state.trialData.Study.ProtocolSection.StatusModule.PrimaryCompletionDateStruct.PrimaryCompletionDate : null}
          estCompDate = {this.state.trialData ? this.state.trialData.Study.ProtocolSection.StatusModule.CompletionDateStruct.CompletionDate : null}
        />
        <TrialType
          typeChoice={this.state.typeChoice}
          data={this.state.trialData ? this.state.trialData.Study.ProtocolSection.DesignModule.StudyType : null}
        />
        <TrialCondition conditionChoice={this.state.conditionChoice}
          conditionChoice={this.state.conditionChoice}
          data={this.state.trialData ? this.state.trialData.Study.ProtocolSection.ConditionsModule.ConditionList.Condition : null}
        />
        <TrialTreatment
          treatmentsChoice={this.state.treatmentsChoice}
          treatmentsList={this.state.trialData ? this.parseTreatments(this.state.trialData.Study.ProtocolSection.ArmsInterventionsModule.InterventionList.Intervention) : null}
        />
        <TrialInCriteria 
         inclusionChoice={this.state.inclusionChoice} 
         displayInCriteria={this.state.displayInCriteria} 
         toggleInCriteria={() => this.props.toggleInCriteria()}
         clusionStr = {this.state.trialData ? this.state.trialData.Study.ProtocolSection.EligibilityModule.EligibilityCriteria : null}
        />
        <TrialExCriteria 
         displayOutCriteria={this.state.displayOutCriteria} 
         toggleOutCriteria={() => this.props.toggleOutCriteria()}
         clusionStr = {this.state.trialData ? this.state.trialData.Study.ProtocolSection.EligibilityModule.EligibilityCriteria : null}
        />
        <TrialOutcomeMeasures 
        outcomeChoice={this.state.outcomeChoice} 
        displayOutMeasures={this.state.displayOutMeasures} 
        toggleOutMeasures={() => this.props.toggleOutMeasures()}
        data={this.state.trialData? JSON.stringify(this.state.trialData.Study.ProtocolSection.OutcomesModule) : null}
        /> 
        <TrialResult
          resultChoice={this.state.resultChoice}
          displayResults={this.state.displayResults} 
          toggleResults={() => this.props.toggleResults()}
          leftFlowGroupTitle={this.state.trialData ? (this.state.trialData.Study.ResultsSection ? this.state.trialData.Study.ResultsSection.ParticipantFlowModule.FlowGroupList.FlowGroup[0].FlowGroupTitle : "null") : null}
          rightFlowGroupTitle={this.state.trialData ? (this.state.trialData.Study.ResultsSection ? this.state.trialData.Study.ResultsSection.ParticipantFlowModule.FlowGroupList.FlowGroup[1].FlowGroupTitle : "null") : null}
          leftStarted={this.state.trialData ? (this.state.trialData.Study.ResultsSection ? this.state.trialData.Study.ResultsSection.ParticipantFlowModule.FlowPeriodList.FlowPeriod[0].FlowMilestoneList.FlowMilestone[0].FlowAchievementList.FlowAchievement[0].FlowAchievementNumSubjects : "null") : null}
          rightStarted={this.state.trialData ? (this.state.trialData.Study.ResultsSection ? this.state.trialData.Study.ResultsSection.ParticipantFlowModule.FlowPeriodList.FlowPeriod[0].FlowMilestoneList.FlowMilestone[0].FlowAchievementList.FlowAchievement[1].FlowAchievementNumSubjects : "null") : null}

          leftCompleted={this.state.trialData ? (this.state.trialData.Study.ResultsSection ? this.state.trialData.Study.ResultsSection.ParticipantFlowModule.FlowPeriodList.FlowPeriod[0].FlowMilestoneList.FlowMilestone[1].FlowAchievementList.FlowAchievement[0].FlowAchievementNumSubjects : "null") : null}
          rightCompleted={this.state.trialData ? (this.state.trialData.Study.ResultsSection ? this.state.trialData.Study.ResultsSection.ParticipantFlowModule.FlowPeriodList.FlowPeriod[0].FlowMilestoneList.FlowMilestone[1].FlowAchievementList.FlowAchievement[1].FlowAchievementNumSubjects : "null") : null}

          leftNotCompleted={this.state.trialData ? (this.state.trialData.Study.ResultsSection ? this.state.trialData.Study.ResultsSection.ParticipantFlowModule.FlowPeriodList.FlowPeriod[0].FlowMilestoneList.FlowMilestone[2].FlowAchievementList.FlowAchievement[0].FlowAchievementNumSubjects : "null") : null}
          rightNotCompleted={this.state.trialData ? (this.state.trialData.Study.ResultsSection ? this.state.trialData.Study.ResultsSection.ParticipantFlowModule.FlowPeriodList.FlowPeriod[0].FlowMilestoneList.FlowMilestone[2].FlowAchievementList.FlowAchievement[1].FlowAchievementNumSubjects : "null") : null}

          leftAdverse={this.state.trialData ? (this.state.trialData.Study.ResultsSection ? this.state.trialData.Study.ResultsSection.ParticipantFlowModule.FlowPeriodList.FlowPeriod[0].FlowDropWithdrawList.FlowDropWithdraw[0].FlowReasonList.FlowReason[0].FlowReasonNumSubjects : "null") : null}
          rightAdverse={this.state.trialData ? (this.state.trialData.Study.ResultsSection ? this.state.trialData.Study.ResultsSection.ParticipantFlowModule.FlowPeriodList.FlowPeriod[0].FlowDropWithdrawList.FlowDropWithdraw[0].FlowReasonList.FlowReason[1].FlowReasonNumSubjects : "null") : null}

          leftStatus={this.state.trialData ? (this.state.trialData.Study.ResultsSection ? this.state.trialData.Study.ResultsSection.ParticipantFlowModule.FlowPeriodList.FlowPeriod[0].FlowDropWithdrawList.FlowDropWithdraw[1].FlowReasonList.FlowReason[0].FlowReasonNumSubjects : "null") : null}
          rightStatus={this.state.trialData ? (this.state.trialData.Study.ResultsSection ? this.state.trialData.Study.ResultsSection.ParticipantFlowModule.FlowPeriodList.FlowPeriod[0].FlowDropWithdrawList.FlowDropWithdraw[1].FlowReasonList.FlowReason[1].FlowReasonNumSubjects : "null") : null}

          leftRand={this.state.trialData ? (this.state.trialData.Study.ResultsSection ? this.state.trialData.Study.ResultsSection.ParticipantFlowModule.FlowPeriodList.FlowPeriod[0].FlowDropWithdrawList.FlowDropWithdraw[2].FlowReasonList.FlowReason[0].FlowReasonNumSubjects : "null") : null}
          rightRand={this.state.trialData ? (this.state.trialData.Study.ResultsSection ? this.state.trialData.Study.ResultsSection.ParticipantFlowModule.FlowPeriodList.FlowPeriod[0].FlowDropWithdrawList.FlowDropWithdraw[2].FlowReasonList.FlowReason[1].FlowReasonNumSubjects : "null") : null}

          leftDeath={this.state.trialData ? (this.state.trialData.Study.ResultsSection ? this.state.trialData.Study.ResultsSection.ParticipantFlowModule.FlowPeriodList.FlowPeriod[0].FlowDropWithdrawList.FlowDropWithdraw[3].FlowReasonList.FlowReason[0].FlowReasonNumSubjects : "null") : null}
          rightDeath={this.state.trialData ? (this.state.trialData.Study.ResultsSection ? this.state.trialData.Study.ResultsSection.ParticipantFlowModule.FlowPeriodList.FlowPeriod[0].FlowDropWithdrawList.FlowDropWithdraw[3].FlowReasonList.FlowReason[1].FlowReasonNumSubjects : "null") : null}

          leftObject={this.state.trialData ? (this.state.trialData.Study.ResultsSection ? this.state.trialData.Study.ResultsSection.ParticipantFlowModule.FlowPeriodList.FlowPeriod[0].FlowDropWithdrawList.FlowDropWithdraw[4].FlowReasonList.FlowReason[0].FlowReasonNumSubjects : "null") : null}
          rightObject={this.state.trialData ? (this.state.trialData.Study.ResultsSection ? this.state.trialData.Study.ResultsSection.ParticipantFlowModule.FlowPeriodList.FlowPeriod[0].FlowDropWithdrawList.FlowDropWithdraw[4].FlowReasonList.FlowReason[1].FlowReasonNumSubjects : "null") : null}

          leftRef={this.state.trialData ? (this.state.trialData.Study.ResultsSection ? this.state.trialData.Study.ResultsSection.ParticipantFlowModule.FlowPeriodList.FlowPeriod[0].FlowDropWithdrawList.FlowDropWithdraw[5].FlowReasonList.FlowReason[0].FlowReasonNumSubjects : "null") : null}
          rightRef={this.state.trialData ? (this.state.trialData.Study.ResultsSection ? this.state.trialData.Study.ResultsSection.ParticipantFlowModule.FlowPeriodList.FlowPeriod[0].FlowDropWithdrawList.FlowDropWithdraw[5].FlowReasonList.FlowReason[1].FlowReasonNumSubjects : "null") : null}

          leftWith={this.state.trialData ? (this.state.trialData.Study.ResultsSection ? this.state.trialData.Study.ResultsSection.ParticipantFlowModule.FlowPeriodList.FlowPeriod[0].FlowDropWithdrawList.FlowDropWithdraw[6].FlowReasonList.FlowReason[0].FlowReasonNumSubjects : "null") : null}
          rightWith={this.state.trialData ? (this.state.trialData.Study.ResultsSection ? this.state.trialData.Study.ResultsSection.ParticipantFlowModule.FlowPeriodList.FlowPeriod[0].FlowDropWithdrawList.FlowDropWithdraw[6].FlowReasonList.FlowReason[1].FlowReasonNumSubjects : "null") : null}
        />
        <TrialLink
          linkChoice={this.state.linkChoice}
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
    this.state= {data: {start: this.props.startDate, primary: this.props.primaryCompDate, estComp: this.props.estCompDate}};
  }

  componentDidUpdate(prevProps){
    if(this.props !== prevProps){
      this.setState({data: {start: this.props.startDate, primary: this.props.primaryCompDate, estComp: this.props.estCompDate}});
    }
  }

  render(){
    return(
      <div className="TrialSection" >
        <p>Actual Study Start Date:
          <span className="text">
            {" " + this.state.data.start}
          </span>
        </p>
        <p>Actual Primary Completion Date:
          <span className="text">
            {" " + this.state.data.primary}
          </span>
        </p>
        <p>Estimated Study Completion Date:
          <span className="text">
            {" " + this.state.data.estComp}
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
    this.state = {displayInCriteria: this.props.displayInCriteria, clusionStr: this.props.clusionStr}
  }

  //Triggers when prop from parent changes (dropdown toggle)
  componentDidUpdate(prevProps){
    if(this.props !== prevProps){
      this.setState({clusionStr: this.props.clusionStr});
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
        {this.state.displayInCriteria ? <CriteriaBox type="Inclusion" clusionStr={this.state.clusionStr}/> : null}
      </div>
    );
  }
}

//Same but for exlusion 
class TrialExCriteria extends React.Component {
  constructor(props){
    super(props);
    this.state = {displayOutCriteria: this.props.displayOutCriteria, clusionStr: this.props.clusionStr}
  }

  componentDidUpdate(prevProps){
    if(this.props !== prevProps){
      this.setState({clusionStr: this.props.clusionStr});
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
        {this.state.displayOutCriteria ? <CriteriaBox type="Exclusion" clusionStr={this.state.clusionStr}/> : null}
      </div>
    );
  }
}

class TrialOutcomeMeasures extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      displayOutMeasures: this.props.displayOutMeasures, 
      outcomeChoice: this.props.outcomeChoice,
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
        {this.state.displayOutMeasures ? <MeasuresBox data={JSON.stringify(this.state.data)} outcomeChoice={this.state.outcomeChoice} /> : null}
      </div>
    );
  }
}

class TrialResult extends React.Component {
  constructor(props){
    super(props);
    this.state = {displayResults: this.props.displayResults, 
                  resultChoice: this.props.resultChoice,
                  leftFlowGroupTitle: this.props.leftFlowGroupTitle,
                  rightFlowGroupTitle: this.props.rightFlowGroupTitle,
                  leftStarted: this.props.leftStarted,
                  rightStarted: this.props.rightStarted,
                  leftCompleted: this.props.leftCompleted,
                  rightCompleted: this.props.rightCompleted,
                  leftNotCompleted: this.props.leftNotCompleted,
                  rightNotCompleted: this.props.rightNotCompleted,

                  leftAdverse: this.props.leftAdverse,
                  rightAdverse: this.props.rightAdverse,
                  leftStatus: this.props.leftStatus,
                  rightStatus: this.props.rightStatus,
                  leftRand: this.props.leftRand,
                  rightRand: this.props.rightRand,
                  leftDeath: this.props.leftDeath,
                  rightDeath: this.props.rightDeath,
                  leftObject: this.props.leftObject,
                  rightObject: this.props.rightObject,
                  leftRef: this.props.leftRef,
                  rightRef: this.props.rightRef,
                  leftWith: this.props.leftWith,
                  rightWith: this.props.rightWith,
    };
  }

  componentDidUpdate(prevProps){
    if(prevProps.displayResults !== this.props.displayResults){
      this.setState({displayResults: this.props.displayResults});
    }

    if(this.props !== prevProps){
      this.setState({leftFlowGroupTitle: this.props.leftFlowGroupTitle, 
                     rightFlowGroupTitle: this.props.rightFlowGroupTitle,
                     leftStarted: this.props.leftStarted,
                     rightStarted: this.props.rightStarted,
                     leftCompleted: this.props.leftCompleted,
                     rightCompleted: this.props.rightCompleted,
                     leftNotCompleted: this.props.leftNotCompleted,
                     rightNotCompleted: this.props.rightNotCompleted,

                     leftAdverse: this.props.leftAdverse,
                     rightAdverse: this.props.rightAdverse,
                     leftStatus: this.props.leftStatus,
                     rightStatus: this.props.rightStatus,
                     leftRand: this.props.leftRand,
                     rightRand: this.props.rightRand,
                     leftDeath: this.props.leftDeath,
                     rightDeath: this.props.rightDeath,
                     leftObject: this.props.leftObject,
                     rightObject: this.props.rightObject,
                     leftRef: this.props.leftRef,
                     rightRef: this.props.rightRef,
                     leftWith: this.props.leftWith,
                     rightWith: this.props.rightWith,
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
        {this.state.displayResults ? <ResultTable resultChoice={this.state.resultChoice}
                                                  leftFlowGroupTitle={this.state.leftFlowGroupTitle}
                                                  rightFlowGroupTitle={this.state.rightFlowGroupTitle}
                                                  leftStarted={this.state.leftStarted}
                                                  rightStarted={this.state.rightStarted}
                                                  leftCompleted={this.state.leftCompleted}
                                                  rightCompleted={this.state.rightCompleted}
                                                  leftNotCompleted={this.state.leftNotCompleted}
                                                  rightNotCompleted={this.state.rightNotCompleted}

                                                  leftAdverse={this.state.leftAdverse}
                                                  rightAdverse={this.state.rightAdverse}
                                                  leftStatus={this.state.leftStatus}
                                                  rightStatus={this.state.rightStatus}
                                                  leftRand={this.state.leftRand}
                                                  rightRand={this.state.rightRand}
                                                  leftDeath={this.state.leftDeath}
                                                  rightDeath={this.state.rightDeath}
                                                  leftObject={this.state.leftObject}
                                                  rightObject={this.state.rightObject}
                                                  leftRef={this.state.leftRef}
                                                  rightRef={this.state.rightRef}
                                                  leftWith={this.state.leftWith}
                                                  rightWith={this.state.rightWith}
                                                  /> : null}
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
          <span className="text">
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

    this.state = {type: this.props.type, clusionStr: this.props.clusionStr};
    let str = this.props.clusionStr.split("\n");
    let inStr = inclusion(str)
    let exStr = exclusion(str)

    if (this.props.type === "Inclusion"){
      this.state = {criteria: inStr[this.props.criteria]};
    }
    else {
      this.state = {criteria: exStr[this.props.criteria]};
    }
  }
  componentDidUpdate(prevProps){
    if(this.props.clusionStr !== prevProps.clusionStr){
      this.setState({clusionStr: this.props.clusionStr});
    }
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

class ResultTable extends React.Component {
  constructor(props){
    super(props);
    this.state = { resultChoice: props.resultChoice,
                   leftFlowGroupTitle: props.leftFlowGroupTitle,
                   rightFlowGroupTitle: props.rightFlowGroupTitle,
                   leftStarted: props.leftStarted,
                   rightStarted: props.rightStarted,
                   leftCompleted: props.leftCompleted,
                   rightCompleted: props.rightCompleted,
                   leftNotCompleted: props.leftNotCompleted,
                   rightNotCompleted: props.rightNotCompleted,

                   leftAdverse: props.leftAdverse,
                   rightAdverse: props.rightAdverse,
                   leftStatus: props.leftStatus,
                   rightStatus: props.rightStatus,
                   leftRand: props.leftRand,
                   rightRand: props.rightRand,
                   leftDeath: props.leftDeath,
                   rightDeath: props.rightDeath,
                   leftObject: props.leftObject,
                   rightObject: props.rightObject,
                   leftRef: props.leftRef,
                   rightRef: props.rightRef,
                   leftWith: props.leftWith,
                   rightWith: props.rightWith,
                 }
  }
  render(){
    if(this.state.resultChoice === 0){
      return(
        <table>
          <tbody>
            <tr>
              <th>Arm/Group Title</th>
              <th>{this.state.leftFlowGroupTitle}</th>
              <th>{this.state.rightFlowGroupTitle}</th>
            </tr>
            <tr>
              <td>Started</td>
              <td>{this.state.leftStarted}</td>
              <td>{this.state.rightStarted}</td>
            </tr>
            <tr>
              <td>Completed</td>
              <td>{this.state.leftCompleted}</td>
              <td>{this.state.rightCompleted}</td>
            </tr>
            <tr>
              <td>Not Completed</td>
              <td>{this.state.leftNotCompleted}</td>
              <td>{this.state.rightNotCompleted}</td>
            </tr>
            <tr>
              <td>Adverse Event</td>
              <td>{this.state.leftAdverse}</td>
              <td>{this.state.rightAdverse}</td>
            </tr>
            <tr>
              <td>Global deterioration of health status</td>
              <td>{this.state.leftStatus}</td>
              <td>{this.state.rightStatus}</td>
            </tr>
            <tr>
              <td>Randomized Not Treated</td>
              <td>{this.state.leftRand}</td>
              <td>{this.state.rightRand}</td>
            </tr>
            <tr>
              <td>Death</td>
              <td>{this.state.leftDeath}</td>
              <td>{this.state.rightDeath}</td>
            </tr>
            <tr>
              <td>ObjectiveProgression+Progressive Disease</td>
              <td>{this.state.leftObject}</td>
              <td>{this.state.rightObject}</td>
            </tr>
            <tr>
              <td>Participant Refused toContinue Treatment</td>
              <td>{this.state.leftRef}</td>
              <td>{this.state.rightRef}</td>
            </tr>
            <tr>
              <td>Withdrawal by Subject</td>
              <td>{this.state.leftWith}</td>
              <td>{this.state.rightWith}</td>
            </tr>
          </tbody>
        </table>
      );
    }
    else{
      return(
        <table>
          <tbody>
            <tr>
              <th>Arm/Group Title</th>
              <th>{this.state.leftFlowGroupTitle}</th>
              <th>{this.state.rightFlowGroupTitle}</th>
            </tr>
            <tr>
              <td>Started</td>
              <td>{this.state.leftStarted}</td>
              <td>{this.state.rightStarted}</td>
            </tr>
            <tr>
              <td>Completed</td>
              <td>{this.state.leftCompleted}</td>
              <td>{this.state.rightCompleted}</td>
            </tr>
            <tr>
              <td>Not Completed</td>
              <td>{this.state.leftNotCompleted}</td>
              <td>{this.state.rightNotCompleted}</td>
            </tr>
            <tr>
              <td>Adverse Event</td>
              <td>{this.state.leftAdverse}</td>
              <td>{this.state.rightAdverse}</td>
            </tr>
            <tr>
              <td>Global deterioration of health status</td>
              <td>{this.state.leftStatus}</td>
              <td>{this.state.rightStatus}</td>
            </tr>
            <tr>
              <td>Randomized Not Treated</td>
              <td>{this.state.leftRand}</td>
              <td>{this.state.rightRand}</td>
            </tr>
            <tr>
              <td>Death</td>
              <td>{this.state.leftDeath}</td>
              <td>{this.state.rightDeath}</td>
            </tr>
            <tr>
              <td>ObjectiveProgression+Progressive Disease</td>
              <td>{this.state.leftObject}</td>
              <td>{this.state.rightObject}</td>
            </tr>
            <tr>
              <td>Participant Refused toContinue Treatment</td>
              <td>{this.state.leftRef}</td>
              <td>{this.state.rightRef}</td>
            </tr>
            <tr>
              <td>Withdrawal by Subject</td>
              <td>{this.state.leftWith}</td>
              <td>{this.state.rightWith}</td>
            </tr>
          </tbody>
        </table>
      );
    }
  }
}

class MeasuresBox extends React.Component {
  constructor(props){
    super(props);
    let numPrimary = JSON.parse(this.props.data).PrimaryOutcomeList.PrimaryOutcome.length;
    let numSecondary = JSON.parse(this.props.data).SecondaryOutcomeList.SecondaryOutcome.length
    let primaryOutcomes = [];
    let secondaryOutcomes = [];
    console.log('test');
    for(let i = 0; i < numPrimary; i++){
      primaryOutcomes.push(
        <IndividualMeasure 
        data={JSON.stringify(JSON.parse(this.props.data).PrimaryOutcomeList.PrimaryOutcome[i])}
        type="primary"
        />
      );

    }
    for(let i = 0; i < numSecondary; i++){
      secondaryOutcomes.push(
        <IndividualMeasure 
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
    this.state = {type: this.props.type,
                  clusionStr: this.props.clusionStr,
                };
    
  }
  render(){
    let i;
    const allCriteria = [];
    //Right now we are just arbitrarily generating 12 criteria for each section
    //Easiest way to put in actual criteria for now would probably be to 
    //hardcode an array of criteria so you can pass the text as a prop using the index (like 'criteria' and 'type').
    for (i = 0; i < 20; i++) { 
      allCriteria.push(<SingleCriteria criteria={i} type={this.state.type} clusionStr={this.props.clusionStr} key={"criteria" + i}/>)
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

