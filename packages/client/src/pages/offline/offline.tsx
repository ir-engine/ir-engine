import React, { useEffect } from 'react'
import { Redirect, Route, Switch } from 'react-router-dom'

const locationPage = React.lazy(() => import('./[locationName]'))

const LocationRoutes = () => {
  useEffect(() => {
    console.log('offline route loaded')
  }, [])
  return (
    <Switch>
      <Route exact path="/offline/:projectName/:sceneName" component={locationPage} />
      <Route exact path="/offline/:locationName" component={locationPage} />
      <Redirect path="/offline" to={'/'} />
    </Switch>
  )
}

export default LocationRoutes
