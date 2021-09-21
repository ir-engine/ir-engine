import Avatar from '@material-ui/core/Avatar'
import Button from '@material-ui/core/Button'
import Divider from '@material-ui/core/Divider'
import FormControl from '@material-ui/core/FormControl'
import InputLabel from '@material-ui/core/InputLabel'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemAvatar from '@material-ui/core/ListItemAvatar'
import ListItemText from '@material-ui/core/ListItemText'
import MenuItem from '@material-ui/core/MenuItem'
import Select from '@material-ui/core/Select'
import SwipeableDrawer from '@material-ui/core/SwipeableDrawer'
import Tab from '@material-ui/core/Tab'
import Tabs from '@material-ui/core/Tabs'
import TextField from '@material-ui/core/TextField'
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
import { useAuthState } from '@xrengine/client-core/src/user/reducers/auth/AuthState'
import { selectFriendState } from '@xrengine/client-core/src/social/reducers/friend/selector'
import { getFriends } from '@xrengine/client-core/src/social/reducers/friend/service'
import { selectSocialGroupState } from '@xrengine/client-core/src/social/reducers/group/selector'
import { getInvitableGroups } from '@xrengine/client-core/src/social/reducers/group/service'
import { selectInviteState } from '@xrengine/client-core/src/social/reducers/invite/selector'
import {
  acceptInvite,
  declineInvite,
  removeInvite,
  retrieveReceivedInvites,
  retrieveSentInvites,
  sendInvite,
  updateInviteTarget
} from '@xrengine/client-core/src/social/reducers/invite/service'
import { selectLocationState } from '@xrengine/client-core/src/social/reducers/location/selector'
import { getLocations } from '@xrengine/client-core/src/social/reducers/location/service'
import { User } from '@xrengine/common/src/interfaces/User'
import classNames from 'classnames'
import _ from 'lodash'
import React, { useEffect, useState } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators, Dispatch } from 'redux'
import { provisionInstanceServer } from '../../../reducers/instanceConnection/service'
import { selectPartyState } from '@xrengine/client-core/src/social/reducers/party/selector'
import styles from './Right.module.scss'

const mapStateToProps = (state: any): any => {
  return {
    friendState: selectFriendState(state),
    inviteState: selectInviteState(state),
    groupState: selectSocialGroupState(state),
    partyState: selectPartyState(state),
    locationState: selectLocationState(state)
  }
}

const mapDispatchToProps = (dispatch: Dispatch): any => ({
  getFriends: bindActionCreators(getFriends, dispatch),
  retrieveReceivedInvites: bindActionCreators(retrieveReceivedInvites, dispatch),
  retrieveSentInvites: bindActionCreators(retrieveSentInvites, dispatch),
  sendInvite: bindActionCreators(sendInvite, dispatch),
  removeInvite: bindActionCreators(removeInvite, dispatch),
  acceptInvite: bindActionCreators(acceptInvite, dispatch),
  declineInvite: bindActionCreators(declineInvite, dispatch),
  updateInviteTarget: bindActionCreators(updateInviteTarget, dispatch),
  getInvitableGroups: bindActionCreators(getInvitableGroups, dispatch),
  getLocations: bindActionCreators(getLocations, dispatch),
  provisionInstanceServer: bindActionCreators(provisionInstanceServer, dispatch)
})

interface Props {
  friendState?: any
  inviteState?: any
  retrieveReceivedInvites?: typeof retrieveReceivedInvites
  retrieveSentInvites?: typeof retrieveSentInvites
  sendInvite?: typeof sendInvite
  getFriends?: typeof getFriends
  removeInvite?: typeof removeInvite
  acceptInvite?: typeof acceptInvite
  declineInvite?: typeof declineInvite
  rightDrawerOpen?: any
  setRightDrawerOpen?: any
  groupState?: any
  updateInviteTarget?: any
  partyState?: any
  getInvitableGroups?: any
  locationState?: any
  getLocations?: any
  provisionInstanceServer?: any
}

const identityProviderTabMap = new Map()
identityProviderTabMap.set(0, 'email')
identityProviderTabMap.set(1, 'sms')

