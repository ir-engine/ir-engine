import { Config } from '@xrengine/common/src/config'
import { createEngine } from '@xrengine/engine/src/ecs/classes/Engine'
import React, { useEffect } from 'react'
import { Route, Switch, Redirect } from 'react-router-dom'

const locationPage = React.lazy(() => import('./[locationName]'))

const LocationRoutes = (props) => {
  useEffect(() => {
    createEngine()
  }, [])

  return (
    <Switch>
      <Route exact path="/location/:projectName/:sceneName" component={locationPage} />
      <Route exact path="/location/:locationName" component={locationPage} />
      <Redirect path="/location" to={'/location/' + Config.publicRuntimeConfig.lobbyLocationName} />
    </Switch>
  )
}

export default LocationRoutes
