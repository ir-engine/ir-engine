import React from 'react'
import { Redirect, Route } from 'react-router-dom'

/**
 *
 * @param {any} to
 * @param {any} rest
 * @returns
 */
export function RedirectRoute({ to, ...rest }) {
  return <Route {...rest} render={() => <Redirect to={to} />} />
}

export default RedirectRoute
