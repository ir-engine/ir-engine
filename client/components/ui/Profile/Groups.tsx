import React, { useState, useEffect } from 'react'
import AccountCircleIcon from '@material-ui/icons/AccountCircle'
import { bindActionCreators, Dispatch } from 'redux'
import { connect } from 'react-redux'
import './style.scss'
import {
    Avatar,
    Button,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    Tab,
    Tabs,
    TextField
} from '@material-ui/core'
import {
    getGroups,
    createGroup,
    patchGroup,
    removeGroup
} from '../../../redux/group/service'
import {
    getGroupUsers,
    getSelfGroupUser,
    removeGroupUser
} from '../../../redux/group-user/service'
import {
    sendInvite
} from '../../../redux/invite/service'
import { selectGroupState } from '../../../redux/group/selector'
import { selectGroupUserState } from '../../../redux/group-user/selector'
import {
    AccountCircle,
    ChevronLeft,
    ChevronRight,
    Delete,
    Edit,
    Mail,
    PeopleOutlined,
    PhoneIphone
} from '@material-ui/icons'
import {selectInviteState} from '../../../redux/invite/selector'
import _ from 'lodash'
import {User} from "../../../../shared/interfaces/User";

const mapStateToProps = (state: any): any => {
    return {
        groupState: selectGroupState(state),
        groupUserState: selectGroupUserState(state),
        inviteState: selectInviteState(state)
    }
}

const mapDispatchToProps = (dispatch: Dispatch): any => ({
    getGroups: bindActionCreators(getGroups, dispatch),
    getGroupUsers: bindActionCreators(getGroupUsers, dispatch),
    getSelfGroupUser: bindActionCreators(getSelfGroupUser, dispatch),
    createGroup: bindActionCreators(createGroup, dispatch),
    patchGroup: bindActionCreators(patchGroup, dispatch),
    removeGroup: bindActionCreators(removeGroup, dispatch),
    removeGroupUser: bindActionCreators(removeGroupUser, dispatch),
    sendInvite: bindActionCreators(sendInvite, dispatch)
})

interface Props {
    auth: any,
    groupState?: any,
    groupUserState?: any,
    inviteState?: any,
    getGroups?: any,
    createGroup?: any,
    patchGroup?: any,
    removeGroup?: any,
    getGroupUsers?: any,
    getSelfGroupUser?: any,
    removeGroupUser?: any,
    sendInvite?: any
}

const identityProviderTabMap = new Map()
identityProviderTabMap.set(0, 'email')
identityProviderTabMap.set(1, 'sms')

