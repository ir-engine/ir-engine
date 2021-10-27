import Avatar from '@mui/material/Avatar'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemAvatar from '@mui/material/ListItemAvatar'
import ListItemText from '@mui/material/ListItemText'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import SwipeableDrawer from '@mui/material/SwipeableDrawer'
import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
import TextField from '@mui/material/TextField'
import {
  AccountCircle,
  Add,
  ArrowDownward,
  ArrowUpward,
  Close,
  Group,
  GroupWork,
  Mail,
  PhoneIphone,
  SupervisedUserCircle
} from '@material-ui/icons'
import { useAuthState } from '@xrengine/client-core/src/user/state/AuthService'
import { useFriendState } from '@xrengine/client-core/src/social/state/FriendService'
import { FriendService } from '@xrengine/client-core/src/social/state/FriendService'
import { useGroupState } from '@xrengine/client-core/src/social/state/GroupService'
import { GroupService } from '@xrengine/client-core/src/social/state/GroupService'
import { InviteService } from '@xrengine/client-core/src/social/state/InviteService'
import { useInviteState } from '@xrengine/client-core/src/social/state/InviteService'
import { useLocationState } from '@xrengine/client-core/src/social/state/LocationService'
import { LocationService } from '@xrengine/client-core/src/social/state/LocationService'
import classNames from 'classnames'
import _ from 'lodash'
import React, { useEffect, useState } from 'react'
import { useDispatch } from '@xrengine/client-core/src/store'
import { usePartyState } from '@xrengine/client-core/src/social/state/PartyService'
import styles from './Right.module.scss'
import { InstanceConnectionService } from '@xrengine/client-core/src/common/state/InstanceConnectionService'

interface Props {
  rightDrawerOpen?: any
  setRightDrawerOpen?: any
}

const identityProviderTabMap = new Map()
identityProviderTabMap.set(0, 'email')
identityProviderTabMap.set(1, 'sms')

