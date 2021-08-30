import React from 'react'
import { Link } from 'react-router-dom'

export function Clickable({ href, children, ...props }: any) {
  return (
    <Link to={href || ''}>
      <div {...props} style={{ cursor: 'pointer' }}>
        {children}
      </div>
    </Link>
  )
}
