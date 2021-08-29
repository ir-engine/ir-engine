import React from 'react'
import Header from './Header'

export function Layout({ children, user = null }) {
  return (
    <div className="container">
      <Header />
      <div className="homepage-container flex justify-center">{children}</div>
    </div>
  )
}
export {}
