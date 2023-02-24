import React from 'react'
import { Navigate, Route } from 'react-router-dom'

/**
 *
 * @param {any} to
 * @param {any} rest
 * @returns
 */
export function RedirectRoute({ to, ...rest }) {
  return <Route {...rest} element={<Navigate to={to} />} />
}

export default RedirectRoute
