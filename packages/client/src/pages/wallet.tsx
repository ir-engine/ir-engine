import React from 'react'
import { Route, Switch } from 'react-router-dom'

const WalletPage = (props) => {
  return (
    <Switch>
      <Route
        path="/wallet/:id"
        component={React.lazy(() => import('@xrengine/client-core/src/user/components/Wallet/wallet'))}
      />
    </Switch>
  )
}

export default WalletPage
