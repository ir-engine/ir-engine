import React from 'react'
import { ContextMenuTrigger } from '../layout/ContextMenu'

/**
 *
 * @author Robert Long
 * @param {any} className
 * @param {any} attributes
 * @param {any} children
 * @param {any} rest
 * @returns
 */
export function StylableContextMenuTrigger({ className, attributes, children, ...rest }) {
  return (
    <ContextMenuTrigger {...rest} attributes={{ className, ...attributes }}>
      {children}
    </ContextMenuTrigger>
  )
}

export default StylableContextMenuTrigger
