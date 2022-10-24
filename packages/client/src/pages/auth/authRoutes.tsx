import React from 'react'
import { Route, Switch } from 'react-router-dom'

import $confirm from './confirm'
import $forgotpassword from './forgotpassword'
import $magiclink from './magiclink'
import $discord from './oauth/discord'
import $facebook from './oauth/facebook'
import $github from './oauth/github'
import $google from './oauth/google'
import $linkedin from './oauth/linkedin'
import $twitter from './oauth/twitter'

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
