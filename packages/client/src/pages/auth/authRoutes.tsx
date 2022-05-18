import React from 'react'
import { Route, Switch } from 'react-router-dom'

const $discord = React.lazy(() => import('./oauth/discord'))
const $facebook = React.lazy(() => import('./oauth/facebook'))
const $github = React.lazy(() => import('./oauth/github'))
const $google = React.lazy(() => import('./oauth/google'))
const $linkedin = React.lazy(() => import('./oauth/linkedin'))
const $twitter = React.lazy(() => import('./oauth/twitter'))
const $confirm = React.lazy(() => import('./confirm'))
const $forgotpassword = React.lazy(() => import('./forgotpassword'))
const $magiclink = React.lazy(() => import('./magiclink'))

const AuthRoutes = () => {
  return (
    <Switch>
      <Route path="/auth/oauth/discord" component={$discord} />
      <Route path="/auth/oauth/facebook" component={$facebook} />
      <Route path="/auth/oauth/github" component={$github} />
      <Route path="/auth/oauth/google" component={$google} />
      <Route path="/auth/oauth/linkedin" component={$linkedin} />
      <Route path="/auth/oauth/twitter" component={$twitter} />
      <Route path="/auth/confirm" component={$confirm} />
      <Route path="/auth/forgotpassword" component={$forgotpassword} />
      <Route path="/auth/magiclink" component={$magiclink} />
    </Switch>
  )
}

export default AuthRoutes
