import React from 'react'
import { useLocation } from 'react-router-dom'
import AppHeader from '@xrengine/social/src/components/Header'

export default function PostPage() {
  const pid = new URLSearchParams(useLocation().search).get('pid').toString()

  return (
    <div className="container">
      <AppHeader />
      <div>{pid}</div>
    </div>
  )
}