const Groups = (props: Props): any => {
    const {
        auth,
        groupState,
        groupUserState,
        sendInvite,
        inviteState,
        getGroups,
        createGroup,
        patchGroup,
        removeGroup,
        getGroupUsers,
        getSelfGroupUser,
        removeGroupUser
    } = props
    const user = auth.get('user') as User
    const groupSubState = groupState.get('groups')
    const groups = groupSubState.get('groups')
    const groupUserSubState = groupUserState.get('groupUsers')
    const groupUsers = groupUserSubState.get('groupUsers')
    const [ groupDeletePending, setGroupDeletePending ] = useState('')
    const [ groupUserDeletePending, setGroupUserDeletePending] = useState('')
    const [tabIndex, setTabIndex] = useState(0)
    const [userToken, setUserToken] = useState('')
    const [inviteTabIndex, setInviteTabIndex] = useState(0)
    const [targetGroupId, setTargetGroupId] = useState('')
    const [inviteFormOpen, setInviteFormOpen] = useState(false)
    const [groupFormOpen, setGroupFormOpen] = useState(false)
    const [groupFormMode, setGroupFormMode] = useState('create')
    const [groupForm, setGroupForm] = useState({
        id: '',
        name: '',
        description: ''
    })
    const [groupUserListOpen, setGroupUserListOpen] = useState(false)
    const [groupUserListGroupId, setGroupUserListGroupId] = useState('')
    const [userCanRemoveGroupUsers, setUserCanRemoveGroupUsers] = useState(false)

    const handleChange = (event: any, newValue: number): void => {
        event.preventDefault()
        setTabIndex(newValue)
        setUserToken('')
    }

    const handleInviteChange = (event: any, newValue: number): void => {
        event.preventDefault()
        setInviteTabIndex(newValue)
    }

    const handleUserTokenChange = (event: any): void => {
        const token = event.target.value
        setUserToken(token)
    }

    const handleGroupCreateInput = (e: any): void => {
        const value = e.target.value
        let form = Object.assign({}, groupForm)
        form[e.target.name] = value
        setGroupForm(form)
    }

    const packageInvite = (event: any): void => {
        const mappedIDProvider = identityProviderTabMap.get(tabIndex)
        sendInvite({
            type: 'group',
            token: mappedIDProvider ? userToken : null,
            identityProviderType: mappedIDProvider ? mappedIDProvider : null,
            targetObjectId: targetGroupId,
            invitee: tabIndex === 2 ? userToken : null
        })
        setInviteFormOpen(false)
    }

    useEffect(() => {
        if (groupState.get('updateNeeded') === true) {
            getGroups()
        }
    }, [groupState]);

    useEffect(() => {
        if (groupUserState.get('updateNeeded') === true && groupState.get('updateNeeded') === false && groupUserListGroupId != null && groupUserListGroupId.length > 0) {
            const matchingGroup = _.find(groups, (group) => {
                return group.id === groupUserListGroupId
            })
            if (matchingGroup != null) {
                getGroupUsers(groupUserListGroupId)
                getSelfGroupUser(groupUserListGroupId)
            } else {
                setGroupUserListOpen(false)
                setGroupUserListGroupId('')
                setUserCanRemoveGroupUsers(false)
            }
        }
    }, [groupUserState, groupState]);

    const showGroupDeleteConfirm = (groupId) => {
        setGroupDeletePending(groupId)
    }

    const cancelGroupDelete = () => {
        setGroupDeletePending('')
        setGroupForm({
            id: '',
            name: '',
            description: ''
        })
    }

    const openInviteForm = (groupId: string) => {
        setInviteFormOpen(true)
        setTargetGroupId(groupId)
        setUserToken('')
    }

    const closeInviteForm = () => {
        setInviteFormOpen(false)
        setTargetGroupId('')
        setUserToken('')
    }

    const confirmGroupDelete = (groupId) => {
        setGroupDeletePending('')
        removeGroup(groupId)
        setGroupForm({
            id: '',
            name: '',
            description: ''
        })
    }

    const showGroupUserDeleteConfirm = (groupUserId: string) => {
        setGroupUserDeletePending(groupUserId)
    }

    const cancelGroupUserDelete = () => {
        setGroupUserDeletePending('')
    }

    const confirmGroupUserDelete = (groupId) => {
        setGroupUserDeletePending('')
        removeGroupUser(groupId)
    }

    const openGroupUserList = (groupId: string) => {
        getSelfGroupUser(groupId)
        getGroupUsers(groupId)
        setGroupUserListOpen(true)
        setGroupUserListGroupId(groupId)
    }

    const closeGroupUserList = () => {
        setGroupUserListOpen(false)
        setGroupUserListGroupId('')
        setUserCanRemoveGroupUsers(false)
    }

    const previousGroupUsersPage = (): void => {
        getGroupUsers(groupUserListGroupId, null, groupUserSubState.get('skip') - groupUserSubState.get('limit'))
    }

    const nextGroupUsersPage = (): void => {
        getGroupUsers(groupUserListGroupId, null, groupUserSubState.get('skip') + groupUserSubState.get('limit'))
    }

    const previousGroupsPage = (): void => {
        getGroups(null, groupSubState.get('skip') - groupSubState.get('limit'))
        setGroupUserListOpen(false)
        setGroupUserListGroupId('')
        setUserCanRemoveGroupUsers(false)
    }

    const nextGroupsPage = (): void => {
        getGroups(null, groupSubState.get('skip') + groupSubState.get('limit'))
        setGroupUserListOpen(false)
        setGroupUserListGroupId('')
        setUserCanRemoveGroupUsers(false)
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
        setGroupForm({
            id: '',
            name: '',
            description: ''
        })
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
        setGroupForm({
            id: '',
            name: '',
            description: ''
        })
    }

    return (
        <div className="group-container">
            <List className="flex-center flex-column">
                { groups && groups.length > 0 && groups.sort((a, b) => a.name - b.name).map((group) => {
                        return <ListItem key={group.id}>
                            <ListItemText primary={group.name}/>
                            {groupDeletePending !== group.id &&
							<div>
								<Button onClick={() => openGroupUserList(group.id)} >
									<PeopleOutlined/>
								</Button>
                                {
                                    (groupUserState.get('selfGroupUser')?.groupUserRank === 'owner' || groupUserState.get('selfGroupUser')?.groupUserRank === 'admin') &&
                                    <Button onClick={() => openGroupForm('update', group.id)}>
                                        <Edit/>
                                    </Button>
                                }
                                {
                                    (groupUserState.get('selfGroupUser')?.groupUserRank === 'owner' || groupUserState.get('selfGroupUser')?.groupUserRank === 'admin') &&
									<Button onClick={() => openInviteForm(group.id)}>
										<Mail/>
									</Button>
                                }
                                {
                                    (groupUserState.get('selfGroupUser')?.groupUserRank === 'owner' || groupUserState.get('selfGroupUser')?.groupUserRank === 'admin') &&
									<Button onClick={() => showGroupDeleteConfirm(group.id)}>
                                        <Delete/>
									</Button>
                                }
							</div>
                            }
                            {groupDeletePending === group.id &&
							<div>
								<Button variant="contained"
								        color="primary"
								        onClick={() => confirmGroupDelete(group.id)}
								>
									Delete Group
								</Button>
								<Button variant="contained"
								        color="secondary"
								        onClick={() => cancelGroupDelete()}
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
            <div className="flex-center">
                <Button
                    disabled={groupSubState.get('skip') === 0}
                    onClick={previousGroupsPage}
                >
                    <ChevronLeft/>
                </Button>
                <Button
                    disabled={(groupSubState.get('skip') + groupSubState.get('limit')) > groupSubState.get('total')}
                    onClick={nextGroupsPage}
                >
                    <ChevronRight/>
                </Button>
            </div>
            <div className="flex-center">
                { groupFormOpen === false && groupUserListOpen === false && inviteFormOpen === false && <Button onClick={() => openGroupForm('create')}>Create Group</Button> }
                { groupFormOpen === true && groupUserListOpen === false && inviteFormOpen === false &&
				<form className={'form'} noValidate onSubmit={(e) => submitGroup(e)}>
                    { groupFormMode === 'create' && <span>New Group</span> }
                    { groupFormMode === 'update' && <span>Update Group</span> }
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
            </div>
            <div className="flex-center">
                {inviteFormOpen === true &&
				<div className="paper">
					<Tabs
						value={tabIndex}
						onChange={handleChange}
						variant="fullWidth"
						indicatorColor="secondary"
						textColor="secondary"
						aria-label="Invite Address"
					>
						<Tab
							icon={<Mail/>}
							label="Email"
						/>
						<Tab
							icon={<PhoneIphone/>}
							label="Phone Number"
						/>
						<Tab
							icon={<AccountCircle/>}
							label="User ID"
						/>
					</Tabs>

					<div className="username">
						<TextField
							variant="outlined"
							margin="normal"
							fullWidth
							id="token"
							label="User's email, phone number, or ID"
							name="name"
							autoFocus
							value={userToken}
							onChange={(e) => handleUserTokenChange(e)}
						/>
						<Button variant="contained"
						        color="primary"
						        onClick={packageInvite}
						>
							Send Invite
						</Button>
						<Button variant="contained"
						        color="secondary"
						        onClick={closeInviteForm}
						>
							Cancel
						</Button>
					</div>
				</div>
                }
            </div>
            <div className="flex-center flex-column">
                {groupUserListOpen === true &&
				<div className="flex-center flex-column">
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
                                        groupUserState.get('selfGroupUser') != null &&
                                        (groupUserState.get('selfGroupUser').groupUserRank === 'owner' || groupUserState.get('selfGroupUser').groupUserRank === 'admin') &&
                                        user.id !== groupUser.userId &&
                                        <div>
                                            <Button onClick={() => showGroupUserDeleteConfirm(groupUser.id)}>
                                                <Delete/>
                                            </Button>
                                        </div>
                                    }
                                    { groupUserDeletePending !== groupUser.id && user.id === groupUser.userId &&
                                        <div>
                                            <Button onClick={() => showGroupUserDeleteConfirm(groupUser.id)}>
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
                                                 onClick={() => confirmGroupUserDelete(groupUser.id)}
										    >
											    Remove User
										    </Button>
                                        }
                                        {
                                            user.id === groupUser.userId &&
											<Button variant="contained"
											        color="primary"
											        onClick={() => confirmGroupUserDelete(groupUser.id)}
											>
												Leave group
											</Button>
                                        }
										<Button variant="contained"
										        color="secondary"
										        onClick={() => cancelGroupUserDelete()}
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
					<div className="flex-center">
						<Button
							disabled={groupUserSubState.get('skip') === 0}
							onClick={previousGroupUsersPage}
						>
							<ChevronLeft/>
						</Button>
						<Button
							disabled={(groupUserSubState.get('skip') + groupUserSubState.get('limit')) > groupUserSubState.get('total')}
							onClick={nextGroupUsersPage}
						>
							<ChevronRight/>
						</Button>
					</div>
					<Button variant="contained"
					        color="primary"
					        onClick={closeGroupUserList}
					>
						Close
					</Button>
				</div>
                }
            </div>
        </div>

    )
}

export default connect(mapStateToProps, mapDispatchToProps)(Groups)
