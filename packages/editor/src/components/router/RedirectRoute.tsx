import React from 'react'
import { Route, Redirect } from 'react-router-dom'

/**
 *
 * @author Robert Long
 * @param {any} to
 * @param {any} rest
 * @returns
 */
export function RedirectRoute({ to, ...rest }) {
  return <Route {...rest} render={() => <Redirect to={to} />} />
}

export default RedirectRoute
