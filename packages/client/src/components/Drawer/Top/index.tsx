import AppBar from '@mui/material/AppBar'
import React from 'react'

interface Props {
  auth: any
  groupUserState?: any
  getGroupUsers?: any
  getSelfGroupUser?: any
  removeGroupUser?: any
  createParty?: any
  getPartyUsers?: any
  getSelfPartyUser?: any
}

const TopDrawer = (props: Props): any => {
  const {} = props

  return (
    <div className="top-drawer">
      <AppBar position="fixed" className="drawer" />
    </div>
  )
}

export default TopDrawer
