import { useLocation } from 'react-router-dom'
import React from 'react'
import AppHeader from '../components/Header'
import FeedMenu from '../components/FeedMenu'
import UploadButton from '../components/UploadButton'

export default function ProfilePage() {
  const pid = new URLSearchParams(useLocation().search).get('pid')?.toString()

  return (
    <div className="container">
      <AppHeader title={'CREATOR'} />
      <FeedMenu />
      <div>{pid}</div>
    </div>
  )
}
