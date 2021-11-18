import { Add, Close, Delete, Edit, Forum, GroupAdd, Inbox, MoreHoriz, Notifications, Search } from '@material-ui/icons'
import { AddCircleOutline, Check, PhotoCamera, Settings } from '@mui/icons-material'
import {
  Badge,
  Container,
  IconButton,
  MenuList,
  MenuItem,
  List,
  ListItemAvatar,
  ListItemIcon,
  ListItemText,
  Popover,
  Dialog,
  Typography,
  Avatar,
  Box,
  Drawer,
  Switch,
  Tabs,
  Tab
} from '@mui/material'
import Divider from '@mui/material/Divider'
import queryString from 'querystring'
import { useHistory } from 'react-router-dom'
import ListItem from '@mui/material/ListItem'
import { ChatService } from '@xrengine/client-core/src/social/services/ChatService'
import { useFriendState } from '@xrengine/client-core/src/social/services/FriendService'
import { useGroupState } from '@xrengine/client-core/src/social/services/GroupService'
import { usePartyState } from '@xrengine/client-core/src/social/services/PartyService'
import { useLocationState } from '@xrengine/client-core/src/social/services/LocationService'
import { GroupService } from '@xrengine/client-core/src/social/services/GroupService'
import { FriendService } from '@xrengine/client-core/src/social/services/FriendService'
import { useAuthState } from '@xrengine/client-core/src/user/services/AuthService'
import * as React from 'react'
import InviteHarmony from './InviteHarmony'
import { useHarmonyStyles } from './style'
import InviteModel from './InviteModel'
import GroupMembers from './Group/GroupMember'
import CreateGroup from './Group/CreateGroup'
import { InviteService } from '@xrengine/client-core/src/social/services/InviteService'
import { PartyService } from '@xrengine/client-core/src/social/services/PartyService'
import ModeContext from './context/modeContext'
import Party from './party'

interface Props {
  setShowChat: any
}

