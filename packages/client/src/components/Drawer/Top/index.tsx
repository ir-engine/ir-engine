import AppBar from '@material-ui/core/AppBar'

import { PartyService } from '@xrengine/client-core/src/user/state/PartyService'
import React from 'react'
import { connect } from 'react-redux'
import { bindActionCreators, Dispatch } from 'redux'

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
