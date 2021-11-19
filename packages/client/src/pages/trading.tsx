import React from 'react'
import { Route, Switch } from 'react-router-dom'

const TradingPage = (props) => {
  console.log("hiii")
  return (
    <Switch>
      <Route
        path="/trading/:id"
        component={React.lazy(() => import('@xrengine/client-core/src/user/components/Trading/trading'))}
      />
    </Switch>
  )
}

export default TradingPage
