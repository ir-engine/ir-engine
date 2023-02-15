import React from 'react'
import { Redirect, Route, Routes } from 'react-router-dom'

const locationPage = React.lazy(() => import('./[locationName]'))

const LocationRoutes = () => {
  return (
    <Routes>
      <Route exact path="/location/:projectName/:sceneName" component={locationPage} />
      <Route exact path="/location/:locationName" component={locationPage} />
      <Redirect path="/location" to={'/'} />
    </Routes>
  )
}

export default LocationRoutes
