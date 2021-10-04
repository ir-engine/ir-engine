import AppBar from '@material-ui/core/AppBar'

import { selectPartyState } from '@xrengine/client-core/src/social/reducers/party/selector'
import {
  createParty,
  getParty,
  removeParty,
  removePartyUser
} from '@xrengine/client-core/src/social/reducers/party/service'
import React from 'react'
import { connect } from 'react-redux'
import { bindActionCreators, Dispatch } from 'redux'

const mapStateToProps = (state: any): any => {
  return {
    partyState: selectPartyState(state)
  }
}

const mapDispatchToProps = (dispatch: Dispatch): any => ({
  getParty: bindActionCreators(getParty, dispatch),
  createParty: bindActionCreators(createParty, dispatch),
  removeParty: bindActionCreators(removeParty, dispatch),
  removePartyUser: bindActionCreators(removePartyUser, dispatch)
})

interface Props {
  auth: any
  groupUserState?: any
  getGroupUsers?: any
  getSelfGroupUser?: any
  removeGroupUser?: any
  partyState?: any
  getParty?: any
  createParty?: any
  removeParty?: any
  getPartyUsers?: any
  getSelfPartyUser?: any
  removePartyUser?: any
}

const TopDrawer = (props: Props): any => {
  const {} = props

  return (
    <div className="top-drawer">
      <AppBar position="fixed" className="drawer" />
    </div>
  )
}

export default connect(mapStateToProps, mapDispatchToProps)(TopDrawer)
