import React, {useState, useEffect, Fragment} from 'react'
import { bindActionCreators, Dispatch } from 'redux'
import { connect } from 'react-redux'
import { selectAuthState } from '../../../../redux/auth/selector'
import { selectFriendState } from '../../../../redux/friend/selector'
import { selectGroupState } from '../../../../redux/group/selector'
import { selectGroupUserState } from '../../../../redux/group-user/selector'
import { selectPartyState } from '../../../../redux/party/selector'
import './style.scss'

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
    getGroupUsers,
    getSelfGroupUser,
    removeGroupUser
} from '../../../../redux/group-user/service'
import {
    getParty,
    createParty,
    removeParty,
    getPartyUsers,
    getSelfPartyUser,
    removePartyUser,
    forcePartyUserRefresh
} from '../../../../redux/party/service'
import { User } from '../../../../../shared/interfaces/User'
import {
    Avatar,
    Button,
    Divider,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    SwipeableDrawer,
    Tab,
    Tabs
} from '@material-ui/core'
import {
    Group,
    GroupWork,
    SupervisedUserCircle
} from "@material-ui/icons";



const mapStateToProps = (state: any): any => {
    return {
        authState: selectAuthState(state),
        friendState: selectFriendState(state),
        groupState: selectGroupState(state),
        groupUserState: selectGroupUserState(state),
        partyState: selectPartyState(state),
    }
}

const mapDispatchToProps = (dispatch: Dispatch): any => ({
    getFriends: bindActionCreators(getFriends, dispatch),
    unfriend: bindActionCreators(unfriend, dispatch),
    getGroups: bindActionCreators(getGroups, dispatch),
    getGroupUsers: bindActionCreators(getGroupUsers, dispatch),
    getSelfGroupUser: bindActionCreators(getSelfGroupUser, dispatch),
    createGroup: bindActionCreators(createGroup, dispatch),
    patchGroup: bindActionCreators(patchGroup, dispatch),
    removeGroup: bindActionCreators(removeGroup, dispatch),
    removeGroupUser: bindActionCreators(removeGroupUser, dispatch),
    getParty: bindActionCreators(getParty, dispatch),
    getPartyUsers: bindActionCreators(getPartyUsers, dispatch),
    getSelfPartyUser: bindActionCreators(getSelfPartyUser, dispatch),
    createParty: bindActionCreators(createParty, dispatch),
    removeParty: bindActionCreators(removeParty, dispatch),
    removePartyUser: bindActionCreators(removePartyUser, dispatch),
})

interface Props {
    leftDrawerOpen: boolean,
    setLeftDrawerOpen: any,
    authState?: any
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

const LeftDrawer = (props: Props): any => {
    const {
        authState,
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
        setLeftDrawerOpen,
        leftDrawerOpen
    } = props

    const user = authState.get('user') as User
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
    const [tabIndex, setTabIndex] = useState(0)
    const [ friendDeletePending, setFriendDeletePending ] = useState('')

    useEffect(() => {
        if (friendState.get('updateNeeded') === true) {
            getFriends()
        }
    }, [friendState]);

    const showFriendDeleteConfirm = (e, friendId) => {
        e.preventDefault()
        setFriendDeletePending(friendId)
    }

    const cancelFriendDelete = (e) => {
        e.preventDefault()
        setFriendDeletePending('')
    }

    const confirmFriendDelete = (e, friendId) => {
        e.preventDefault()
        setFriendDeletePending('')
        unfriend(friendId)
    }

    const previousFriendsPage = (): void => {
        getFriends(null, friendSubState.get('skip') - friendSubState.get('limit'))
    }

    const nextFriendsPage = (): void => {
        getFriends(null, friendSubState.get('skip') + friendSubState.get('limit'))
    }

    const handleChange = (event: any, newValue: number): void => {
        event.preventDefault()
        setTabIndex(newValue)
    }

    const openDetails = (type, object) => {
        console.log(type)
        console.log(object)
    }

    return (
        <div className="left-drawer">
            <SwipeableDrawer
                BackdropProps={{ invisible: true }}
                anchor="left"
                open={props.leftDrawerOpen === true}
                onClose={() => {setLeftDrawerOpen(false)}}
                onOpen={() => {}}
            >
                    <Tabs
                        value={tabIndex}
                        onChange={handleChange}
                        variant="fullWidth"
                        indicatorColor="primary"
                        textColor="secondary"
                        aria-label="People Type"
                    >
                        <Tab
                            icon={<SupervisedUserCircle style={{ fontSize: 20}} />}
                            label="Friends"
                        />
                        <Tab
                            icon={<Group style={{ fontSize: 20}} />}
                            label="Groups"
                        />
                        <Tab
                            icon={<GroupWork style={{ fontSize: 20}} />}
                            label="Party"
                        />
                    </Tabs>
                <Divider/>
                <List>
                    { friends && friends.length > 0 && friends.sort((a, b) => a.name - b.name).map((friend, index) => {
                        return <div>
                            <ListItem
                                key={friend.id}
                                className="selectable"
                                onClick={() => {openDetails('friend', friend)}}
                            >
                                <ListItemAvatar>
                                    <Avatar src={friend.avatarUrl}/>
                                </ListItemAvatar>
                                <ListItemText primary={friend.name}/>
                                {friendDeletePending !== friend.id && <Button onClick={(e) => showFriendDeleteConfirm(e, friend.id)}>Unfriend</Button> }
                                {friendDeletePending === friend.id &&
                                <div>
                                    <Button variant="contained"
                                            color="primary"
                                            onClick={(e) => confirmFriendDelete(e, friend.id)}
                                    >
                                        Unfriend
                                    </Button>
                                    <Button variant="contained"
                                            color="secondary"
                                            onClick={(e) => cancelFriendDelete(e)}
                                    >
                                        Cancel
                                    </Button>
                                </div>
                                }
                            </ListItem>
                            { index < friends.length - 1 && <Divider/> }
                        </div>
                        })
                    }
                </List>
            </SwipeableDrawer>
        </div>
    )
}

export default connect(mapStateToProps, mapDispatchToProps)(LeftDrawer)
