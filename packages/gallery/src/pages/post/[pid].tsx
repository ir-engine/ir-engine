import React from 'react'
import { useLocation } from 'react-router-dom'

export default function PostPage() {
  const pid = new URLSearchParams(useLocation().search).get('pid').toString()

  return (
    <div className="container">
      <div>{pid}</div>
    </div>
  )
}
