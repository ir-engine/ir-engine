import React from 'react'
import { Route, Switch } from 'react-router-dom'

const InventoryPage = (props) => {
  return (
    <Switch>
      <Route
        path="/inventory/:id"
        component={React.lazy(() => import('@xrengine/client-core/src/user/components/Inventory/inventory'))}
      />
    </Switch>
  )
}

export default InventoryPage
