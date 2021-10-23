import { Config } from '@xrengine/common/src/config'
import React from 'react'
import { Route, Switch, Redirect } from 'react-router-dom'

const LocationPage = (props) => {
  return (
    <Switch>
      <Route path="/location/:locationName" component={React.lazy(() => import('./[locationName]'))} />
      <Redirect path="/location" to={'/location/' + Config.publicRuntimeConfig.lobbyLocationName} />
    </Switch>
  )
}

export default LocationPage
