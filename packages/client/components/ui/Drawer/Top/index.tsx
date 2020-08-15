import React, { useState, useEffect } from 'react'
import { bindActionCreators, Dispatch } from 'redux'
import { connect } from 'react-redux'
import { selectFriendState } from '../../../../redux/friend/selector'
import { selectGroupState } from '../../../../redux/group/selector'
import { selectPartyState } from '../../../../redux/party/selector'

import {
    getFriends,
    unfriend
} from '../../../../redux/friend/service'
import {
    getGroups,
    createGroup,
    patchGroup,
    removeGroup
} from '../../../../redux/group/service'
import {
    getParty,
    createParty,
    removeParty,
    removePartyUser
} from '../../../../redux/party/service'
import {User} from "../../../../../common/interfaces/User";
import { AppBar } from '@material-ui/core'


const mapStateToProps = (state: any): any => {
    return {
        friendState: selectFriendState(state),
        groupState: selectGroupState(state),
        partyState: selectPartyState(state),
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
    removePartyUser: bindActionCreators(removePartyUser, dispatch),
})

interface Props {
    auth: any,
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
    const {
        auth,
        friendState,
        getFriends,
        unfriend,
        groupState,
        groupUserState,
        getGroups,
        createGroup,
        patchGroup,
        removeGroup,
        getGroupUsers,
        getSelfGroupUser,
        removeGroupUser,
        partyState,
        getParty,
        createParty,
        removeParty,
        getPartyUsers,
        getSelfPartyUser,
        removePartyUser,
    } = props

    const user = auth.get('user') as User
    const friendSubState = friendState.get('friends')
    const friends = friendSubState.get('friends')
    const groupSubState = groupState.get('groups')
    const groups = groupSubState.get('groups')
    const groupUserSubState = groupUserState.get('groupUsers')
    const groupUsers = groupUserSubState.get('groupUsers')
    const party = partyState.get('party')
    const partyUserSubState = partyState.get('partyUsers')
    const partyUsers = partyUserSubState.get('partyUsers')
    const selfPartyUser = partyState.get('selfPartyUser')
    return (
        <div className="left-drawer">
            <AppBar position="fixed" className="drawer">
            </AppBar>
        </div>
    )
}

export default connect(mapStateToProps, mapDispatchToProps)(TopDrawer)
