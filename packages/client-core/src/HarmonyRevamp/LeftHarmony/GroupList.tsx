import React, { useContext } from 'react'
import { useGroupState } from '@xrengine/client-core/src/social/services/GroupService'
import { ChatService } from '@xrengine/client-core/src/social/services/ChatService'
import { useHarmonyStyles } from '../style'
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
import { InviteService } from '@xrengine/client-core/src/social/services/InviteService'
import { GroupService } from '@xrengine/client-core/src/social/services/GroupService'
import ModeContext from '../context/modeContext'

interface Props {
  setShowChat: any
  toggleUpdateDrawer: (anchor: string, open: boolean) => void
}
const initialGroupForm = {
  id: '',
  name: '',
  groupUsers: [],
  description: ''
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

const GroupList = (props: Props) => {
  const { setShowChat, toggleUpdateDrawer } = props
  const { darkMode } = useContext(ModeContext)
  const classes = useHarmonyStyles()
  const [anchorEl, setAnchorEl] = React.useState(null)
  const [groupForm, setGroupForm] = React.useState(initialGroupForm)
  const [groupFormMode, setGroupFormMode] = React.useState('create')
  const [selectedGroup, setSelectedGroup] = React.useState(initialGroupForm)
  const [openDrawer, setOpen] = React.useState(false)
  const [state, setState] = React.useState({ right: false })
  const [groupDeletePending, setGroupDeletePending] = React.useState('')
  const [list, setList] = React.useState({ right: false })
  const [create, setCreate] = React.useState(false)
  const [detailsType, setDetailsType] = React.useState('')
  const [selectedUser, setSelectedUser] = React.useState(initialSelectedUserState)

  //group state
  const groupState = useGroupState()
  const groupSubState = groupState.groups
  const groups = groupSubState.groups.value

  const setActiveChat = (channelType, target): void => {
    ChatService.updateMessageScrollInit(true)
    ChatService.updateChatTarget(channelType, target)
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

  const toggleDrawer = (anchor, open) => (event) => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return
    }
    setState({ ...state, [anchor]: open })
    handleClose()
  }

  const handleClose = () => {
    setGroupForm(initialGroupForm)
    setGroupFormMode('create')
    setSelectedGroup(initialGroupForm)
    setAnchorEl(null)
  }

  const handleOpenDrawer = () => {
    setOpen(true)
  }

  const confirmGroupDelete = (e, groupId) => {
    e.preventDefault()
    setGroupDeletePending('')
    GroupService.removeGroup(groupId)
    handleClose()
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

  const handleCreate = () => {
    setCreate(true)
  }

  const open = Boolean(anchorEl)
  const id = open ? 'simple-popover' : undefined

  return (
    <div>
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
                  <h4 className={`${classes.fontBig} ${darkMode ? classes.white : classes.textBlack}`}>{group.name}</h4>
                  <small className={classes.textMuted}>You:</small>
                  <small className={classes.textMuted}>{group.description}</small>
                </div>

                <div>
                  <a href="#" className={classes.border0} onClick={(e) => openDetails(e, 'group', group)}>
                    <MoreHoriz className={darkMode ? classes.white : classes.textBlack} />
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
                        <MenuItem className={classes.my2} onClick={(e) => confirmGroupDelete(e, selectedGroup.id)}>
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
                          className={`${classes.my2} ${classes.btn} ${darkMode ? classes.btnDark : classes.whiteBg}`}
                        >
                          <small>VIEW MEMBERS</small>
                        </a>
                        <Drawer anchor={'right'} open={list['right']} onClose={toggleList('right', false)}>
                          <Container className={classes.bgDark} style={{ height: '100vh', overflowY: 'scroll' }}>
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
    </div>
  )
}

export default GroupList
