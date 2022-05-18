import React from 'react'
import { Route, Switch } from 'react-router-dom'

const $matchmaking = React.lazy(() => import('./matchmaking'))

const ExampleRoutes = () => {
  return (
    <>
      <Switch>
        <Route path="/examples/matchmaking" component={$matchmaking} />
      </Switch>
    </>
  )
}

export default ExampleRoutes
