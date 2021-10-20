import React from 'react'
import { Route, Switch } from 'react-router-dom'
import TeamManagementView from './components/TeamManagementView/TeamManagementView'
import PlayView from './components/PlayView/PlayView'

// import LanderPage from './components/NewComponents/components/LandingPage/LanderPage'
// import LoginPage from './components/NewComponents/components/LoginPage/LoginPage'
// import TeamRegistrationPage from './components/NewComponents/components/TeamRegistration/TeamRegistrationPage'
// import InitialMainContentPage from './components/NewComponents/components/InitialMainContent/InitialMainContentPage'

const MSA = (): any => {
  return (
    <>
      <Switch>
        <Route path="/msa" exact component={PlayView} />
        {/* <Route path="/msa/lander" exact component={LanderPage} />
        <Route path="/msa/login" exact component={LoginPage} />
  <Route path="/msa/team-registration" exact component={TeamRegistrationPage} /> 
        <Route path="/msa/initial-main-component" exact component={InitialMainContentPage} /> */}
        <Route
          path="/msa/manage-team-staked"
          render={(props) => <TeamManagementView isPlayStaked={true} {...props} />}
        />
        <Route path="/msa/manage-team-unstaked" component={TeamManagementView} />
        <Route path="/msa/manage-team-tournament" component={TeamManagementView} />
      </Switch>
    </>
  )
}

export default MSA
