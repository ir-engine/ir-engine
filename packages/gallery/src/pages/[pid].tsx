import { useLocation } from 'react-router-dom'
import React from 'react'

export default function ProfilePage() {
  const pid = new URLSearchParams(useLocation().search).get('pid')?.toString()

  return (
    <div className="container">
      <div>{pid}</div>
    </div>
  )
}
