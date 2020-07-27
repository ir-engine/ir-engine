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
    updateInviteTarget
} from '../../../../redux/invite/service'
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
    removePartyUser
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
    Tabs,
    TextField
} from '@material-ui/core'
import {
    Add,
    ArrowLeft,
    Delete,
    Forum,
    Group,
    GroupWork,
    Mail,
    PersonAdd,
    SupervisedUserCircle
} from "@material-ui/icons";
import _ from 'lodash'


const mapStateToProps = (state: any): any => {
    return {
        authState: selectAuthState(state),
        friendState: selectFriendState(state),
        groupState: selectGroupState(state),
        groupUserState: selectGroupUserState(state),
        partyState: selectPartyState(state)
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
    updateInviteTarget: bindActionCreators(updateInviteTarget, dispatch)
})

interface Props {
    leftDrawerOpen: boolean
    setLeftDrawerOpen: any
    setRightDrawerOpen: any
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
    setBottomDrawerOpen: any
    updateInviteTarget?: any
}

const initialSelectedUserState = {
    id: '',
    name: '',
    userRole: '',
    identityProviders: [],
    relationType: {},
    inverseRelationType: {},
    subscription: {},
    subscriptions: [],
    avatarUrl: ''
}

const initialGroupForm = {
    id: '',
    name: '',
    description: ''
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
        leftDrawerOpen,
        setRightDrawerOpen,
        setBottomDrawerOpen,
        updateInviteTarget
    } = props

    const user = authState.get('user') as User
    const friendSubState = friendState.get('friends')
    const friends = friendSubState.get('friends')
    const groupSubState = groupState.get('groups')
    const groups = groupSubState.get('groups')
    const groupUserSubState = groupUserState.get('groupUsers')
    const groupUsers = groupUserSubState.get('groupUsers')
    const selfGroupUser = groupUserState.get('selfGroupUser')
    const party = partyState.get('party')
    const partyUserSubState = partyState.get('partyUsers')
    const partyUsers = partyUserSubState.get('partyUsers')
    const selfPartyUser = partyState.get('selfPartyUser')
    const [tabIndex, setTabIndex] = useState(0)
    const [ friendDeletePending, setFriendDeletePending ] = useState('')
    const [ groupDeletePending, setGroupDeletePending ] = useState('')
    const [ groupUserDeletePending, setGroupUserDeletePending ] = useState('')
    const [ partyDeletePending, setPartyDeletePending ] = useState(false)
    const [ detailsOpen, setDetailsOpen ] = useState(false)
    const [ detailsType, setDetailsType ] = useState('')
    const [ selectedUser, setSelectedUser ] = useState(initialSelectedUserState)
    const [ selectedGroup, setSelectedGroup ] = useState(initialGroupForm)
    const [ groupForm, setGroupForm ] = useState(initialGroupForm)
    const [ groupFormMode, setGroupFormMode ] = useState('')
    const [ groupFormOpen, setGroupFormOpen ] = useState(false)
    const [ partyUserDeletePending, setPartyUserDeletePending] = useState('')

    useEffect(() => {
        if (friendState.get('updateNeeded') === true && friendState.get('getFriendsInProgress') !== true) {
            getFriends(0)
        }
    }, [friendState]);

    useEffect(() => {
        if (groupState.get('updateNeeded') === true && groupState.get('getGroupsInProgress') !== true) {
            getGroups(0)
        }
    }, [groupState]);

    useEffect(() => {
        if (groupState.get('updateNeeded') === false && selectedGroup.id != null && selectedGroup.id.length > 0) {
            if (groupUserState.get('getGroupUsersInProgress') !== true && groupUserState.get('updateNeeded') === true) {
                getGroupUsers(selectedGroup.id)
            }
            if (groupUserState.get('getSelfGroupUserInProgress') !== true && groupUserState.get('selfUpdateNeeded') === true) {
                getSelfGroupUser(selectedGroup.id)
            }
        }
    }, [groupUserState, groupState, selectedGroup]);

    useEffect(() => {
        if (partyState.get('updateNeeded') === true) {
            getParty()
        }
    }, [partyState]);

    useEffect(() => {
        if (party != null  && partyState.get('updateNeeded') === false) {
            if (partyState.get('getSelfPartyUserInProgress') !== true && partyState.get('selfUpdateNeeded') === true) {
                getSelfPartyUser(party.id)
            }
            if (partyState.get('getPartyUsersInProgress') !== true && partyState.get('partyUsersUpdateNeeded') === true) {
                getPartyUsers(party.id)
            }
        }
    }, [partyState]);

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

    const nextFriendsPage = (): void => {
        if ((friendSubState.get('skip') + friendSubState.get('limit')) < friendSubState.get('total')) {
            getFriends(friendSubState.get('skip') + friendSubState.get('limit'))
        }
    }

    const showGroupDeleteConfirm = (e, groupId) => {
        e.preventDefault()
        setGroupDeletePending(groupId)
    }

    const cancelGroupDelete = (e) => {
        e.preventDefault()
        setGroupDeletePending('')
    }

    const confirmGroupDelete = (e, groupId) => {
        e.preventDefault()
        setGroupDeletePending('')
        removeGroup(groupId)
        setSelectedGroup(initialGroupForm)
        setDetailsOpen(false)
        setDetailsType('')
    }

    const nextGroupsPage = (): void => {
        if ((groupSubState.get('skip') + groupSubState.get('limit')) < groupSubState.get('total')) {
            getGroups(groupSubState.get('skip') + groupSubState.get('limit'))
        }
    }

    const showGroupUserDeleteConfirm = (e, groupUserId) => {
        e.preventDefault()
        setGroupUserDeletePending(groupUserId)
    }

    const cancelGroupUserDelete = (e) => {
        e.preventDefault()
        setGroupUserDeletePending('')
    }

    const confirmGroupUserDelete = (e, groupUserId) => {
        e.preventDefault()
        const groupUser = _.find(groupUsers, (groupUser) => groupUser.id === groupUserId)
        setGroupUserDeletePending('')
        removeGroupUser(groupUserId)
        if (groupUser.userId === user.id) {
            setSelectedGroup(initialGroupForm)
            setDetailsOpen(false)
            setDetailsType('')
        }
    }

    const nextGroupUsersPage = (): void => {
        if ((groupUserSubState.get('skip') + groupUserSubState.get('limit')) < groupUserSubState.get('total')) {
            getGroupUsers(groupUserSubState.get('skip') + groupUserSubState.get('limit'))
        }
    }

    const showPartyDeleteConfirm = (e) => {
        e.preventDefault()
        setPartyDeletePending(true)
    }

    const cancelPartyDelete = (e) => {
        e.preventDefault()
        setPartyDeletePending(false)
    }

    const confirmPartyDelete = (e, partyId) => {
        e.preventDefault()
        setPartyDeletePending(false)
        removeParty(partyId)
    }

    const showPartyUserDeleteConfirm = (e, partyUserId) => {
        e.preventDefault()
        setPartyUserDeletePending(partyUserId)
    }

    const cancelPartyUserDelete = (e) => {
        e.preventDefault()
        setPartyUserDeletePending('')
    }

    const confirmPartyUserDelete = (e, partyUserId) => {
        e.preventDefault()
        setPartyUserDeletePending('')
        removePartyUser(partyUserId)
    }

    const nextPartyUsersPage = (): void => {
        if ((partyUserSubState.get('skip') + partyUserSubState.get('limit')) < partyUserSubState.get('total')) {
            getPartyUsers(partyUserSubState.get('skip') + partyUserSubState.get('limit'))
        }
    }

    const handleChange = (event: any, newValue: number): void => {
        event.preventDefault()
        setTabIndex(newValue)
    }

    const openDetails = (type, object) => {
        setDetailsOpen(true)
        setDetailsType(type)
        if (type === 'user') {
            setSelectedUser(object)
        }
        else if (type === 'group') {
            setSelectedGroup(object)
            getSelfGroupUser(object.id)
        }
    }

    const closeDetails = () => {
        setDetailsOpen(false)
        setDetailsType('')
        setSelectedUser(initialSelectedUserState)
        setSelectedGroup(initialGroupForm)
    }

    const openGroupForm = (mode: string, groupId?: string): void => {
        setGroupFormOpen(true)
        setGroupFormMode(mode)
        if (groupId != null) {
            const group = _.find(groups, (group) => {
                return group.id === groupId
            })
            setGroupForm({
                id: group.id,
                name: group.name,
                description: group.description
            })
        }
    }

    const closeGroupForm = (): void => {
        setGroupFormOpen(false)
        setGroupForm(initialGroupForm)
    }

    const handleGroupCreateInput = (e: any): void => {
        const value = e.target.value
        let form = Object.assign({}, groupForm)
        form[e.target.name] = value
        setGroupForm(form)
    }

    const submitGroup = (e: any): void => {
        e.preventDefault()

        const form = {
            id: groupForm.id,
            name: groupForm.name,
            description: groupForm.description,
        }

        if (groupFormMode === 'create') {
            delete form.id
            createGroup(form)
        } else {
            patchGroup(form)
        }
        setGroupFormOpen(false)
        setGroupForm(initialGroupForm)
    }

    const createNewParty = (): void => {
        createParty()
    }

    const onListScroll = (e): void => {
        if ((e.target.scrollHeight - e.target.scrollTop) === e.target.clientHeight ) {
            if (detailsOpen === false && tabIndex === 0) {
                nextFriendsPage()
            }
            else if (detailsOpen === false && tabIndex === 1) {
                nextGroupsPage()
            }
            else if (detailsOpen === true && detailsType === 'group') {
                nextGroupUsersPage()
            }
            else if (detailsOpen === false && tabIndex === 2) {
                nextPartyUsersPage()
            }
        }
    }

    const openInvite = (targetObjectType?: string, targetObjectId?: string): void => {
        updateInviteTarget(targetObjectType, targetObjectId)
        console.log('openInvite')
        console.log('targetObjectType: ' + targetObjectType)
        setLeftDrawerOpen(false)
        setRightDrawerOpen(true)
    }

    const openChat = (targetObjectType, targetObjectId): void => {
        setLeftDrawerOpen(false)
        setRightDrawerOpen(true)
    }

    return (
        <div>
            <SwipeableDrawer
                className="flex-column"
                BackdropProps={{ invisible: true }}
                anchor="left"
                open={props.leftDrawerOpen === true}
                onClose={() => {setLeftDrawerOpen(false)}}
                onOpen={() => {}}
            >
                { detailsOpen === false && groupFormOpen === false &&
                    <div className="list-container">
                        <Tabs
                            value={tabIndex}
                            onChange={handleChange}
                            variant="fullWidth"
                            indicatorColor="primary"
                            textColor="secondary"
                            aria-label="People Type"
                        >
                            <Tab
                                icon={<SupervisedUserCircle style={{ fontSize: 30}} />}
                                label="Friends"
                            />
                            <Tab
                                icon={<Group style={{ fontSize: 30}} />}
                                label="Groups"
                            />
                            <Tab
                                icon={<GroupWork style={{ fontSize: 30}} />}
                                label="Party"
                            />
                        </Tabs>
                        <Divider/>
                        { tabIndex === 0 &&
                            <div className="flex-center">
                                <Button
                                    variant="contained"
                                    color="primary"
                                    startIcon={<Add/>}
                                    onClick={() => openInvite('user')}>
                                    Invite Friend
                                </Button>
                            </div>
                        }
                        { tabIndex === 1 &&
                            <div className="flex-center">
                                <Button
                                    variant="contained"
                                    color="primary"
                                    startIcon={<Add/>}
                                    onClick={() => openGroupForm('create')}>
                                    Create Group
                                </Button>
                            </div>
                        }
                        {(tabIndex === 0 || tabIndex === 1) &&
                            <List
                                onScroll={(e) => onListScroll(e)}
                            >
                                {tabIndex === 0 && friends && friends.length > 0 && friends.sort((a, b) => a.name - b.name).map((friend, index) => {
                                    return <div key={friend.id}>
                                        <ListItem
                                            className="selectable"
                                            onClick={() => {
                                                openDetails('user', friend)
                                            }}
                                        >
                                            <ListItemAvatar>
                                                <Avatar src={friend.avatarUrl}/>
                                            </ListItemAvatar>
                                            <ListItemText primary={friend.name}/>
                                        </ListItem>
                                        {index < friends.length - 1 && <Divider/>}
                                    </div>
                                })
                                }
                                {tabIndex === 1 && groups && groups.length > 0 && groups.sort((a, b) => a.name - b.name).map((group, index) => {
                                    return <div key={group.id}>
                                        <ListItem
                                            className="selectable"
                                            onClick={() => {
                                                openDetails('group', group)
                                            }}
                                        >
                                            <ListItemText primary={group.name}/>
                                        </ListItem>
                                        {index < groups.length - 1 && <Divider/>}
                                    </div>
                                })
                                }
                            </List>
                        }
                        {tabIndex === 2 &&
	                    <div className="list-container">
                            {party == null &&
		                    <div>
			                    <div className="title">You are not currently in a party</div>
			                    <div className="flex-center">
				                    <Button
					                    variant="contained"
					                    color="primary"
					                    startIcon={<Add/>}
					                    onClick={() => createNewParty()}>
					                    Create Party
				                    </Button>
			                    </div>
		                    </div>
                            }
                            { party != null &&
		                    <div className="list-container">
			                    <div className="title">Current Party</div>
                                <div className="party-id flex-center">
                                    <div>ID: {party.id}</div>
                                </div>
			                    <div className="actionButtons flex-center flex-column">
				                    <Button
					                    variant="contained"
					                    color="primary"
					                    startIcon={<Forum/>}
					                    onClick={() => openChat('party', party.id)}
				                    >
					                    Chat
				                    </Button>
				                    <Button
					                    variant="contained"
					                    color="secondary"
					                    startIcon={<PersonAdd/>}
					                    onClick={() => openInvite('party', party.id)}
				                    >
					                    Invite
				                    </Button>
                                    { partyDeletePending !== true &&
				                    <Button
					                    variant="contained"
					                    className="background-red"
					                    startIcon={<Delete/>}
					                    onClick={(e) => showPartyDeleteConfirm(e)}
				                    >
					                    Delete
				                    </Button>
                                    }
                                    { partyDeletePending === true &&
				                    <div>
					                    <Button variant="contained"
					                            startIcon={<Delete/>}
					                            className="background-red"
					                            onClick={(e) => confirmPartyDelete(e, party.id)}
					                    >
						                    Confirm Delete
					                    </Button>
					                    <Button variant="contained"
					                            color="secondary"
					                            onClick={(e) => cancelPartyDelete(e)}
					                    >
						                    Cancel
					                    </Button>
				                    </div>
                                    }
			                    </div>
			                    <Divider/>
			                    <div className="title margin-top">Members</div>
			                    <List
				                    className="flex-center flex-column"
				                    onScroll={(e) => onListScroll(e)}
			                    >
                                    { partyUsers && partyUsers.length > 0 && partyUsers.sort((a, b) => a.name - b.name).map((partyUser) => {
                                            return <ListItem key={partyUser.id}>
                                                <ListItemAvatar>
                                                    <Avatar src={partyUser.user.avatarUrl}/>
                                                </ListItemAvatar>
                                                {user.id === partyUser.userId && <ListItemText primary={partyUser.user.name + ' (you)'}/> }
                                                {user.id !== partyUser.userId && <ListItemText primary={partyUser.user.name}/> }
                                                {
                                                    partyUserDeletePending !== partyUser.id &&
                                                    partyState.get('selfPartyUser') != null &&
                                                    (partyState.get('selfPartyUser').partyUserRank === 'owner' || partyState.get('selfPartyUser').partyUserRank === 'admin') &&
                                                    user.id !== partyUser.userId &&
								                    <div>
									                    <Button onClick={(e) => showPartyUserDeleteConfirm(e, partyUser.id)}>
										                    <Delete/>
									                    </Button>
								                    </div>
                                                }
                                                { partyUserDeletePending !== partyUser.id && user.id === partyUser.userId &&
							                    <div>
								                    <Button onClick={(e) => showPartyUserDeleteConfirm(e, partyUser.id)}>
									                    <Delete/>
								                    </Button>
							                    </div>
                                                }
                                                {partyUserDeletePending === partyUser.id &&
							                    <div>
                                                    {
                                                        user.id !== partyUser.userId &&
									                    <Button variant="contained"
									                            color="primary"
									                            onClick={(e) => confirmPartyUserDelete(e, partyUser.id)}
									                    >
										                    Remove User
									                    </Button>
                                                    }
                                                    {
                                                        user.id === partyUser.userId &&
									                    <Button variant="contained"
									                            color="primary"
									                            onClick={(e) => confirmPartyUserDelete(e, partyUser.id)}
									                    >
										                    Leave party
									                    </Button>
                                                    }
								                    <Button variant="contained"
								                            color="secondary"
								                            onClick={(e) => cancelPartyUserDelete(e)}
								                    >
									                    Cancel
								                    </Button>
							                    </div>
                                                }
                                            </ListItem>
                                        }
                                    )
                                    }
			                    </List>
		                    </div>
                            }
	                    </div>
                        }
                    </div>
                }
                { detailsOpen === true && groupFormOpen === false && detailsType === 'user' &&
                    <div className="flex-center flex-column">
                        <div className="header">
                            <Button onClick={closeDetails}>
                                <ArrowLeft/>
                            </Button>
                            <Divider/>
                        </div>
                        <div className="details">
                            <div className="avatarUrl flex-center">
                                <Avatar src={selectedUser.avatarUrl}/>
                            </div>
                            <div className="userName flex-center">
                                <div>{selectedUser.name}</div>
                            </div>
                            <div className="userId flex-center">
                                <div>ID: {selectedUser.id}</div>
                            </div>
                            <div className="actionButtons flex-center flex-column">
                                <Button
                                    variant="contained"
                                    color="primary"
                                    startIcon={<Forum/>}
                                    onClick={() => {openChat('user', selectedUser.id)}}
                                >
                                    Chat
                                </Button>
                                <Button
                                    variant="contained"
                                    color="secondary"
                                    startIcon={<PersonAdd/>}
                                    onClick={() => openInvite('user', selectedUser.id)}
                                >
                                    Invite
                                </Button>
                                {friendDeletePending !== selectedUser.id &&
                                <Button
                                    variant="contained"
                                    className="background-red"
                                    startIcon={<Delete/>}
                                    onClick={(e) => showFriendDeleteConfirm(e, selectedUser.id)}
                                >
                                    Unfriend
                                </Button>}
                                {friendDeletePending === selectedUser.id &&
                                <div>
                                    <Button variant="contained"
                                            startIcon={<Delete/>}
                                            className="background-red"
                                            onClick={(e) => confirmFriendDelete(e, selectedUser.id)}
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
                            </div>
                        </div>
                    </div>
                }
                { detailsOpen === true && groupFormOpen === false && detailsType === 'group' &&
                    <div className="flex-center flex-column">
                        <div className="header">
                            <Button onClick={closeDetails}>
                                <ArrowLeft/>
                            </Button>
                            <Divider/>
                        </div>
                        <div className="details list-container">
                            <div className="title flex-center">
                                <div>{selectedGroup.name}</div>
                            </div>
                            <div className="group-id flex-center">
                                <div>ID: {selectedGroup.id}</div>
                            </div>
	                        <div className="description flex-center">
		                        <div>{selectedGroup.description}</div>
	                        </div>
                            <div className="actionButtons flex-center flex-column">
                                <Button
                                    variant="contained"
                                    color="primary"
                                    startIcon={<Forum/>}
                                    onClick={() => {openChat('group', selectedGroup.id)}}
                                >
                                    Chat
                                </Button>
                                {selfGroupUser != null && (selfGroupUser.groupUserRank === 'owner' || selfGroupUser.groupUserRank === 'admin') &&
                                    <Button
                                        variant="contained"
                                        color="secondary"
                                        startIcon={<PersonAdd/>}
                                        onClick={() => openInvite('group', selectedGroup.id)}
                                    >
                                        Invite
                                    </Button>
                                }
                                {groupDeletePending !== selectedGroup.id &&
                                selfGroupUser != null && selfGroupUser.groupUserRank === 'owner' &&
                                <Button
                                    variant="contained"
                                    className="background-red"
                                    startIcon={<Delete/>}
                                    onClick={(e) => showGroupDeleteConfirm(e, selectedGroup.id)}
                                >
                                    Delete
                                </Button>}
                                {groupDeletePending === selectedGroup.id &&
                                    <div>
                                        <Button variant="contained"
                                                startIcon={<Delete/>}
                                                className="background-red"
                                                onClick={(e) => confirmGroupDelete(e, selectedGroup.id)}
                                        >
                                            Confirm Delete
                                        </Button>
                                        <Button variant="contained"
                                                color="secondary"
                                                onClick={(e) => cancelGroupDelete(e)}
                                        >
                                            Cancel
                                        </Button>
                                    </div>
                                }
                            </div>
                            <Divider/>
                            <div className="title margin-top">Members</div>
                            <List className="flex-center flex-column">
                                { groupUsers && groupUsers.length > 0 && groupUsers.sort((a, b) => a.name - b.name).map((groupUser) => {
                                        return <ListItem key={groupUser.id}>
                                            <ListItemAvatar>
                                                <Avatar src={groupUser.user.avatarUrl}/>
                                            </ListItemAvatar>
                                            {user.id === groupUser.userId && <ListItemText primary={groupUser.user.name + ' (you)'}/> }
                                            {user.id !== groupUser.userId && <ListItemText primary={groupUser.user.name}/> }
                                            {
                                                groupUserDeletePending !== groupUser.id &&
                                                selfGroupUser != null &&
                                                (selfGroupUser.groupUserRank === 'owner' || selfGroupUser.groupUserRank === 'admin') &&
                                                user.id !== groupUser.userId &&
                                                <div>
                                                    <Button onClick={(e) => showGroupUserDeleteConfirm(e, groupUser.id)}>
                                                        <Delete/>
                                                    </Button>
                                                </div>
                                            }
                                            { groupUserDeletePending !== groupUser.id && user.id === groupUser.userId &&
                                            <div>
                                                <Button onClick={(e) => showGroupUserDeleteConfirm(e, groupUser.id)}>
                                                    <Delete/>
                                                </Button>
                                            </div>
                                            }
                                            {groupUserDeletePending === groupUser.id &&
                                            <div>
                                                {
                                                    user.id !== groupUser.userId &&
                                                    <Button variant="contained"
                                                            color="primary"
                                                            onClick={(e) => confirmGroupUserDelete(e, groupUser.id)}
                                                    >
                                                        Remove User
                                                    </Button>
                                                }
                                                {
                                                    user.id === groupUser.userId &&
                                                    <Button variant="contained"
                                                            color="primary"
                                                            onClick={(e) => confirmGroupUserDelete(e, groupUser.id)}
                                                    >
                                                        Leave group
                                                    </Button>
                                                }
                                                <Button variant="contained"
                                                        color="secondary"
                                                        onClick={(e) => cancelGroupUserDelete(e)}
                                                >
                                                    Cancel
                                                </Button>
                                            </div>
                                            }
                                        </ListItem>
                                    }
                                )
                                }
                            </List>
                        </div>
                    </div>
                }
                {
                    groupFormOpen === true && detailsOpen === false &&
                        <form className='group-form' noValidate onSubmit={(e) => submitGroup(e)}>
                            { groupFormMode === 'create' && <div className="title">New Group</div> }
                            { groupFormMode === 'update' && <div className="title">Update Group</div> }
                            <TextField
                                variant="outlined"
                                margin="normal"
                                required
                                fullWidth
                                id="name"
                                label="Group Name"
                                name="name"
                                autoComplete="name"
                                autoFocus
                                value={groupForm.name}
                                onChange={(e) => handleGroupCreateInput(e)}
                            />
                            <TextField
                                variant="outlined"
                                margin="normal"
                                required
                                fullWidth
                                id="description"
                                label="Group Description"
                                name="description"
                                autoComplete="description"
                                autoFocus
                                value={groupForm.description}
                                onChange={(e) => handleGroupCreateInput(e)}
                            />
                            <div className="flex-center flex-column">
                                <Button
                                    type="submit"
                                    variant="contained"
                                    color="primary"
                                    className={'submit'}
                                >
                                    {groupFormMode === 'create' && 'Create Group'}
                                    {groupFormMode === 'update' && 'Update Group'}
                                </Button>
                                <Button
                                    variant="contained"
                                    color="secondary"
                                    onClick={() => closeGroupForm()}>
                                    Cancel
                                </Button>
                            </div>
                        </form>
                }
            </SwipeableDrawer>
        </div>
    )
}

export default connect(mapStateToProps, mapDispatchToProps)(LeftDrawer)
