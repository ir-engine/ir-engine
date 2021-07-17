import React from 'react'
import { Route } from 'react-router'
import Dashboard from '@xrengine/client-core/src/user/components/Dashboard/Dashboard'
import PropTypes from 'prop-types'

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

PrivateRoute.prototype = { component: PropTypes.any }

export default PrivateRoute
