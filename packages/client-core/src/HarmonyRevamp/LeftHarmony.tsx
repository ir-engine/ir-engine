import { Add, Delete, Edit, Forum, GroupAdd, Inbox, MoreHoriz, Notifications, Search } from '@material-ui/icons'
import { AddCircleOutline, Check } from '@mui/icons-material'
import {
  Badge,
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
  Box
} from '@mui/material'
import Divider from '@mui/material/Divider'

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
import { AnyContext } from '@hookstate/core'
import { InviteService } from '@xrengine/client-core/src/social/services/InviteService'

interface Props {
  setShowChat: AnyContext
}

const LeftHarmony = (props: Props) => {
  const { setShowChat } = props
  const classes = useHarmonyStyles()
  const [show, setShow] = React.useState(false)
  const [create, setCreate] = React.useState(false)
  const [chat, setChat] = React.useState('party')
  const [invite, setInvite] = React.useState('')

  const [type, setType] = React.useState('email')
  const [messageDeletePending, setMessageDeletePending] = React.useState('')
  const [messageUpdatePending, setMessageUpdatePending] = React.useState('')
  const [editingMessage, setEditingMessage] = React.useState('')
  const [composingMessage, setComposingMessage] = React.useState('')
  const [anchorEl, setAnchorEl] = React.useState(null)
  const [value, setValue] = React.useState(0)
  const [showNot, setShowNot] = React.useState(false)
  const [tabIndex, setTabIndex] = React.useState(0)
  const [selectorsOpen, setSelectorsOpen] = React.useState(false)
  const [dimensions, setDimensions] = React.useState({
    height: window.innerHeight,
    width: window.innerWidth
  })
  const [state, setState] = React.useState({ right: false })
  const [openDrawer, setOpen] = React.useState(false)
  const [openCreateDrawer, setOpenCreate] = React.useState(false)
  const [list, setList] = React.useState({ right: false })

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

  //party state
  const party = usePartyState().party?.value
  const currentLocation = useLocationState().currentLocation.location

  //friend state
  const friendState = useFriendState()
  const friendSubState = friendState.friends
  const friends = friendSubState.friends.value

  //group state
  const groupState = useGroupState()
  const groupSubState = groupState.groups
  const groups = groupSubState.groups.value

  //party state
  const party = usePartyState().party?.value
  const currentLocation = useLocationState().currentLocation.location

  const handleChange = (event, newValue) => {
    setValue(newValue)
  }

  const handleClickOpen = () => {
    setShowNot(false)
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

  const handleClose = () => {
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

  const toggleDrawer = (anchor, open) => (event) => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return
    }

    setState({ ...state, [anchor]: open })
  }

  const toggleList = (anchor, open) => (event) => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return
    }

    setList({ ...state, [anchor]: open })
  }

  const toggleDrawer = (anchor, open) => (event) => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return
    }

    setState({ ...state, [anchor]: open })
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
  const open = Boolean(anchorEl)
  const id = open ? 'simple-popover' : undefined

  return (
    <>
      <div className={`${classes.dFlex} ${classes.flexColumn} ${classes.justifyContentBetween} ${classes.h1002}`}>
        <div>
          <div className={`${classes.dFlex} ${classes.justifyContentBetween}`}>
            <h4>Chats</h4>
            <div className={`${classes.dFlex} ${classes.alignCenter}`}>
              <IconButton color="primary" component="span" onClick={handleClickOpen}>
                <Badge color="secondary" variant={showNot ? 'dot' : ''}>
                  <Notifications className={classes.primaryText} />
                </Badge>
              </IconButton>
              <IconButton component="span">
                <Search className={classes.primaryText} />
              </IconButton>
              <IconButton component="span" onClick={handleCreate}>
                <Add className={classes.secondaryText} />
              </IconButton>
            </div>
          </div>
          <div className={`${classes.dFlex} ${classes.flexWrap} ${classes.alignCenter} ${classes.my2}`}>
            <a
              href="#"
              onClick={() => {
                setChat('party')
                setShowChat(false)
                setActiveChat('party', {})
              }}
              className={`${chat === 'party' ? classes.bgPrimary : classes.border} ${classes.roundedCircle} ${
                classes.mx2
              }`}
            >
              <span>Party</span>
            </a>
            <a
              href="#"
              onClick={() => {
                setChat('friends')
                setShowChat(false)
                setActiveChat('friends', {})
              }}
              className={`${chat === 'friends' ? classes.bgPrimary : classes.border} ${classes.roundedCircle} ${
                classes.mx2
              }`}
            >
              <span>Friends</span>
            </a>
            <a
              href="#"
              onClick={() => {
                setChat('group')
                setShowChat(false)
                setActiveChat('group', {})
              }}
              className={`${chat === 'group' ? classes.bgPrimary : classes.border} ${classes.roundedCircle} ${
                classes.mx2
              }`}
            >
              <span>Group</span>
            </a>
            <a
              href="#"
              onClick={() => {
                setChat('layer')
                setShowChat(false)
                setActiveChat('layer', {})
              }}
              className={`${chat === 'layer' ? classes.bgPrimary : classes.border} ${classes.roundedCircle} ${
                classes.mx2
              }`}
            >
              <span>Layer</span>
            </a>
            <a
              href="#"
              onClick={() => {
                setChat('instance')
                setShowChat(false)
                setActiveChat('instance', {})
              }}
              className={`${chat === 'instance' ? classes.bgPrimary : classes.border} ${classes.roundedCircle} ${
                classes.mx2
              }`}
            >
              <span>Instance</span>
            </a>
          </div>
          {chat !== 'friends' ? (
            ''
          ) : (
            <>
              <div className={classes.center}>
                <a href="#" className={`${classes.my2} ${classes.btn}`} onClick={handleCreate}>
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
                          <ListItem
                            className={classes.cpointer}
                            onClick={() => {
                              if (dimensions.width <= 768) setSelectorsOpen(false)
                            }}
                          >
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
                <a href="#" className={`${classes.my2} ${classes.btn}`}>
                  CREATE PARTY
                </a>
              </div>
              {party &&
                party.length > 0 &&
                [...party]
                  .sort((a, b) => a.createdAt - b.createdAt)
                  .map((part) => {
                    return (
                      <div
                        key={part.id}
                        className={`${classes.dFlex} ${classes.alignCenter} ${classes.my2} ${classes.cpointer}`}
                        onClick={() => {
                          if (dimensions.width <= 768) setSelectorsOpen(false)
                        }}
                      >
                        <div
                          onClick={() => {
                            setActiveChat('party', part), setShowChat(true)
                          }}
                          className={`${classes.mx2} ${classes.flexGrow2}`}
                        >
                          <h4 className={classes.fontBig}>{part.name}</h4>
                          <small className={classes.textMuted}>Party id: </small>
                          <small className={classes.textMuted}>{part.instance?.ipAddress}</small>
                        </div>

                        <div>
                          <a href="#" className={classes.border0} onClick={handleClick}>
                            <MoreHoriz />
                          </a>
                        </div>
                      </div>
                    )
                  })}
            </>
          )}
          {chat !== 'group' ? (
            ''
          ) : (
            <>
              <div className={classes.center}>
                <a href="#" className={`${classes.my2} ${classes.btn}`}>
                  CREATE PARTY
                </a>
              </div>
              {party &&
                party.length > 0 &&
                [...party]
                  .sort((a, b) => a.createdAt - b.createdAt)
                  .map((part) => {
                    return (
                      <div
                        key={part.id}
                        className={`${classes.dFlex} ${classes.justifyContentBetween} ${classes.my2} ${classes.cpointer}`}
                        onClick={() => {
                          setActiveChat('party', part)
                          if (dimensions.width <= 768) setSelectorsOpen(false)
                        }}
                      >
                        <div className={classes.mx2}>
                          <h4 className={classes.fontBig}>{part.name}</h4>
                          <small className={classes.textMuted}>Party id:</small>
                          <small className={classes.textMuted}>{part.id}</small>
                        </div>
                        <div className={classes.mx2}></div>

                        

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
                                <MenuItem className={classes.my2}>
                                  <ListItemIcon>
                                    <Forum fontSize="small" className={classes.info} />
                                  </ListItemIcon>
                                  <ListItemText>CHAT</ListItemText>
                                </MenuItem>
                                <MenuItem className={classes.my2}>
                                  <ListItemIcon>
                                    <Edit fontSize="small" className={classes.muted} />
                                  </ListItemIcon>
                                  <ListItemText>EDIT</ListItemText>
                                </MenuItem>
                                <MenuItem className={classes.my2}>
                                  <ListItemIcon>
                                    <GroupAdd fontSize="small" className={classes.success} />
                                  </ListItemIcon>
                                  <ListItemText>INVITE</ListItemText>
                                </MenuItem>
                                <MenuItem className={classes.my2}>
                                  <ListItemIcon>
                                    <Delete fontSize="small" className={classes.danger} />
                                  </ListItemIcon>
                                  <ListItemText>DELETE</ListItemText>
                                </MenuItem>
                              </MenuList>
                              <div className={classes.center}>
                                <a href="#" className={`${classes.my2} ${classes.btn}`}>
                                  CREATE GROUP
                                </a>
                              </div>
                            </div>
                          </Popover>
                        </div>
                      </div>
                    )
                  })}
            </>
          )}
          {chat !== 'group' ? (
            ''
          ) : (
            <>
              <div className={classes.center}>
                <a href="#" onClick={toggleDrawer('right', true)} className={`${classes.my2} ${classes.btn}`}>
                  CREATE GROUP
                </a>
              </div>
              {groups &&
                groups.length > 0 &&
                [...groups]
                  .sort((a, b) => a.createdAt - b.createdAt)
                  .map((group, index) => {
                    return (
                      <div
                        key={group.id}
                        className={`${classes.dFlex} ${classes.alignCenter} ${classes.my2} ${classes.cpointer}`}
                        onClick={() => {
                          if (dimensions.width <= 768) setSelectorsOpen(false)
                        }}
                      >
                        <div
                          className={classes.flexGrow2}
                          onClick={() => {
                            setActiveChat('group', group), setShowChat(true)
                          }}
                        >
                          <div className={classes.mx2}>
                            <h4 className={classes.fontBig}>{group.name}</h4>
                            <small className={classes.textMuted}>You:</small>
                            <small className={classes.textMuted}>{group.description}</small>
                          </div>
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
                                    setActiveChat('group', group), setShowChat(true), handleClose()
                                  }}
                                >
                                  <ListItemIcon>
                                    <Forum fontSize="small" className={classes.info} />
                                  </ListItemIcon>
                                  <ListItemText>CHAT</ListItemText>
                                </MenuItem>
                                <MenuItem className={classes.my2}>
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
                                <MenuItem className={classes.my2}>
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
        <div>
          <div className={`${classes.dFlex} ${classes.box} ${classes.mx2}`}>
            <Avatar src={selfUser.avatarUrl} />
            <div className={classes.mx2}>
              <h4 className={classes.fontBig}>{selfUser.name}</h4>
              <small className={classes.textMuted}>You are:</small>
              <small className={classes.textMuted}>{selfUser.userRole}</small>
            </div>
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
        <div className={`${classes.dFlex} ${classes.justifyContentBetween} ${classes.alignCenter} ${classes.bgModal}`}>
          <button
            className={`${classes.btns} ${state === 'Received' && classes.borderBottom}`}
            onClick={() => setState('Received')}
          >
            <b className={`${state === 'Received' && classes.info}`}>RECEIVED</b>
          </button>
          <button
            className={`${classes.btns} ${state === 'Sent' && classes.borderBottom}`}
            onClick={() => setState('Sent')}
          >
            <b className={`${state === 'Sent' && classes.info}`}>SENT</b>
          </button>
        </div>
        <div className={`${classes.bgModal} ${classes.p4}`}>
          {state === 'Received' ? (
            <div className={`${classes.dFlex} ${classes.justifyContentBetween} ${classes.alignCenter} ${classes.my2}`}>
              <div className={`${classes.dFlex} ${classes.alignCenter} ${classes.mx2}`}>
                <Avatar src="./Avatar.png" />
                {/* <img src={Avatar} alt="" width="44" height="44" /> */}
                <div className={classes.mx2}>
                  <h4 className={classes.fontBig}>Dwark Matths</h4>
                  <small className={classes.textMuted}>12 Aug 2021</small>
                </div>
              </div>
              <div className={`${classes.dFlex} ${classes.alignCenter}`}>
                <button className={`${classes.smallBtn} ${classes.lightDanger}`}>
                  <Close fontSize="small" style={{ color: '#DD3333' }} />
                </button>
                <button className={`${classes.smallBtn} ${classes.lightSuccess}`}>
                  <Check fontSize="small" style={{ color: '#57C290' }} />
                </button>
              </div>
            </div>
          ) : (
            <div className={`${classes.dFlex} ${classes.justifyContentBetween} ${classes.alignCenter} ${classes.my2}`}>
              <div className={`${classes.dFlex} ${classes.alignCenter} ${classes.mx2}`}>
                <Avatar src="./Avatar.png" />
                <div className={classes.mx2}>
                  <h4 className={classes.fontBig}>Dwark Matths</h4>
                  <small className={classes.textMuted}>12 Aug 2021</small>
                </div>
              </div>
              <button className={`${classes.my2} ${classes.btn}`}>
                <span className={classes.danger}>Uninvite</span>
              </button>
            </div>
          )}
        </div>
      </Dialog>
      <Dialog fullWidth={true} maxWidth={'md'} open={create} onClose={handleCloseCreate}>
        <InviteModel />
      </Dialog>
      <InviteHarmony setShowNot={setShowNot} show={show} setShow={setShow} />
      <GroupMembers openDrawer={openDrawer} handleCloseDrawer={handleCloseDrawer} />
      <CreateGroup openCreateDrawer={openCreateDrawer} handleCloseCreateDrawer={handleCloseCreateDrawer} />
    </>
  )
}

export default LeftHarmony
