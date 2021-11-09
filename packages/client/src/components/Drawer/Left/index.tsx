import Avatar from '@mui/material/Avatar'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemAvatar from '@mui/material/ListItemAvatar'
import ListItemText from '@mui/material/ListItemText'
import SwipeableDrawer from '@mui/material/SwipeableDrawer'
import TextField from '@mui/material/TextField'
import { Add, ArrowLeft, Block, Delete, Edit, Forum, GroupAdd, SupervisorAccount } from '@mui/icons-material'
import { ChatService } from '@xrengine/client-core/src/social/services/ChatService'
import { useFriendState } from '@xrengine/client-core/src/social/services/FriendService'
import { FriendService } from '@xrengine/client-core/src/social/services/FriendService'
import { useGroupState } from '@xrengine/client-core/src/social/services/GroupService'
import { GroupService } from '@xrengine/client-core/src/social/services/GroupService'
import { InviteService } from '@xrengine/client-core/src/social/services/InviteService'
import { useLocationState } from '@xrengine/client-core/src/social/services/LocationService'
import { usePartyState } from '@xrengine/client-core/src/social/services/PartyService'
import { PartyService } from '@xrengine/client-core/src/social/services/PartyService'
import { useAuthState } from '@xrengine/client-core/src/user/services/AuthService'
import { UserService } from '@xrengine/client-core/src/user/services/UserService'
import { useUserState } from '@xrengine/client-core/src/user/services/UserService'
import { Group as GroupType } from '@xrengine/common/src/interfaces/Group'
import classNames from 'classnames'
import _ from 'lodash'
import React, { useEffect, useState } from 'react'
import { useDispatch } from '@xrengine/client-core/src/store'
import styles from './Left.module.scss'
import { GroupAction } from '@xrengine/client-core/src/social/services/GroupService'

interface Props {
  harmony?: boolean
  setHarmonyOpen?: any
  openBottomDrawer?: boolean
  leftDrawerOpen: boolean
  setLeftDrawerOpen: any
  setRightDrawerOpen: any
  authState?: any
  setBottomDrawerOpen: any
  detailsType?: string
  setDetailsType?: any
  groupFormMode?: string
  setGroupFormMode?: any
  groupFormOpen?: boolean
  setGroupFormOpen?: any
  groupForm?: any
  setGroupForm?: any
  selectedUser?: any
  setSelectedUser?: any
  selectedGroup?: any
  setSelectedGroup?: any
}

const initialSelectedUserState = {
  id: '',
  name: '',
  userRole: '',
  identityProviders: [],
  relationType: {},
  inverseRelationType: {},
  avatarUrl: ''
}

const initialGroupForm = {
  id: '',
  name: '',
  groupUsers: [],
  description: ''
}

