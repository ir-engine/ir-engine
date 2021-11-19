import { Config } from '@xrengine/common/src/config'
import React from 'react'
import { Route, Switch, Redirect } from 'react-router-dom'

const locationPage = React.lazy(() => import('./[locationName]'))
console.log('location page')
const LocationRoutes = (props) => {
  return (
    <Switch>
      <Route path="/location/:locationName" component={locationPage} />
      <Redirect path="/location" to={'/location/' + Config.publicRuntimeConfig.lobbyLocationName} />
    </Switch>
  )
}

export default LocationRoutes