const LeftHarmony = (props: Props) => {
  const { setShowChat } = props
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

  const classes = useHarmonyStyles()
  const { darkMode, setDarkMode } = React.useContext(ModeContext)
  const [checked, setChecked] = React.useState(JSON.parse(localStorage.getItem('mode')))

  const persed = queryString.parse(location.search)
  const history = useHistory()
  const [show, setShow] = React.useState(false)
  const [create, setCreate] = React.useState(false)
  const [chat, setChat] = React.useState(persed['?channel'] ? persed['?channel'] : 'party')
  const [invite, setInvite] = React.useState('')
  const [anchorEl, setAnchorEl] = React.useState(null)
  const [showNot, setShowNot] = React.useState(false)
  const [tabIndex, setTabIndex] = React.useState(0)

  const [detailsType, setDetailsType] = React.useState('')
  const [state, setState] = React.useState({ right: false })
  const [openDrawer, setOpen] = React.useState(false)
  const [openCreateDrawer, setOpenCreate] = React.useState(false)
  const [list, setList] = React.useState({ right: false })

  React.useEffect(() => {
    if (!persed['?channel']) {
      history.push({
        pathname: '/harmony',
        search: '?channel=party'
      })
    }
  })

  const channelTypeChangeHandler = (type: string) => {
    setChat(type)
    history.push({
      pathname: '/harmony',
      search: `?channel=${type}`
    })
  }

  // Current User
  const selfUser = useAuthState().user.value

  //friend state
  const friendState = useFriendState()
  const friendSubState = friendState.friends
  const friends = friendSubState.friends.value

  //group state
  const groupState = useGroupState()
  const groupSubState = groupState.groups
  const groups = groupSubState.groups.value

  const [groupFormOpen, setGroupFormOpen] = React.useState(false)

  const [groupFormMode, setGroupFormMode] = React.useState('create')

  const [groupForm, setGroupForm] = React.useState(initialGroupForm)
  const [selectedUser, setSelectedUser] = React.useState(initialSelectedUserState)
  const [selectedGroup, setSelectedGroup] = React.useState(initialGroupForm)
  const [groupDeletePending, setGroupDeletePending] = React.useState('')

  //party state
  const party = usePartyState().party?.value
  const currentLocation = useLocationState().currentLocation.location

  const handleChange = (event) => {
    const mode = event.target.checked
    setChecked(mode)
    setDarkMode(mode)
    localStorage.setItem('mode', JSON.stringify(mode))
  }

  const handleClickOpen = () => {
    setShow(true)
  }

  const handleCreate = () => {
    setCreate(true)
  }

  const handleCloseCreate = () => {
    setCreate(false)
  }

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget)
  }

  const openDetails = (e, type, object) => {
    handleClick(e)
    setDetailsType(type)
    setGroupFormMode('update')
    e.stopPropagation()
    if (type === 'user') {
      setSelectedUser(object)
    } else if (type === 'group') {
      setSelectedGroup(object)
      setGroupForm({ ...groupForm, name: object.name, description: object.description, id: object.id })
    }
  }

  const createNewParty = (): void => {
    PartyService.createParty()
  }

  const handleClose = () => {
    setGroupForm(initialGroupForm)
    setGroupFormMode('create')
    setSelectedGroup(initialGroupForm)
    setDetailsType('')
    setAnchorEl(null)
  }

  const handleUpdateClose = () => {
    setAnchorEl(null)
  }

  const handleOpenDrawer = () => {
    setOpen(true)
  }
  const handleCloseDrawer = () => {
    setOpen(false)
  }
  const handleOpenCreateDrawer = () => {
    setOpenCreate(true)
  }
  const handleCloseCreateDrawer = () => {
    setOpenCreate(false)
  }

  const nextFriendsPage = (): void => {
    if (friendSubState.skip.value + friendSubState.limit.value < friendSubState.total.value) {
      FriendService.getFriends('', friendSubState.skip.value + friendSubState.limit.value)
    }
  }

  const nextGroupsPage = (): void => {
    if (groupSubState.skip.value + groupSubState.limit.value < groupSubState.total.value) {
      GroupService.getGroups(groupSubState.skip.value + groupSubState.limit.value)
    }
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

  const setActiveChat = (channelType, target): void => {
    ChatService.updateMessageScrollInit(true)
    ChatService.updateChatTarget(channelType, target)
  }

  const handleGroupCreateInput = (e: any): void => {
    const value = e.target.value
    const form = Object.assign({}, groupForm)
    form[e.target.name] = value
    setGroupForm(form)
  }

  const closeDrawer = (anchor, open) => {
    setState({ ...state, [anchor]: open })
  }

  const submitGroup = (e: any): void => {
    e.preventDefault()

    const group = {
      id: groupForm.id,
      name: groupForm.name,
      description: groupForm.description
    }

    if (groupFormMode === 'create') {
      delete group.id
      GroupService.createGroup(group)
    } else {
      GroupService.patchGroup(group)
    }
    setGroupForm(initialGroupForm)
    closeDrawer('right', false)
    setGroupFormMode('create')
  }

  const toggleDrawer = (anchor, open) => (event) => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return
    }

    setState({ ...state, [anchor]: open })
    handleClose()
  }

  const toggleUpdateDrawer = (anchor, open) => (event) => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return
    }

    setState({ ...state, [anchor]: open })
    handleUpdateClose()
  }

  const toggleList = (anchor, open) => (event) => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return
    }

    setList({ ...state, [anchor]: open })
  }

  const openInvite = (targetObjectType?: string, targetObjectId?: string): void => {
    InviteService.updateInviteTarget(targetObjectType, targetObjectId)
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
    handleClose()
  }

  const open = Boolean(anchorEl)
  const id = open ? 'simple-popover' : undefined

  return (
    <>
      <div className={`${classes.dFlex} ${classes.flexColumn} ${classes.justifyContentBetween} ${classes.hAuto}`}>
        <div>
          <div className={`${classes.dFlex} ${classes.justifyContentBetween} ${classes.alignCenter}`}>
            <h4 className={darkMode ? classes.white : classes.textBlack}>Chats</h4>
            <div className={`${classes.dFlex} ${classes.alignCenter}`}>
              <IconButton color="primary" component="span" onClick={handleClickOpen}>
                <Badge color="secondary" variant={showNot ? 'dot' : ''}>
                  <Notifications className={darkMode ? classes.white : classes.secondaryText} />
                </Badge>
              </IconButton>
              <IconButton component="span">
                <Search className={darkMode ? classes.white : classes.secondaryText} />
              </IconButton>
              <IconButton component="span" onClick={handleCreate}>
                <Add className={darkMode ? classes.white : classes.secondaryText} />
              </IconButton>
            </div>
          </div>
          <div className={`${classes.dFlex} ${classes.flexWrap} ${classes.alignCenter} ${classes.my2}`}>
            <a
              href="#"
              onClick={() => {
                channelTypeChangeHandler('party')
                setShowChat(false)
                setActiveChat('party', null)
              }}
              className={`${chat === 'party' ? classes.bgPrimary : darkMode ? classes.border : classes.borderLight} ${
                classes.roundedCircle
              } ${classes.mx2}`}
            >
              <span>Party</span>
            </a>
            <a
              href="#"
              onClick={() => {
                channelTypeChangeHandler('friends')
                setShowChat(false)
                setActiveChat('friends', null)
              }}
              className={`${chat === 'friends' ? classes.bgPrimary : darkMode ? classes.border : classes.borderLight} ${
                classes.roundedCircle
              } ${classes.mx2}`}
            >
              <span>Friends</span>
            </a>
            <a
              href="#"
              onClick={() => {
                channelTypeChangeHandler('group')
                setShowChat(false)
                setActiveChat('group', null)
              }}
              className={`${chat === 'group' ? classes.bgPrimary : darkMode ? classes.border : classes.borderLight} ${
                classes.roundedCircle
              } ${classes.mx2}`}
            >
              <span>Group</span>
            </a>
            <a
              href="#"
              onClick={() => {
                channelTypeChangeHandler('layer')
                setShowChat(false)
                setActiveChat('layer', null)
              }}
              className={`${chat === 'layer' ? classes.bgPrimary : darkMode ? classes.border : classes.borderLight} ${
                classes.roundedCircle
              } ${classes.mx2}`}
            >
              <span>Layer</span>
            </a>
            <a
              href="#"
              onClick={() => {
                channelTypeChangeHandler('instance')
                setShowChat(false)
                setActiveChat('instance', null)
              }}
              className={`${
                chat === 'instance' ? classes.bgPrimary : darkMode ? classes.border : classes.borderLight
              } ${classes.roundedCircle} ${classes.mx2}`}
            >
              <span>Instance</span>
            </a>
          </div>
          {chat !== 'friends' ? (
            ''
          ) : (
            <>
              <div className={classes.center}>
                <a
                  href="#"
                  className={`${classes.my2} ${classes.btn} ${darkMode ? classes.btnDark : classes.whiteBg}`}
                  onClick={handleCreate}
                >
                  INVITE FRIENDS
                </a>
              </div>
              <List onScroll={(e) => onListScroll(e)}>
                {friends &&
                  friends.length > 0 &&
                  [...friends]
                    .sort((a, b) => a.name - b.name)
                    .map((friend, index) => {
                      return (
                        <div key={friend.id}>
                          <ListItem className={classes.cpointer}>
                            <ListItemAvatar>
                              <Avatar src={friend.avatarUrl} />
                            </ListItemAvatar>
                            <div
                              className={`${classes.dFlex} ${classes.alignCenter} ${classes.my2} ${classes.flexGrow2}`}
                            >
                              <div
                                onClick={() => {
                                  setActiveChat('user', friend), setShowChat(true)
                                }}
                                className={`${classes.mx2} ${classes.flexGrow2}`}
                              >
                                <h4 className={classes.fontBig}>{friend.name}</h4>
                                <small className={classes.textMuted}>Hello Buddy</small>
                              </div>
                              <div>
                                <a href="#" className={classes.border0} onClick={handleClick}>
                                  <MoreHoriz />
                                </a>
                                <Popover
                                  id={id}
                                  open={open}
                                  anchorEl={anchorEl}
                                  onClose={handleClose}
                                  anchorOrigin={{
                                    vertical: 'bottom',
                                    horizontal: 'right'
                                  }}
                                  transformOrigin={{
                                    vertical: 'center',
                                    horizontal: 'left'
                                  }}
                                >
                                  <div className={classes.bgDark}>
                                    <MenuList sx={{ width: 210, maxWidth: '100%', borderRadius: 10 }}>
                                      <MenuItem
                                        className={classes.my2}
                                        onClick={() => {
                                          setActiveChat('user', friend), setShowChat(true), handleClose()
                                        }}
                                      >
                                        <ListItemIcon>
                                          <Forum fontSize="small" className={classes.info} />
                                        </ListItemIcon>
                                        <ListItemText>CHAT</ListItemText>
                                      </MenuItem>
                                      <MenuItem
                                        className={classes.my2}
                                        onClick={() => {
                                          openInvite('user', friend.id),
                                            handleClose(),
                                            setInvite('Friends'),
                                            handleCreate()
                                        }}
                                      >
                                        <ListItemIcon>
                                          <GroupAdd fontSize="small" className={classes.success} />
                                        </ListItemIcon>
                                        <ListItemText>INVITE</ListItemText>
                                      </MenuItem>
                                      <MenuItem className={classes.my2}>
                                        <ListItemIcon>
                                          <Delete fontSize="small" className={classes.danger} />
                                        </ListItemIcon>
                                        <ListItemText>UNFRIEND</ListItemText>
                                      </MenuItem>
                                    </MenuList>
                                  </div>
                                </Popover>
                              </div>
                            </div>
                          </ListItem>
                          {index < friends.length - 1 && <Divider />}
                        </div>
                      )
                    })}
              </List>
            </>
          )}

          {chat !== 'party' ? (
            ''
          ) : (
            <>
              <div className={classes.center}>
                <a
                  href="#"
                  className={`${classes.my2} ${classes.btn} ${darkMode ? classes.btnDark : classes.whiteBg}`}
                  onClick={() => createNewParty()}
                >
                  <b>CREATE PARTY</b>
                </a>
              </div>
              {party && party.length > 0 && (
                <Party
                  party={party}
                  setActiveChat={setActiveChat}
                  setShowChat={setShowChat}
                  handleClick={handleClick}
                />
              )}
            </>
          )}
          {chat !== 'group' ? (
            ''
          ) : (
            <>
              <div className={classes.center}>
                <a
                  href="#"
                  onClick={toggleDrawer('right', true)}
                  className={`${classes.my2} ${classes.btn} ${darkMode ? classes.btnDark : classes.whiteBg}`}
                >
                  <b>CREATE GROUP</b>
                </a>
                <Drawer anchor={'right'} open={state['right']} onClose={toggleDrawer('right', false)}>
                  <Container
                    className={darkMode ? classes.bgDark : classes.bgWhite}
                    style={{ height: '100vh', overflowY: 'scroll' }}
                  >
                    <div className={`${classes.dFlex} ${classes.alignCenter} ${classes.p5}`}>
                      <AddCircleOutline />
                      &nbsp;&nbsp;&nbsp;&nbsp;
                      <h1>{groupFormMode === 'create' ? 'CREATE' : 'UPDATE'} GROUP</h1>
                    </div>
                    <div className={classes.p5}>
                      <form onSubmit={(e) => submitGroup(e)}>
                        <div className="form-group">
                          <label htmlFor="" className={classes.mx2}>
                            <p>Name:</p>
                          </label>
                          <input
                            type="text"
                            className={darkMode ? classes.formControls : classes.formControlsLight}
                            id="name"
                            name="name"
                            value={groupForm.name}
                            autoFocus
                            placeholder="Enter group name"
                            onChange={(e) => handleGroupCreateInput(e)}
                          />
                        </div>
                        <div className="form-group">
                          <label htmlFor="" className={classes.mx2}>
                            <p>Description:</p>
                          </label>
                          <input
                            type="text"
                            className={darkMode ? classes.formControls : classes.formControlsLight}
                            id="description"
                            name="description"
                            value={groupForm.description}
                            placeholder="Enter description"
                            onChange={(e) => handleGroupCreateInput(e)}
                          />
                        </div>
                        <div className={`${classes.dFlex} ${classes.my2}`} style={{ width: '100%' }}>
                          <button
                            className={`${classes.selfEnd} ${classes.roundedCircle} ${classes.borderNone} ${classes.mx2} ${classes.bgPrimary}`}
                          >
                            <b className={classes.white}>{groupFormMode === 'create' ? 'Create' : 'Update'} Now</b>
                          </button>
                        </div>
                      </form>
                    </div>
                  </Container>
                </Drawer>
              </div>
              {groups &&
                groups.length > 0 &&
                [...groups]
                  .sort((a, b) => a.name - b.name)
                  .map((group, index) => {
                    return (
                      <div
                        key={group.id}
                        className={`${classes.dFlex} ${classes.alignCenter} ${classes.flexGrow2} ${classes.my2} ${classes.cpointer}`}
                        onClick={() => {
                          setActiveChat('group', group), setShowChat(true)
                        }}
                      >
                        <div className={`${classes.mx2} ${classes.flexGrow2}`}>
                          <h4 className={classes.fontBig}>{group.name}</h4>
                          <small className={classes.textMuted}>You:</small>
                          <small className={classes.textMuted}>{group.description}</small>
                        </div>

                        <div>
                          <a href="#" className={classes.border0} onClick={(e) => openDetails(e, 'group', group)}>
                            <MoreHoriz />
                          </a>
                          <Popover
                            id={id}
                            open={open}
                            anchorEl={anchorEl}
                            onClose={handleClose}
                            anchorOrigin={{
                              vertical: 'bottom',
                              horizontal: 'right'
                            }}
                            transformOrigin={{
                              vertical: 'center',
                              horizontal: 'left'
                            }}
                          >
                            <div className={classes.bgDark}>
                              <MenuList sx={{ width: 210, maxWidth: '100%', borderRadius: 10 }}>
                                <MenuItem
                                  className={classes.my2}
                                  onClick={() => {
                                    setActiveChat('group', group), setShowChat(true), handleClose()
                                  }}
                                >
                                  <ListItemIcon>
                                    <Forum fontSize="small" className={classes.info} />
                                  </ListItemIcon>
                                  <ListItemText>CHAT</ListItemText>
                                </MenuItem>
                                <MenuItem className={classes.my2} onClick={toggleUpdateDrawer('right', true)}>
                                  <ListItemIcon>
                                    <Edit fontSize="small" className={classes.muted} />
                                  </ListItemIcon>
                                  <ListItemText>EDIT</ListItemText>
                                </MenuItem>
                                <MenuItem
                                  className={classes.my2}
                                  onClick={() => {
                                    openInvite('group', group.id), handleClose(), setInvite('Group'), handleCreate()
                                  }}
                                >
                                  <ListItemIcon>
                                    <GroupAdd fontSize="small" className={classes.success} />
                                  </ListItemIcon>
                                  <ListItemText>INVITE</ListItemText>
                                </MenuItem>
                                <MenuItem
                                  className={classes.my2}
                                  onClick={(e) => confirmGroupDelete(e, selectedGroup.id)}
                                >
                                  <ListItemIcon>
                                    <Delete fontSize="small" className={classes.danger} />
                                  </ListItemIcon>
                                  <ListItemText>DELETE</ListItemText>
                                </MenuItem>
                              </MenuList>
                              <div className={classes.center}>
                                <a
                                  href="#"
                                  onClick={() => {
                                    handleOpenDrawer(), handleClose()
                                  }}
                                  className={`${classes.my2} ${classes.btn}`}
                                >
                                  <small>VIEW MEMBERS</small>
                                </a>
                                <Drawer anchor={'right'} open={list['right']} onClose={toggleList('right', false)}>
                                  <Container
                                    className={classes.bgDark}
                                    style={{ height: '100vh', overflowY: 'scroll' }}
                                  >
                                    <div className={`${classes.dFlex} ${classes.alignCenter} ${classes.p5}`}>
                                      <AddCircleOutline />
                                      &nbsp;&nbsp;&nbsp;&nbsp;
                                      <h1>
                                        GROUP TEST 1 <small>&nbsp;&nbsp; 12 Members (s)</small>
                                      </h1>
                                    </div>
                                    <div
                                      className={`${classes.dFlex} ${classes.justifyContentBetween} ${classes.alignCenter} ${classes.my2} ${classes.p5}`}
                                    >
                                      <div className={`${classes.dFlex} ${classes.alignCenter}`}>
                                        <Avatar src="./Avatar.png" />
                                        <div className={classes.mx2}>
                                          <h4 className={classes.fontBig}>John laouireen</h4>
                                        </div>
                                      </div>
                                      <a href="#" className={classes.border0}>
                                        <Delete fontSize="small" className={classes.danger} />
                                      </a>
                                    </div>
                                  </Container>
                                </Drawer>
                              </div>
                            </div>
                          </Popover>
                        </div>
                      </div>
                    )
                  })}
            </>
          )}
        </div>
        <div
          className={`${classes.dFlex} ${classes.justifyContentBetween} ${
            darkMode ? classes.darkBg : classes.whiteBg
          } ${classes.mx2} ${classes.px2}`}
        >
          <div className={`${classes.dFlex} ${classes.alignCenter} ${classes.box}`}>
            <Avatar src={selfUser.avatarUrl} />
            <div className={classes.mx2}>
              <h4 className={`${classes.fontBig} ${darkMode && classes.white}`}>{selfUser.name}</h4>
              <small className={`${classes.textMuted} ${darkMode && classes.white}`}>You're: </small>
              <small className={`${classes.textMuted} ${darkMode && classes.white}`}>{selfUser.userRole}</small>
            </div>
          </div>
          <div className={`${classes.dFlex} ${classes.alignCenter}`}>
            <Switch checked={checked} onChange={handleChange} inputProps={{ 'aria-label': 'controlled' }} />
            <IconButton aria-label="upload picture" component="span">
              <Settings className={darkMode && classes.white} />
            </IconButton>
          </div>
        </div>
      </div>
      <Dialog
        fullWidth={true}
        maxWidth={'md'}
        open={create}
        onClose={() => {
          handleCloseCreate(), setInvite('')
        }}
      >
        <InviteModel invite={invite} />
      </Dialog>
      <InviteHarmony setShowNot={setShowNot} show={show} setShow={setShow} />
      <GroupMembers openDrawer={openDrawer} handleCloseDrawer={handleCloseDrawer} />
      <CreateGroup openCreateDrawer={openCreateDrawer} handleCloseCreateDrawer={handleCloseCreateDrawer} />
    </>
  )
}

export default LeftHarmony