const Invites = (props: Props): any => {
  const {
    friendState,
    inviteState,
    sendInvite,
    retrieveReceivedInvites,
    retrieveSentInvites,
    getFriends,
    removeInvite,
    acceptInvite,
    declineInvite,
    groupState,
    updateInviteTarget,
    partyState,
    getInvitableGroups,
    locationState,
    getLocations,
    provisionInstanceServer,
    rightDrawerOpen,
    setRightDrawerOpen
  } = props
  const user = useAuthState().user
  const friendSubState = friendState.get('friends')
  const friends = friendSubState.get('friends')
  const receivedInviteState = inviteState.get('receivedInvites')
  const receivedInvites = receivedInviteState.get('invites')
  const sentInviteState = inviteState.get('sentInvites')
  const sentInvites = sentInviteState.get('invites')
  const targetObjectType = inviteState.get('targetObjectType')
  const targetObjectId = inviteState.get('targetObjectId')
  const invitableGroupState = groupState.get('invitableGroups')
  const invitableGroups = invitableGroupState.get('groups')
  const party = partyState.get('party')
  const selfPartyUser =
    party && party.partyUsers ? party.partyUsers.find((partyUser) => partyUser.userId === user.id.value) : {}
  const locations = locationState.get('locations').get('locations')
  const [tabIndex, setTabIndex] = useState(0)
  const [inviteTabIndex, setInviteTabIndex] = useState(0)
  const [inviteTypeIndex, setInviteTypeIndex] = useState(0)
  const [userToken, setUserToken] = useState('')
  const [deletePending, setDeletePending] = useState('')
  const [selectedAccordion, setSelectedAccordion] = useState('invite')

  useEffect(() => {
    if (groupState.get('invitableUpdateNeeded') === true && groupState.get('getInvitableGroupsInProgress') !== true) {
      getInvitableGroups(0)
    }
  }, [groupState])

  useEffect(() => {
    if (locationState.get('updateNeeded') === true) {
      getLocations()
    }
  }, [locationState])

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
    updateInviteTarget(targetObjectType, targetObjectId)
    setUserToken('')
  }

  const handleInviteGroupChange = (event: React.ChangeEvent<{ value: unknown }>): void => {
    updateInviteTarget('group', event.target.value)
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
      type: inviteState.get('targetObjectType') === 'user' ? 'friend' : inviteState.get('targetObjectType'),
      token: mappedIDProvider ? userToken : null,
      inviteCode: tabIndex === 2 ? userToken : null,
      identityProviderType: mappedIDProvider ? mappedIDProvider : null,
      targetObjectId: inviteState.get('targetObjectId'),
      invitee: tabIndex === 3 ? userToken : null
    }

    sendInvite(sendData)
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
    removeInvite(inviteId)
  }

  const previousInvitePage = () => {
    if (inviteTabIndex === 0) {
      retrieveReceivedInvites('decrement')
    } else {
      retrieveSentInvites('decrement')
    }
  }

  const nextInvitePage = () => {
    if (inviteTabIndex === 0) {
      if (receivedInviteState.get('skip') + receivedInviteState.get('limit') < receivedInviteState.get('total')) {
        retrieveReceivedInvites(receivedInviteState.get('skip') + receivedInviteState.get('limit'))
      }
    } else {
      if (sentInviteState.get('skip') + sentInviteState.get('limit') < sentInviteState.get('total')) {
        retrieveSentInvites(sentInviteState.get('skip') + sentInviteState.get('limit'))
      }
    }
  }

  const acceptRequest = (invite) => {
    acceptInvite(invite.id, invite.passcode)
  }

  const declineRequest = (invite) => {
    declineInvite(invite)
  }

  useEffect(() => {
    if (inviteState.get('sentUpdateNeeded') === true && inviteState.get('getSentInvitesInProgress') !== true)
      retrieveSentInvites()
    if (inviteState.get('receivedUpdateNeeded') === true && inviteState.get('getReceivedInvitesInProgress') !== true)
      retrieveReceivedInvites()
    setInviteTypeIndex(targetObjectType === 'party' ? 2 : targetObjectType === 'group' ? 1 : 0)
    if (targetObjectType == null || targetObjectType.length === 0) updateInviteTarget('user', null)
    if (targetObjectType != null && targetObjectId != null) setSelectedAccordion('invite')
  }, [inviteState])

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
    if (invitableGroupState.get('skip') + invitableGroupState.get('limit') < invitableGroupState.get('total')) {
      getInvitableGroups(invitableGroupState.get('skip') + invitableGroupState.get('limit'))
    }
  }

  const nextFriendsPage = (): void => {
    if (friendSubState.get('skip') + friendSubState.get('limit') < friendSubState.get('total')) {
      getFriends(friendSubState.get('skip') + friendSubState.get('limit'))
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
    provisionInstanceServer(location.id, instance?.id)
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
          updateInviteTarget('user', null)
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
                receivedInvites
                  .sort((a, b) => {
                    return a.created - b.created
                  })
                  .map((invite, index) => {
                    return (
                      <div className={styles.invite} key={invite.id}>
                        <ListItem>
                          <ListItemAvatar>
                            <Avatar src={invite.user.avatarUrl} />
                          </ListItemAvatar>
                          {invite.inviteType === 'friend' && (
                            <ListItemText>
                              {capitalize(invite.inviteType)} request from {invite.user.name}
                            </ListItemText>
                          )}
                          {invite.inviteType === 'group' && (
                            <ListItemText>
                              Join group {invite.groupName} from {invite.user.name}
                            </ListItemText>
                          )}
                          {invite.inviteType === 'party' && (
                            <ListItemText>Join a party from {invite.user.name}</ListItemText>
                          )}
                          <Button variant="contained" color="primary" onClick={() => acceptRequest(invite)}>
                            Accept
                          </Button>
                          <Button variant="contained" color="secondary" onClick={() => declineRequest(invite)}>
                            Decline
                          </Button>
                        </ListItem>
                        {index < receivedInvites.length - 1 && <Divider />}
                      </div>
                    )
                  })}
              {inviteTabIndex === 2 &&
                sentInvites
                  .sort((a, b) => {
                    return a.created - b.created
                  })
                  .map((invite, index) => {
                    return (
                      <div className={styles.invite} key={invite.id}>
                        <ListItem>
                          <ListItemAvatar>
                            <Avatar src={invite.user.avatarUrl} />
                          </ListItemAvatar>
                          {invite.inviteType === 'friend' && (
                            <ListItemText>
                              {capitalize(invite.inviteType)} request to{' '}
                              {invite.invitee ? invite.invitee.name : invite.token}
                            </ListItemText>
                          )}
                          {invite.inviteType === 'group' && (
                            <ListItemText>
                              Join group {invite.groupName} to {invite.invitee ? invite.invitee.name : invite.token}
                            </ListItemText>
                          )}
                          {invite.inviteType === 'party' && (
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
                        {index < sentInvites.length - 1 && <Divider />}
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
                  onClick={() => updateInviteTargetType('user', null)}
                />
                <Tab
                  icon={<Group style={{ fontSize: 30 }} />}
                  label="Groups"
                  onClick={() => updateInviteTargetType('group', null)}
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
                  {invitableGroupState.get('total') > 0 && (
                    <FormControl className={styles['group-select']}>
                      <InputLabel id="invite-group-select-label">Group</InputLabel>
                      <Select
                        labelId="invite-group-select-label"
                        id="invite-group-select"
                        value={inviteState.get('targetObjectId')}
                        onChange={handleInviteGroupChange}
                        onScroll={onSelectScroll}
                      >
                        {invitableGroups.map((group) => {
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
                  {invitableGroupState.get('total') === 0 && <div>You cannot invite people to any groups</div>}
                </div>
              )}
              {inviteTypeIndex === 2 && party == null && (
                <div className={styles['flex-justify-center']}>You are not currently in a party</div>
              )}
              {inviteTypeIndex === 2 &&
                party != null &&
                selfPartyUser?.isOwner !== true &&
                selfPartyUser?.isOwner !== 1 && (
                  <div className={styles['flex-justify-center']}>You are not the owner of your current party</div>
                )}
              {!(
                (inviteTypeIndex === 1 && invitableGroupState.get('total') === 0) ||
                (inviteTypeIndex === 1 &&
                  _.find(
                    invitableGroupState.get('groups'),
                    (invitableGroup) => invitableGroup.id === inviteState.get('targetObjectId')
                  ) == null) ||
                (inviteTypeIndex === 2 && party == null) ||
                (inviteTypeIndex === 2 &&
                  party != null &&
                  selfPartyUser?.isOwner !== true &&
                  selfPartyUser?.isOwner !== 1)
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
        {/*        <GridList*/}
        {/*            cellHeight={160}*/}
        {/*            className={styles['location-grid']}*/}
        {/*            cols={4}*/}
        {/*        >*/}
        {/*            {locations.map((location) => {*/}
        {/*                return <GridListTile*/}
        {/*                    key={location.id}*/}
        {/*                    cols={1}*/}
        {/*                    onClick={() => provisionInstance(location)}*/}
        {/*                >*/}
        {/*                    <div>{location.name}</div>*/}
        {/*                </GridListTile>;*/}
        {/*            })}*/}
        {/*        </GridList>*/}
        {/*    </AccordionDetails>*/}
        {/*</Accordion>*/}
      </SwipeableDrawer>
    </div>
  )
}

export default connect(mapStateToProps, mapDispatchToProps)(Invites)
