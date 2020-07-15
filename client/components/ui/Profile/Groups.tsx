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
    removeGroup,
    removeGroupUser
} from '../../../redux/group/service'
import {
    sendInvite
} from '../../../redux/invite/service'
import { selectGroupState } from '../../../redux/group/selector'
import {
    AccountCircle,
    ChevronLeft,
    ChevronRight,
    Edit,
    Mail,
    PhoneIphone
} from '@material-ui/icons'
import {selectInviteState} from '../../../redux/invite/selector'
import _ from 'lodash'

const mapStateToProps = (state: any): any => {
    return {
        groupState: selectGroupState(state),
        inviteState: selectInviteState(state)
    }
}

const mapDispatchToProps = (dispatch: Dispatch): any => ({
    getGroups: bindActionCreators(getGroups, dispatch),
    createGroup: bindActionCreators(createGroup, dispatch),
    patchGroup: bindActionCreators(patchGroup, dispatch),
    removeGroup: bindActionCreators(removeGroup, dispatch),
    removeGroupUser: bindActionCreators(removeGroupUser, dispatch),
    sendInvite: bindActionCreators(sendInvite, dispatch)
})

interface Props {
    auth: any,
    groupState?: any,
    inviteState?: any,
    getGroups?: any,
    createGroup?: any,
    patchGroup?: any,
    removeGroup?: any,
    removeGroupUser?: any,
    sendInvite?: any
}

const identityProviderTabMap = new Map()
identityProviderTabMap.set(0, 'email')
identityProviderTabMap.set(1, 'sms')

const Groups = (props: Props): any => {
    const {
        groupState,
        sendInvite,
        inviteState,
        getGroups,
        createGroup,
        patchGroup,
        removeGroup,
        removeGroupUser
    } = props
    const groupSubState = groupState.get('groups')
    const groups = groupSubState.get('groups')
    console.log(groups)
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

    const previousGroupsPage = (): void => {
        getGroups(null, groupSubState.get('skip') - groupSubState.get('limit'))
    }

    const nextGroupsPage = (): void => {
        getGroups(null, groupSubState.get('skip') + groupSubState.get('limit'))
    }

    const openGroupForm = (mode: string, groupId?: string): void => {
        setGroupFormOpen(true)
        setGroupFormMode(mode)
        console.log(groupId)
        if (groupId != null) {
            const group = _.find(groups, (group) => {
                return group.id === groupId
            })
            console.log('NEW DISPLAY GROUP')
            console.log(group)
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
                                        <Button onClick={() => openGroupForm('update', group.id)}>
                                            <Edit/>
                                        </Button>
                                        <Button onClick={() => openInviteForm(group.id)}>
                                            <Mail/>
                                        </Button>
	                                    <Button onClick={() => showGroupDeleteConfirm(group.id)}>X</Button>
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
                { groupFormOpen === false && <Button onClick={() => openGroupForm('create')}>Create Group</Button> }
                { groupFormOpen === true &&
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
        </div>

    )
}

export default connect(mapStateToProps, mapDispatchToProps)(Groups)