const Invites = (props: Props): any => {
  const { rightDrawerOpen, setRightDrawerOpen } = props
  const user = useAuthState().user
  const friendSubState = useFriendState().friends
  const friends = friendSubState.friends.value
  const inviteState = useInviteState()
  const receivedInviteState = inviteState.receivedInvites
  const receivedInvites = receivedInviteState.invites
  const sentInviteState = inviteState.sentInvites
  const sentInvites = sentInviteState.invites
  const targetObjectType = inviteState.targetObjectType
  const targetObjectId = inviteState.targetObjectId
  const groupState = useGroupState()
  const invitableGroupState = groupState.invitableGroups
  const invitableGroups = invitableGroupState.groups
  const party = usePartyState().party.value
  const selfPartyUser = party?.partyUsers?.find((partyUser) => partyUser?.user?.id === user.id.value)

  const [tabIndex, setTabIndex] = useState(0)
  const [inviteTabIndex, setInviteTabIndex] = useState(0)
  const [inviteTypeIndex, setInviteTypeIndex] = useState(0)
  const [userToken, setUserToken] = useState('')
  const [deletePending, setDeletePending] = useState('')
  const [selectedAccordion, setSelectedAccordion] = useState('invite')
  const dispatch = useDispatch()
  const locationState = useLocationState()
  useEffect(() => {
    if (groupState.invitableUpdateNeeded.value === true && groupState.getInvitableGroupsInProgress.value !== true) {
      GroupService.getInvitableGroups(0)
    }
  }, [groupState.invitableUpdateNeeded.value, groupState.getInvitableGroupsInProgress.value])

  useEffect(() => {
    if (locationState.updateNeeded.value === true) {
      LocationService.getLocations()
    }
  }, [locationState.updateNeeded.value])

  const handleChange = (event: any, newValue: number): void => {
    event.preventDefault()
    setTabIndex(newValue)
    setUserToken('')
  }

  const handleInviteTypeChange = (e: any, newValue: number): void => {
    e.preventDefault()
    setInviteTypeIndex(newValue)
    if (newValue === 0 && tabIndex === 3) {
      setTabIndex(0)
    }
  }

  const updateInviteTargetType = (targetObjectType: string, targetObjectId: string) => {
    InviteService.updateInviteTarget(targetObjectType, targetObjectId)
    setUserToken('')
  }

  const handleInviteGroupChange = (event: React.ChangeEvent<{ value: string }>): void => {
    InviteService.updateInviteTarget('group', event.target.value)
  }

  const handleInviteChange = (event: any, newValue: number): void => {
    event.preventDefault()
    setInviteTabIndex(newValue)
  }

  const handleUserTokenChange = (event: any): void => {
    setUserToken(event.target.value)
  }

  const packageInvite = async (event: any): Promise<void> => {
    const mappedIDProvider = identityProviderTabMap.get(tabIndex)
    const sendData = {
      type: inviteState.targetObjectType.value === 'user' ? 'friend' : inviteState.targetObjectType.value,
      token: mappedIDProvider ? userToken : null,
      inviteCode: tabIndex === 2 ? userToken : null,
      identityProviderType: mappedIDProvider ? mappedIDProvider : null,
      targetObjectId: inviteState.targetObjectId.value,
      invitee: tabIndex === 3 ? userToken : null
    }

    InviteService.sendInvite(sendData)
    setUserToken('')
  }

  const showDeleteConfirm = (inviteId) => {
    setDeletePending(inviteId)
  }

  const cancelDelete = () => {
    setDeletePending('')
  }

  const confirmDelete = (inviteId) => {
    setDeletePending('')
    InviteService.removeInvite(inviteId)
  }

  const previousInvitePage = () => {
    if (inviteTabIndex === 0) {
      InviteService.retrieveReceivedInvites('decrement')
    } else {
      InviteService.retrieveSentInvites('decrement')
    }
  }

  const nextInvitePage = () => {
    if (inviteTabIndex === 0) {
      if (receivedInviteState.skip.value + receivedInviteState.limit.value < receivedInviteState.total.value) {
        InviteService.retrieveReceivedInvites('increment')
      }
    } else {
      if (sentInviteState.skip.value + sentInviteState.limit.value < sentInviteState.total.value) {
        InviteService.retrieveSentInvites('increment')
      }
    }
  }

  const acceptRequest = (invite) => {
    InviteService.acceptInvite(invite.id, invite.passcode)
  }

  const declineRequest = (invite) => {
    InviteService.declineInvite(invite)
  }

  useEffect(() => {
    if (inviteState.sentUpdateNeeded.value === true && inviteState.getSentInvitesInProgress.value !== true)
      InviteService.retrieveSentInvites()
    if (inviteState.receivedUpdateNeeded.value === true && inviteState.getReceivedInvitesInProgress.value !== true)
      InviteService.retrieveReceivedInvites()
    setInviteTypeIndex(targetObjectType?.value === 'party' ? 2 : targetObjectType?.value === 'group' ? 1 : 0)
    if (targetObjectType?.value == null || targetObjectType?.value?.length === 0)
      InviteService.updateInviteTarget('user', null)
    if (targetObjectType?.value != null && targetObjectId?.value != null) setSelectedAccordion('invite')
  }, [
    inviteState.sentUpdateNeeded.value,
    inviteState.receivedInvites.value,
    inviteState.receivedUpdateNeeded.value,
    inviteState.getReceivedInvitesInProgress.value,
    inviteState.targetObjectType.value
  ])

  const capitalize = (word) => word[0].toUpperCase() + word.slice(1)

  const onListScroll = (e): void => {
    if (e.target.scrollHeight - e.target.scrollTop === e.target.clientHeight) {
      nextInvitePage()
    }
  }

  const onSelectScroll = (e): void => {
    if (e.target.scrollHeight - e.target.scrollTop === e.target.clientHeight) {
      nextInvitableGroupsPage()
    }
  }

  const onFriendScroll = (e): void => {
    if (e.target.scrollHeight - e.target.scrollTop === e.target.clientHeight) {
      nextFriendsPage()
    }
  }

  const nextInvitableGroupsPage = () => {
    if (invitableGroupState.skip.value + invitableGroupState.limit.value < invitableGroupState.total.value) {
      GroupService.getInvitableGroups(invitableGroupState.skip.value + invitableGroupState.limit.value)
    }
  }

  const nextFriendsPage = (): void => {
    if (friendSubState.skip.value + friendSubState.limit.value < friendSubState.total.value) {
      FriendService.getFriends('', friendSubState.skip.value + friendSubState.limit.value)
    }
  }

  const handleAccordionSelect = (accordionType: string) => (event: React.ChangeEvent<{}>, isExpanded: boolean) => {
    if (accordionType === selectedAccordion) {
      setSelectedAccordion('')
    } else {
      setSelectedAccordion(accordionType)
    }
  }

  const provisionInstance = (location, instance?) => {
    InstanceConnectionService.provisionInstanceServer(location.id, instance?.id)
  }

  return (
    <div className={styles['invite-container']}>
      <SwipeableDrawer
        className={classNames({
          [styles['flex-column']]: true,
          [styles['list-container']]: true
        })}
        BackdropProps={{ invisible: true }}
        anchor="right"
        open={rightDrawerOpen === true}
        onClose={() => {
          setRightDrawerOpen(false)
          InviteService.updateInviteTarget('user', null)
          setTabIndex(0)
        }}
        onOpen={() => {
          setInviteTabIndex(0)
        }}
      >
        {/*<Accordion className={styles.rightDrawerAccordion} expanded={selectedAccordion === 'invite'} onChange={handleAccordionSelect('invite')}>*/}
        {/*    <AccordionSummary*/}
        {/*        id="invites-header"*/}
        {/*        expandIcon={<ExpandMore/>}*/}
        {/*        aria-controls="invites-content"*/}
        {/*    >*/}
        {/*        <Mail/>*/}
        {/*        <Typography>Invites</Typography>*/}
        {/*    </AccordionSummary>*/}
        {/*    <AccordionDetails className={styles['list-container']}>*/}
        <div
          className={classNames({
            [styles['list-container']]: true,
            [styles['solo-right']]: true
          })}
        >
          <div className={styles['close-button']} onClick={() => setRightDrawerOpen(false)}>
            <Close />
          </div>
          <div className={styles.title}>Invites</div>
          <Tabs
            value={inviteTabIndex}
            onChange={handleInviteChange}
            variant="fullWidth"
            indicatorColor="secondary"
            textColor="secondary"
            aria-label="Invites"
          >
            <Tab icon={<Add />} label="Create" />
            <Tab icon={<ArrowDownward />} label="Received" />
            <Tab icon={<ArrowUpward />} label="Sent" />
          </Tabs>
          {(inviteTabIndex === 2 || inviteTabIndex === 1) && (
            <List onScroll={(e) => onListScroll(e)}>
              {inviteTabIndex === 1 &&
                [...receivedInvites.value]
                  .sort((a, b) => {
                    return a.createdAt - b.createdAt
                  })
                  .map((invite, index) => {
                    return (
                      <div className={styles.invite} key={invite.id}>
                        <ListItem>
                          <ListItemAvatar>
                            <Avatar src={invite.user.avatarUrl} />
                          </ListItemAvatar>
                          {invite?.inviteType === 'friend' && (
                            <ListItemText>
                              {capitalize(invite?.inviteType || '')} request from {invite.user.name}
                            </ListItemText>
                          )}
                          {invite?.inviteType === 'group' && (
                            <ListItemText>
                              Join group {invite?.groupName} from {invite.user.name}
                            </ListItemText>
                          )}
                          {invite?.inviteType === 'party' && (
                            <ListItemText>Join a party from {invite.user.name}</ListItemText>
                          )}
                          <Button variant="contained" color="primary" onClick={() => acceptRequest(invite)}>
                            Accept
                          </Button>
                          <Button variant="contained" color="secondary" onClick={() => declineRequest(invite)}>
                            Decline
                          </Button>
                        </ListItem>
                        {index < receivedInvites.value.length - 1 && <Divider />}
                      </div>
                    )
                  })}
              {inviteTabIndex === 2 &&
                [...sentInvites.value]
                  .sort((a, b) => {
                    return a.createdAt - b.createdAt
                  })
                  .map((invite, index) => {
                    return (
                      <div className={styles.invite} key={invite.id}>
                        <ListItem>
                          <ListItemAvatar>
                            <Avatar src={invite.user.avatarUrl} />
                          </ListItemAvatar>
                          {invite?.inviteType === 'friend' && (
                            <ListItemText>
                              {capitalize(invite?.inviteType)} request to{' '}
                              {invite.invitee ? invite.invitee.name : invite.token}
                            </ListItemText>
                          )}
                          {invite?.inviteType === 'group' && (
                            <ListItemText>
                              Join group {invite?.groupName} to {invite.invitee ? invite.invitee.name : invite.token}
                            </ListItemText>
                          )}
                          {invite?.inviteType === 'party' && (
                            <ListItemText>
                              Join a party to {invite.invitee ? invite.invitee.name : invite.token}
                            </ListItemText>
                          )}
                          {deletePending !== invite.id && (
                            <Button onClick={() => showDeleteConfirm(invite.id)}>Uninvite</Button>
                          )}
                          {deletePending === invite.id && (
                            <div>
                              <Button variant="contained" color="primary" onClick={() => confirmDelete(invite)}>
                                Uninvite
                              </Button>
                              <Button variant="contained" color="secondary" onClick={() => cancelDelete()}>
                                Cancel
                              </Button>
                            </div>
                          )}
                        </ListItem>
                        {index < sentInvites.value.length - 1 && <Divider />}
                      </div>
                    )
                  })}
            </List>
          )}
          {inviteTabIndex === 0 && (
            <div>
              <div className={styles.title}>Send Request</div>
              <div className={styles['sub-header']}>Request Type</div>
              <Tabs
                value={inviteTypeIndex}
                onChange={handleInviteTypeChange}
                variant="fullWidth"
                indicatorColor="primary"
                textColor="primary"
                aria-label="Invite Type"
                className={styles['target-type']}
              >
                <Tab
                  icon={<SupervisedUserCircle style={{ fontSize: 30 }} />}
                  label="Friends"
                  onClick={() => updateInviteTargetType('user', undefined)}
                />
                <Tab
                  icon={<Group style={{ fontSize: 30 }} />}
                  label="Groups"
                  onClick={() => updateInviteTargetType('group', undefined)}
                />
                <Tab
                  icon={<GroupWork style={{ fontSize: 30 }} />}
                  label="Party"
                  onClick={() => {
                    if (party?.id) {
                      updateInviteTargetType('party', party.id)
                    }
                  }}
                />
              </Tabs>
              {inviteTypeIndex === 1 && (
                <div className={styles['flex-justify-center']}>
                  {invitableGroupState.total.value > 0 && (
                    <FormControl className={styles['group-select']}>
                      <InputLabel id="invite-group-select-label">Group</InputLabel>
                      <Select
                        labelId="invite-group-select-label"
                        id="invite-group-select"
                        value={inviteState.targetObjectId.value}
                        onChange={handleInviteGroupChange}
                        onScroll={onSelectScroll}
                      >
                        {invitableGroups.value.map((group) => {
                          return (
                            <MenuItem
                              className={classNames({
                                [styles['flex-center']]: true,
                                [styles['color-white']]: true
                              })}
                              key={group.id}
                              value={group.id}
                            >
                              {group.name}
                            </MenuItem>
                          )
                        })}
                      </Select>
                    </FormControl>
                  )}
                  {invitableGroupState.total.value === 0 && <div>You cannot invite people to any groups</div>}
                </div>
              )}
              {inviteTypeIndex === 2 && party == null && (
                <div className={styles['flex-justify-center']}>You are not currently in a party</div>
              )}
              {inviteTypeIndex === 2 && party != null && selfPartyUser?.isOwner !== true && (
                <div className={styles['flex-justify-center']}>You are not the owner of your current party</div>
              )}
              {!(
                (inviteTypeIndex === 1 && invitableGroupState.total.value === 0) ||
                (inviteTypeIndex === 1 &&
                  _.find(
                    invitableGroupState.groups.value,
                    (invitableGroup) => invitableGroup.id === inviteState.targetObjectId.value
                  ) == null) ||
                (inviteTypeIndex === 2 && party == null) ||
                (inviteTypeIndex === 2 && party != null && selfPartyUser?.isOwner !== true)
              ) && (
                <div>
                  <Tabs
                    value={tabIndex}
                    onChange={handleChange}
                    variant="fullWidth"
                    indicatorColor="secondary"
                    textColor="secondary"
                    aria-label="Invite Address"
                  >
                    <Tab icon={<Mail />} label="Email" />
                    <Tab icon={<PhoneIphone />} label="Phone #" />
                    <Tab icon={<AccountCircle />} label="Invite Code" />
                    {inviteTypeIndex !== 0 && <Tab icon={<SupervisedUserCircle />} label="Friend" />}
                  </Tabs>

                  <div className={styles.username}>
                    {tabIndex !== 3 && (
                      <TextField
                        variant="outlined"
                        margin="normal"
                        className={styles['invite-text']}
                        fullWidth
                        id="token"
                        label={
                          tabIndex === 0
                            ? "Recipient's email"
                            : tabIndex === 1
                            ? "Recipient's phone number"
                            : "Recipient's invite code"
                        }
                        name="name"
                        autoFocus
                        value={userToken}
                        onChange={(e) => handleUserTokenChange(e)}
                      />
                    )}
                    {tabIndex === 3 && (
                      <FormControl className={styles['friend-select']}>
                        <InputLabel id="invite-friend-select-label">Friend</InputLabel>
                        <Select
                          labelId="invite-friend-select-label"
                          id="invite-friend-select"
                          value={userToken}
                          onChange={(e) => handleUserTokenChange(e)}
                          onScroll={onFriendScroll}
                        >
                          {friends.map((friend) => {
                            return (
                              <MenuItem
                                className={classNames({
                                  [styles['flex-center']]: true,
                                  [styles['friend-selector']]: true
                                })}
                                key={friend.id}
                                value={friend.id}
                              >
                                {friend.name}
                              </MenuItem>
                            )
                          })}
                        </Select>
                      </FormControl>
                    )}
                    <Button
                      variant="contained"
                      color="primary"
                      className={styles['send-button']}
                      onClick={packageInvite}
                    >
                      Send
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        {/*    </AccordionDetails>*/}
        {/*</Accordion>*/}
        {/*<Accordion className={styles.rightDrawerAccordion} expanded={selectedAccordion === 'scenes'} onChange={handleAccordionSelect('scenes')}>*/}
        {/*    <AccordionSummary*/}
        {/*        id="scenes-header"*/}
        {/*        expandIcon={<ExpandMore/>}*/}
        {/*        aria-controls="scenes-content"*/}
        {/*    >*/}
        {/*        <Public/>*/}
        {/*        <Typography>Scenes</Typography>*/}
        {/*    </AccordionSummary>*/}
        {/*    <AccordionDetails className={styles['list-container']}>*/}
        {/*        <ImageList*/}
        {/*            cellHeight={160}*/}
        {/*            className={styles['location-grid']}*/}
        {/*            cols={4}*/}
        {/*        >*/}
        {/*            {locations.map((location) => {*/}
        {/*                return <ImageListItem*/}
        {/*                    key={location.id}*/}
        {/*                    cols={1}*/}
        {/*                    onClick={() => provisionInstance(location)}*/}
        {/*                >*/}
        {/*                    <div>{location.name}</div>*/}
        {/*                </ImageListItem>;*/}
        {/*            })}*/}
        {/*        </ImageList>*/}
        {/*    </AccordionDetails>*/}
        {/*</Accordion>*/}
      </SwipeableDrawer>
    </div>
  )
}

export default Invites
