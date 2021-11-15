import { Add, Close, Delete, Edit, Forum, GroupAdd, Inbox, MoreHoriz, Notifications, Search } from '@material-ui/icons'
import { AddCircleOutline, Check, Settings } from '@mui/icons-material'
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
  Tabs,
  Tab
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

function TabPanel(props) {
  const { children, value, index, ...other } = props

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`vertical-tabpanel-${index}`}
      aria-labelledby={`vertical-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  )
}

function a11yProps(index) {
  return {
    id: `vertical-tab-${index}`,
    'aria-controls': `vertical-tabpanel-${index}`
  }
}

const LeftHarmony: React.FunctionComponent = () => {
  const classes = useHarmonyStyles()
  const [show, setShow] = React.useState(false)
  const [create, setCreate] = React.useState(false)
  const [chat, setChat] = React.useState('party')
<<<<<<< HEAD
  const [type, setType] = React.useState('email')
  const [invite, setInvite] = React.useState('')
  const [messageDeletePending, setMessageDeletePending] = React.useState('')
  const [messageUpdatePending, setMessageUpdatePending] = React.useState('')
  const [editingMessage, setEditingMessage] = React.useState('')
  const [composingMessage, setComposingMessage] = React.useState('')
=======
>>>>>>> de47bcfce... Fixed errors and started deleted, edit message
  const [anchorEl, setAnchorEl] = React.useState(null)
  const [value, setValue] = React.useState(0)
  const [showNot, setShowNot] = React.useState(false)
  const [tabIndex, setTabIndex] = React.useState(0)
  const [selectorsOpen, setSelectorsOpen] = React.useState(false)
  const [dimensions, setDimensions] = React.useState({
    height: window.innerHeight,
    width: window.innerWidth
  })
<<<<<<< HEAD
  const [state, setState] = React.useState({ right: false })
  const [list, setList] = React.useState({ right: false })
=======
  // Current User
  const selfUser = useAuthState().user.value
>>>>>>> de47bcfce... Fixed errors and started deleted, edit message

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

  const open = Boolean(anchorEl)
  const id = open ? 'simple-popover' : undefined

  return (
    <>
      <div className={`${classes.dFlex} ${classes.flexColumn} ${classes.justifyContentBetween} ${classes.h100}`}>
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
                              setActiveChat('user', friend)
                              if (dimensions.width <= 768) setSelectorsOpen(false)
                            }}
                          >
                            <ListItemAvatar>
                              <Avatar src={friend.avatarUrl} />
                            </ListItemAvatar>
                            <div className={`${classes.dFlex} ${classes.justifyContentBetween} ${classes.my2}`}>
                              <div className={classes.mx2}>
                                <h4 className={classes.fontBig}>{friend.name}</h4>
                                <small className={classes.textMuted}>Hello Buddy</small>
                              </div>
                              <div className={classes.mx2}></div>

                              <div>
                                <a href="#" className={classes.border0} onClick={handleClick}>
                                  <MoreHoriz />
                                </a>
                              </div>
                            </div>

                            {/* <ListItemIcon onClick={(e) => openDetails(e, 'user', friend)}>
                              <Settings />
                            </ListItemIcon> */}
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
                <Drawer anchor={'right'} open={state['right']} onClose={toggleDrawer('right', false)}>
                  <Container className={classes.bgDark} style={{ height: '100vh', overflowY: 'scroll' }}>
                    <div className={`${classes.dFlex} ${classes.alignCenter} ${classes.p5}`}>
                      <AddCircleOutline />
                      &nbsp;&nbsp;&nbsp;&nbsp;
                      <h1>CREATE GROUP</h1>
                    </div>
                    <div className={classes.p5}>
                      <form>
                        <div className="form-group">
                          <label htmlFor="" className={classes.mx2}>
                            <p>Name:</p>
                          </label>
                          <input type="text" className={classes.formControls} placeholder="Enter group name" />
                        </div>
                        <div className="form-group">
                          <label htmlFor="" className={classes.mx2}>
                            <p>Description:</p>
                          </label>
                          <input type="text" className={classes.formControls} placeholder="Enter description" />
                        </div>
                        <div className={`${classes.dFlex} ${classes.my2}`} style={{ width: '100%' }}>
                          <button
                            className={`${classes.selfEnd} ${classes.roundedCircle} ${classes.borderNone} ${classes.mx2} ${classes.bgPrimary}`}
                          >
                            <b className={classes.white}>Create Now</b>
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
                  .sort((a, b) => a.createdAt - b.createdAt)
                  .map((group, index) => {
                    return (
                      <div
                        key={group.id}
                        className={`${classes.dFlex} ${classes.justifyContentBetween} ${classes.my2} ${classes.cpointer}`}
                        onClick={() => {
                          setActiveChat('group', group)
                          if (dimensions.width <= 768) setSelectorsOpen(false)
                        }}
                      >
                        <div>
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
                                <MenuItem
                                  className={classes.my2}
                                  onClick={() => {
                                    handleClose(), setInvite('Group'), handleCreate()
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
                                  onClick={toggleList('right', true)}
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
        <InviteModel invite={invite} />
      </Dialog>
      <InviteHarmony setShowNot={setShowNot} show={show} setShow={setShow} />
    </>
  )
}

export default LeftHarmony