const LeftDrawer = (props: Props): any => {
  try {
    const {
      harmony,
      setHarmonyOpen,
      setLeftDrawerOpen,
      leftDrawerOpen,
      setRightDrawerOpen,
      setBottomDrawerOpen,
      detailsType,
      setDetailsType,
      groupFormMode,
      setGroupFormMode,
      groupFormOpen,
      setGroupFormOpen,
      groupForm,
      setGroupForm,
      selectedUser,
      setSelectedUser,
      selectedGroup,
      setSelectedGroup
    } = props

    const dispatch = useDispatch()
    const userState = useUserState()
    const user = useAuthState().user
    const friendState = useFriendState()
    const friendSubState = friendState.friends

    const groupState = useGroupState()
    const groupSubState = groupState.groups
    const partyState = usePartyState()
    const party = partyState.party
    const [tabIndex, setTabIndex] = useState(0)
    const [friendDeletePending, setFriendDeletePending] = useState('')
    const [groupDeletePending, setGroupDeletePending] = useState('')
    const [groupUserDeletePending, setGroupUserDeletePending] = useState('')
    const [partyDeletePending, setPartyDeletePending] = useState(false)
    const [partyTransferOwnerPending, setPartyTransferOwnerPending] = useState('')
    const [partyUserDeletePending, setPartyUserDeletePending] = useState('')
    const [selectedAccordion, setSelectedAccordion] = useState('')
    const [locationBanPending, setLocationBanPending] = useState('')
    const selfGroupUser =
      selectedGroup.id && selectedGroup.id.length > 0
        ? selectedGroup.groupUsers.find((groupUser) => groupUser.userId === user.id.value)
        : {}
    const partyUsers = party && party?.partyUsers && party?.partyUsers?.value ? party.partyUsers.value : []
    const selfPartyUser =
      party && party?.partyUsers?.value
        ? party?.partyUsers?.value?.find((partyUser) => partyUser.user.id === user.id.value)
        : null
    const currentLocation = useLocationState().currentLocation.location.value

    useEffect(() => {
      if (friendState.updateNeeded.value === true && friendState.getFriendsInProgress.value !== true) {
        FriendService.getFriends('', 0)
      }
      /* if (selectedUser.id?.length > 0 && friendState.get('closeDetails') === selectedUser.id) {
        closeDetails()
        friendState.set('closeDetails', '')
      }*/
    }, [friendState.updateNeeded.value, friendState.getFriendsInProgress.value])

    useEffect(() => {
      if (groupState.updateNeeded.value === true && groupState.getGroupsInProgress.value !== true) {
        GroupService.getGroups(0)
      }
      if (selectedGroup?.id.length > 0 && groupState.closeDetails.value === selectedGroup.id) {
        closeDetails()
        dispatch(GroupAction.removeCloseGroupDetail())
      }
    }, [groupState.updateNeeded.value, groupState.getGroupsInProgress.value])

    useEffect(() => {
      if (partyState.updateNeeded.value === true) {
        PartyService.getParty()
      }
    }, [partyState.updateNeeded.value])

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
      FriendService.unfriend(friendId)
      closeDetails()
      setLeftDrawerOpen(false)
    }

    const nextFriendsPage = (): void => {
      if (friendSubState.skip.value + friendSubState.limit.value < friendSubState.total.value) {
        FriendService.getFriends('', friendSubState.skip.value + friendSubState.limit.value)
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
      GroupService.removeGroup(groupId)
      setSelectedGroup(initialGroupForm)
      setDetailsType('')
      setLeftDrawerOpen(false)
    }

    /*
    const showLocationBanConfirm = (e, userId) => {
      e.preventDefault()
      setLocationBanPending(userId)
    }
  
    const cancelLocationBan = (e) => {
      e.preventDefault()
      setLocationBanPending('')
    }

    const confirmLocationBan = (e, userId) => {
      e.preventDefault()
      console.log('Confirming location ban')
      setLocationBanPending('')
      LocationService.banUserFromLocation(userId, currentLocation.id)
    } */

    const nextGroupsPage = (): void => {
      if (groupSubState.skip.value + groupSubState.limit.value < groupSubState.total.value) {
        GroupService.getGroups(groupSubState.skip.value + groupSubState.limit.value)
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
      const groupUser = _.find(selectedGroup.groupUsers, (groupUser) => groupUser.id === groupUserId)
      setGroupUserDeletePending('')
      GroupService.removeGroupUser(groupUserId)
      if (groupUser.userId === user.id.value) {
        setSelectedGroup(initialGroupForm)
        setDetailsType('')
        setLeftDrawerOpen(false)
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
      PartyService.removeParty(partyId)
      setLeftDrawerOpen(false)
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
      const partyUser = _.find(partyUsers, (pUser) => pUser.id === partyUserId)
      setPartyUserDeletePending('')
      PartyService.removePartyUser(partyUserId)
      if (partyUser && partyUser.user.id === user.id.value) setLeftDrawerOpen(false)
    }

    const showTransferPartyOwnerConfirm = (e, partyUserId) => {
      e.preventDefault()
      setPartyTransferOwnerPending(partyUserId)
    }

    const cancelTransferPartyOwner = (e) => {
      e.preventDefault()
      setPartyTransferOwnerPending('')
    }

    const confirmTransferPartyOwner = (e, partyUserId) => {
      e.preventDefault()
      setPartyTransferOwnerPending('')
      PartyService.transferPartyOwner(partyUserId)
    }

    const handleChange = (event: any, newValue: number): void => {
      event.preventDefault()
      setTabIndex(newValue)
    }

    const openDetails = (type, object) => {
      setDetailsType(type)
      if (type === 'user') {
        setSelectedUser(object)
      } else if (type === 'group') {
        setSelectedGroup(object)
      }
    }

    const closeDetails = () => {
      setLeftDrawerOpen(false)
      setDetailsType('')
      setSelectedUser(initialSelectedUserState)
      setSelectedGroup(initialGroupForm)
    }

    const openGroupForm = (mode: string, group?: GroupType) => {
      setGroupFormOpen(true)
      setGroupFormMode(mode)
      if (group != null) {
        setGroupForm({
          id: group.id,
          name: group.name,
          groupUsers: group.groupUsers,
          description: group.description
        })
      }
    }

    const closeGroupForm = (): void => {
      setLeftDrawerOpen(false)
      setGroupFormOpen(false)
      setGroupForm(initialGroupForm)
    }

    const handleGroupCreateInput = (e: any): void => {
      const value = e.target.value
      const form = Object.assign({}, groupForm)
      form[e.target.name] = value
      setGroupForm(form)
    }

    const submitGroup = (e: any): void => {
      e.preventDefault()

      const form = {
        id: groupForm.id,
        name: groupForm.name,
        description: groupForm.description
      }

      if (groupFormMode === 'create') {
        delete form.id
        GroupService.createGroup(form)
      } else {
        GroupService.patchGroup(form)
      }
      setLeftDrawerOpen(false)
      setGroupFormOpen(false)
      setGroupForm(initialGroupForm)
    }

    const createNewParty = (): void => {
      PartyService.createParty()
    }

    const onListScroll = (e): void => {
      if (e.target.scrollHeight - e.target.scrollTop === e.target.clientHeight) {
        if (tabIndex === 0) {
          nextFriendsPage()
        } else if (tabIndex === 1) {
          nextGroupsPage()
        }
      }
    }

    const openInvite = (targetObjectType?: string, targetObjectId?: string): void => {
      InviteService.updateInviteTarget(targetObjectType, targetObjectId)
      setLeftDrawerOpen(false)
      setRightDrawerOpen(true)
    }

    const openChat = (targetObjectType: string, targetObject: any): void => {
      setLeftDrawerOpen(false)
      if (harmony !== true) setBottomDrawerOpen(true)
      // else if (harmony === true) setHarmonyOpen(true);
      setTimeout(() => {
        ChatService.updateChatTarget(targetObjectType, targetObject)
        ChatService.updateMessageScrollInit(true)
      }, 100)
    }

    const handleAccordionSelect = (accordionType: string) => (event: React.ChangeEvent<{}>, isExpanded: boolean) => {
      if (accordionType === selectedAccordion) {
        setSelectedAccordion('')
      } else {
        setSelectedAccordion(accordionType)
      }
    }

    return (
      <div>
        <SwipeableDrawer
          className={classNames({
            [styles['flex-column']]: true,
            [styles['left-drawer']]: true
          })}
          anchor="left"
          open={leftDrawerOpen === true}
          onClose={() => {
            setLeftDrawerOpen(false)
          }}
          onOpen={() => {}}
        >
          {groupFormOpen === false && detailsType === 'user' && (
            <div className={styles['details-container']}>
              <div className={styles.header}>
                <Button className={styles.backButton} onClick={closeDetails}>
                  <ArrowLeft />
                </Button>
                <Divider />
              </div>
              <div className={styles.details}>
                <div
                  className={classNames({
                    [styles.avatarUrl]: true,
                    [styles['flex-center']]: true
                  })}
                >
                  <Avatar src={selectedUser.avatarUrl} />
                </div>
                <div
                  className={classNames({
                    [styles.userName]: true,
                    [styles['flex-center']]: true
                  })}
                >
                  <div>{selectedUser.name}</div>
                </div>
                <div
                  className={classNames({
                    [styles.userId]: true,
                    [styles['flex-center']]: true
                  })}
                >
                  <div>ID: {selectedUser.id}</div>
                </div>
                <div
                  className={classNames({
                    'action-buttons': true,
                    [styles['flex-center']]: true,
                    [styles['flex-column']]: true
                  })}
                >
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<Forum />}
                    onClick={() => {
                      openChat('user', selectedUser)
                    }}
                  >
                    Chat
                  </Button>
                  <Button
                    variant="contained"
                    color="secondary"
                    startIcon={<GroupAdd />}
                    onClick={() => openInvite('user', selectedUser.id)}
                  >
                    Invite
                  </Button>
                  {friendDeletePending !== selectedUser.id && (
                    <Button
                      variant="contained"
                      className={styles['background-red']}
                      startIcon={<Delete />}
                      onClick={(e) => showFriendDeleteConfirm(e, selectedUser.id)}
                    >
                      Unfriend
                    </Button>
                  )}
                  {friendDeletePending === selectedUser.id && (
                    <div className={styles.deleteConfirm}>
                      <Button
                        variant="contained"
                        startIcon={<Delete />}
                        className={styles['background-red']}
                        onClick={(e) => confirmFriendDelete(e, selectedUser.id)}
                      >
                        Unfriend
                      </Button>
                      <Button variant="contained" color="secondary" onClick={(e) => cancelFriendDelete(e)}>
                        Cancel
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
          {groupFormOpen === false && detailsType === 'party' && (
            <div className={styles['details-container']}>
              <div className={styles.header}>
                <Button className={styles.backButton} onClick={closeDetails}>
                  <ArrowLeft />
                </Button>
                <Divider />
              </div>
              {party?.value == null && (
                <div>
                  <div className={styles.title}>You are not currently in a party</div>
                  <div className={styles['flex-center']}>
                    <Button variant="contained" color="primary" startIcon={<Add />} onClick={() => createNewParty()}>
                      Create Party
                    </Button>
                  </div>
                </div>
              )}
              {party?.value != null && (
                <div className={styles['list-container']}>
                  <div className={styles.title}>Current Party</div>
                  <div
                    className={classNames({
                      [styles['party-id']]: true,
                      [styles['flex-center']]: true
                    })}
                  >
                    <div>ID: {party?.id?.value}</div>
                  </div>
                  <div
                    className={classNames({
                      'action-buttons': true,
                      [styles['flex-center']]: true,
                      [styles['flex-column']]: true
                    })}
                  >
                    <Button
                      variant="contained"
                      color="primary"
                      startIcon={<Forum />}
                      onClick={() => openChat('party', party?.value)}
                    >
                      Chat
                    </Button>
                    {selfPartyUser?.isOwner === true && (
                      <Button
                        variant="contained"
                        color="secondary"
                        startIcon={<GroupAdd />}
                        onClick={() => openInvite('party', party?.id?.value)}
                      >
                        Invite
                      </Button>
                    )}
                    {partyDeletePending !== true && selfPartyUser?.isOwner === true && (
                      <Button
                        variant="contained"
                        className={styles['background-red']}
                        startIcon={<Delete />}
                        onClick={(e) => showPartyDeleteConfirm(e)}
                      >
                        Delete
                      </Button>
                    )}
                    {partyDeletePending === true && (
                      <div className={styles.deleteConfirm}>
                        <Button
                          variant="contained"
                          startIcon={<Delete />}
                          className={styles['background-red']}
                          onClick={(e) => confirmPartyDelete(e, party?.id?.value)}
                        >
                          Delete
                        </Button>
                        <Button variant="contained" color="secondary" onClick={(e) => cancelPartyDelete(e)}>
                          Cancel
                        </Button>
                      </div>
                    )}
                  </div>
                  <Divider />
                  <div
                    className={classNames({
                      [styles.title]: true,
                      [styles['margin-top']]: true
                    })}
                  >
                    Members
                  </div>
                  <List
                    className={classNames({
                      [styles['flex-center']]: true,
                      [styles['flex-column']]: true
                    })}
                    onScroll={(e) => onListScroll(e)}
                  >
                    {partyUsers &&
                      partyUsers.length > 0 &&
                      [...partyUsers]
                        .sort((a, b) => (a?.user?.name || '')?.localeCompare(b?.user?.name || ''))
                        .map((partyUser) => {
                          return (
                            <ListItem key={partyUser.id}>
                              <ListItemAvatar>
                                <Avatar src={partyUser.user.avatarUrl} />
                              </ListItemAvatar>
                              {user.id.value === partyUser.id && partyUser.isOwner === true && (
                                <ListItemText primary={partyUser.user.name + ' (you, owner)'} />
                              )}
                              {user.id.value === partyUser.id && partyUser.isOwner !== true && (
                                <ListItemText primary={partyUser.user.name + ' (you)'} />
                              )}
                              {user.id.value !== partyUser.id && partyUser.isOwner === true && (
                                <ListItemText primary={partyUser.user.name + ' (owner)'} />
                              )}
                              {user.id.value !== partyUser.id && partyUser.isOwner !== true && (
                                <ListItemText primary={partyUser.user.name} />
                              )}
                              {partyUserDeletePending !== partyUser.id &&
                                partyTransferOwnerPending !== partyUser.id &&
                                selfPartyUser?.isOwner === true &&
                                user.id.value !== partyUser.id && (
                                  <Button
                                    variant="contained"
                                    className={styles.groupUserMakeOwnerInit}
                                    color="primary"
                                    onClick={(e) => showTransferPartyOwnerConfirm(e, partyUser.id)}
                                  >
                                    <SupervisorAccount />
                                  </Button>
                                )}
                              {partyUserDeletePending !== partyUser.id && partyTransferOwnerPending === partyUser.id && (
                                <div className={styles.userConfirmButtons}>
                                  <Button
                                    variant="contained"
                                    color="primary"
                                    onClick={(e) => confirmTransferPartyOwner(e, partyUser.id)}
                                  >
                                    Make Owner
                                  </Button>
                                  <Button
                                    variant="contained"
                                    color="secondary"
                                    onClick={(e) => cancelTransferPartyOwner(e)}
                                  >
                                    Cancel
                                  </Button>
                                </div>
                              )}
                              {partyTransferOwnerPending !== partyUser.id &&
                                partyUserDeletePending !== partyUser.id &&
                                selfPartyUser?.isOwner === true &&
                                user.id.value !== partyUser.id && (
                                  <Button
                                    className={styles.groupUserDeleteInit}
                                    onClick={(e) => showPartyUserDeleteConfirm(e, partyUser.id)}
                                  >
                                    <Delete />
                                  </Button>
                                )}
                              {partyUserDeletePending !== partyUser.id && user.id.value === partyUser.id && (
                                <Button
                                  className={styles.groupUserDeleteInit}
                                  onClick={(e) => showPartyUserDeleteConfirm(e, partyUser.id)}
                                >
                                  <Delete />
                                </Button>
                              )}
                              {partyTransferOwnerPending !== partyUser.id && partyUserDeletePending === partyUser.id && (
                                <div className={styles.userConfirmButtons}>
                                  {user.id.value !== partyUser.id && (
                                    <Button
                                      variant="contained"
                                      color="primary"
                                      onClick={(e) => confirmPartyUserDelete(e, partyUser.id)}
                                    >
                                      Remove User
                                    </Button>
                                  )}
                                  {user.id.value === partyUser.id && (
                                    <Button
                                      variant="contained"
                                      color="primary"
                                      onClick={(e) => confirmPartyUserDelete(e, partyUser.id)}
                                    >
                                      Leave party
                                    </Button>
                                  )}
                                  <Button
                                    variant="contained"
                                    color="secondary"
                                    onClick={(e) => cancelPartyUserDelete(e)}
                                  >
                                    Cancel
                                  </Button>
                                </div>
                              )}
                            </ListItem>
                          )
                        })}
                  </List>
                </div>
              )}
            </div>
          )}

          {groupFormOpen === false && detailsType === 'group' && (
            <div className={styles['details-container']}>
              <div className={styles.header}>
                <Button className={styles.backButton} onClick={closeDetails}>
                  <ArrowLeft />
                </Button>
                <Divider />
              </div>
              <div
                className={classNames({
                  [styles.details]: true,
                  [styles['list-container']]: true
                })}
              >
                <div
                  className={classNames({
                    [styles.title]: true,
                    [styles['flex-center']]: true
                  })}
                >
                  <div>{selectedGroup.name}</div>
                </div>
                <div
                  className={classNames({
                    'group-id': true,
                    [styles['flex-center']]: true
                  })}
                >
                  <div>ID: {selectedGroup.id}</div>
                </div>
                <div
                  className={classNames({
                    [styles.description]: true,
                    [styles['flex-center']]: true
                  })}
                >
                  <div>{selectedGroup.description}</div>
                </div>
                <div
                  className={classNames({
                    'action-buttons': true,
                    [styles['flex-center']]: true,
                    [styles['flex-column']]: true
                  })}
                >
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<Forum />}
                    onClick={() => {
                      openChat('group', selectedGroup)
                    }}
                  >
                    Chat
                  </Button>
                  {selfGroupUser != null && selfGroupUser.groupUserRank === 'owner' && (
                    <Button
                      variant="contained"
                      className={styles['gray']}
                      startIcon={<Edit />}
                      onClick={() => openGroupForm('update', selectedGroup)}
                    >
                      Edit
                    </Button>
                  )}
                  {selfGroupUser != null &&
                    (selfGroupUser.groupUserRank === 'owner' || selfGroupUser.groupUserRank === 'admin') && (
                      <Button
                        variant="contained"
                        color="secondary"
                        startIcon={<GroupAdd />}
                        onClick={() => openInvite('group', selectedGroup.id)}
                      >
                        Invite
                      </Button>
                    )}
                  {groupDeletePending !== selectedGroup.id &&
                    selfGroupUser != null &&
                    selfGroupUser.groupUserRank === 'owner' && (
                      <Button
                        variant="contained"
                        className={styles['background-red']}
                        startIcon={<Delete />}
                        onClick={(e) => showGroupDeleteConfirm(e, selectedGroup.id)}
                      >
                        Delete
                      </Button>
                    )}
                  {groupDeletePending === selectedGroup.id && (
                    <div className={styles.deleteConfirm}>
                      <Button
                        variant="contained"
                        startIcon={<Delete />}
                        className={styles['background-red']}
                        onClick={(e) => confirmGroupDelete(e, selectedGroup.id)}
                      >
                        Delete
                      </Button>
                      <Button variant="contained" color="secondary" onClick={(e) => cancelGroupDelete(e)}>
                        Cancel
                      </Button>
                    </div>
                  )}
                </div>
                <Divider />
                <div
                  className={classNames({
                    [styles.title]: true,
                    [styles['margin-top']]: true
                  })}
                >
                  Members
                </div>
                <List
                  className={classNames({
                    [styles['flex-center']]: true,
                    [styles['flex-column']]: true
                  })}
                >
                  {selectedGroup &&
                    selectedGroup.groupUsers &&
                    selectedGroup.groupUsers.length > 0 &&
                    selectedGroup.groupUsers
                      .sort((a, b) => a.name - b.name)
                      .map((groupUser) => {
                        return (
                          <ListItem key={groupUser.id}>
                            <ListItemAvatar>
                              <Avatar src={groupUser.user.avatarUrl} />
                            </ListItemAvatar>
                            {user.id.value === groupUser.userId && (
                              <ListItemText
                                className={styles.marginRight5px}
                                primary={groupUser.user.name + ' (you)'}
                              />
                            )}
                            {user.id.value !== groupUser.userId && (
                              <ListItemText className={styles.marginRight5px} primary={groupUser.user.name} />
                            )}
                            {groupUserDeletePending !== groupUser.id &&
                              selfGroupUser != null &&
                              (selfGroupUser.groupUserRank === 'owner' || selfGroupUser.groupUserRank === 'admin') &&
                              user.id.value !== groupUser.userId && (
                                <Button
                                  className={styles.groupUserDeleteInit}
                                  onClick={(e) => showGroupUserDeleteConfirm(e, groupUser.id)}
                                >
                                  <Delete />
                                </Button>
                              )}
                            {groupUserDeletePending !== groupUser.id && user.id.value === groupUser.userId && (
                              <Button
                                className={styles.groupUserDeleteInit}
                                onClick={(e) => showGroupUserDeleteConfirm(e, groupUser.id)}
                              >
                                <Delete />
                              </Button>
                            )}
                            {groupUserDeletePending === groupUser.id && (
                              <div className={styles.groupUserDeleteConfirm}>
                                {user.id.value !== groupUser.userId && (
                                  <Button
                                    variant="contained"
                                    color="primary"
                                    onClick={(e) => confirmGroupUserDelete(e, groupUser.id)}
                                  >
                                    <Delete />
                                  </Button>
                                )}
                                {user.id.value === groupUser.userId && (
                                  <Button
                                    variant="contained"
                                    color="primary"
                                    onClick={(e) => confirmGroupUserDelete(e, groupUser.id)}
                                  >
                                    <Delete />
                                  </Button>
                                )}
                                <Button variant="contained" color="secondary" onClick={(e) => cancelGroupUserDelete(e)}>
                                  <Block />
                                </Button>
                              </div>
                            )}
                          </ListItem>
                        )
                      })}
                </List>
              </div>
            </div>
          )}
          {groupFormOpen === true && (
            <form className={styles['group-form']} noValidate onSubmit={(e) => submitGroup(e)}>
              {groupFormMode === 'create' && <div className={styles.title}>New Group</div>}
              {groupFormMode === 'update' && <div className={styles.title}>Update Group</div>}
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
              <div
                className={classNames({
                  [styles['flex-center']]: true,
                  [styles['flex-column']]: true
                })}
              >
                <Button type="submit" variant="contained" color="primary" className={styles.submit}>
                  {groupFormMode === 'create' && 'Create Group'}
                  {groupFormMode === 'update' && 'Update Group'}
                </Button>
                <Button variant="contained" color="secondary" onClick={() => closeGroupForm()}>
                  Cancel
                </Button>
              </div>
            </form>
          )}
        </SwipeableDrawer>
      </div>
    )
  } catch (err) {
    console.log('LeftDrawer error:')
    console.log(err)
  }
}

export default LeftDrawer
