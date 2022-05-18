import React from 'react'
import { Route } from 'react-router'
import Dashboard from './user/components/Dashboard/Dashboard'

const PrivateRoute = ({ component: Component, ...rest }) => {
  return (
    <Route
      {...rest}
      render={(props) => (
        <Dashboard>
          <Component {...props} />
        </Dashboard>
      )}
    />
  )
}

export default PrivateRoute
