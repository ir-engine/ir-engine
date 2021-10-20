import React from 'react'
import { BrowserRouter as Router, Route, Switch } from /*, Link*/ 'react-router-dom'

import LanderPage from './components/LandingPage/LanderPage'
import LoginPage from './components/LoginPage/LoginPage'
import TeamRegistrationPage from './components/TeamRegistration/TeamRegistrationPage'
import InitialMainContentPage from './components/InitialMainContent/InitialMainContentPage'

import { ThemeProvider, createTheme } from '@mui/material/styles'

import './styles/globals.css'

const theme = createTheme()

function App(): any {
  return (
    <>
      <ThemeProvider theme={theme}>
        <Router>
          <Switch>
            <Route path="/msa/lander" exact component={LanderPage} />
            <Route path="/msa/login" component={LoginPage} />
            <Route path="/msa/team-registration" component={TeamRegistrationPage} />
            <Route path="/msa/initial-main-content" exact component={InitialMainContentPage} />
          </Switch>
        </Router>
      </ThemeProvider>
    </>
  )
}

export default App
