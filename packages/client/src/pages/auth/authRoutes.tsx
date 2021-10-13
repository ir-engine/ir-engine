import React from 'react'
import { Route, Switch } from 'react-router-dom'

const AuthRoutes = () => {
  return (
    <Switch>
      <Route path="/auth/oauth/facebook" component={React.lazy(() => import('./oauth/facebook'))} />
      <Route path="/auth/oauth/github" component={React.lazy(() => import('./oauth/github'))} />
      <Route path="/auth/oauth/google" component={React.lazy(() => import('./oauth/google'))} />
      <Route path="/auth/oauth/linkedin" component={React.lazy(() => import('./oauth/linkedin'))} />
      <Route path="/auth/oauth/twitter" component={React.lazy(() => import('./oauth/twitter'))} />
      <Route path="/auth/confirm" component={React.lazy(() => import('./confirm'))} />
      <Route path="/auth/forgotpassword" component={React.lazy(() => import('./forgotpassword'))} />
      <Route path="/auth/magiclink" component={React.lazy(() => import('./magiclink'))} />
    </Switch>
  )
}

export default AuthRoutes
