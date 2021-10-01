import AppBar from '@material-ui/core/AppBar'
import { selectFriendState } from '@xrengine/client-core/src/social/reducers/friend/selector'
import { getFriends, unfriend } from '@xrengine/client-core/src/social/reducers/friend/service'
import { selectSocialGroupState } from '@xrengine/client-core/src/social/reducers/group/selector'
import {
  createGroup,
  getGroups,
  patchGroup,
  removeGroup
} from '@xrengine/client-core/src/social/reducers/group/service'
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
    friendState: selectFriendState(state),
    groupState: selectSocialGroupState(state),
    partyState: selectPartyState(state)
  }
}

const mapDispatchToProps = (dispatch: Dispatch): any => ({
  getFriends: bindActionCreators(getFriends, dispatch),
  unfriend: bindActionCreators(unfriend, dispatch),
  getGroups: bindActionCreators(getGroups, dispatch),
  createGroup: bindActionCreators(createGroup, dispatch),
  patchGroup: bindActionCreators(patchGroup, dispatch),
  removeGroup: bindActionCreators(removeGroup, dispatch),
  getParty: bindActionCreators(getParty, dispatch),
  createParty: bindActionCreators(createParty, dispatch),
  removeParty: bindActionCreators(removeParty, dispatch),
  removePartyUser: bindActionCreators(removePartyUser, dispatch)
})

interface Props {
  auth: any
  friendState?: any
  getFriends?: any
  unfriend?: any
  groupState?: any
  groupUserState?: any
  getGroups?: any
  createGroup?: any
  patchGroup?: any
  removeGroup?: any
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
