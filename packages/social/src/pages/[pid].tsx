import AppHeader from '@xrengine/social/src/components/Header'
import { useLocation } from 'react-router-dom'
import React from 'react'

export default function ProfilePage() {
  const pid = new URLSearchParams(useLocation().search).get('pid')?.toString()

  return (
    <div className="container">
      <AppHeader />
      <div>{pid}</div>
    </div>
  )
}
