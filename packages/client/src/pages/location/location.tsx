import React from 'react'
import { Redirect, Route, Switch } from 'react-router-dom'

const locationPage = React.lazy(() => import('./[locationName]'))

const LocationRoutes = () => {
  return (
    <Switch>
      <Route exact path="/location/:projectName/:sceneName" component={locationPage} />
      <Route exact path="/location/:locationName" component={locationPage} />
      <Redirect path="/location" to={'/'} />
    </Switch>
  )
}

export default LocationRoutes
