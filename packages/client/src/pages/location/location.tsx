import React from 'react'
import { Route, Switch, Redirect } from 'react-router-dom'

const locationPage = React.lazy(() => import('./[locationName]'))

const LocationRoutes = (props) => {
  return (
    <Switch>
      <Route exact path="/location/:projectName/:sceneName" component={locationPage} />
      <Route exact path="/location/:locationName" component={locationPage} />
      <Redirect path="/location" to={'/location/' + globalThis.process.env['VITE_LOBBY_LOCATION_NAME']} />
    </Switch>
  )
}

export default LocationRoutes
