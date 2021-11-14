import { Add, Close, Delete, Edit, Forum, GroupAdd, Inbox, MoreHoriz, Notifications, Search } from '@material-ui/icons'
import { AddCircleOutline, Check, Settings } from '@mui/icons-material'
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
  Box,
  Tabs,
  Tab
} from '@mui/material'
import Divider from '@mui/material/Divider'

import ListItem from '@mui/material/ListItem'

import { useFriendState } from '@xrengine/client-core/src/social/services/FriendService'
import { useGroupState } from '@xrengine/client-core/src/social/services/GroupService'
import { usePartyState } from '@xrengine/client-core/src/social/services/PartyService'
import { useLocationState } from '@xrengine/client-core/src/social/services/LocationService'
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
  const [type, setType] = React.useState('email')
  const [anchorEl, setAnchorEl] = React.useState(null)
  const [value, setValue] = React.useState(0)
  const [showNot, setShowNot] = React.useState(false)

  //friend state
  const friendState = useFriendState()
  const friendSubState = friendState.friends
  const friends = friendSubState.friends.value

  //group state
  const groupState = useGroupState()
  const groupSubState = groupState.groups
  const groups = groupSubState.groups.value

  //party state
  const party = usePartyState().party.value
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

  console.log('display friends')
  console.log(friends)

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
              onClick={() => setChat('party')}
              className={`${chat === 'party' ? classes.bgPrimary : classes.border} ${classes.roundedCircle} ${
                classes.mx2
              }`}
            >
              <span>Party</span>
            </a>
            <a
              href="#"
              onClick={() => setChat('friends')}
              className={`${chat === 'friends' ? classes.bgPrimary : classes.border} ${classes.roundedCircle} ${
                classes.mx2
              }`}
            >
              <span>Friends</span>
            </a>
            <a
              href="#"
              onClick={() => setChat('group')}
              className={`${chat === 'group' ? classes.bgPrimary : classes.border} ${classes.roundedCircle} ${
                classes.mx2
              }`}
            >
              <span>Group</span>
            </a>
            <a
              href="#"
              onClick={() => setChat('layer')}
              className={`${chat === 'layer' ? classes.bgPrimary : classes.border} ${classes.roundedCircle} ${
                classes.mx2
              }`}
            >
              <span>Layer</span>
            </a>
            <a
              href="#"
              onClick={() => setChat('instance')}
              className={`${chat === 'instance' ? classes.bgPrimary : classes.border} ${classes.roundedCircle} ${
                classes.mx2
              }`}
            >
              <span>Instance</span>
            </a>
          </div>
          {chat !== 'friends' ? '' : <div>friends</div>}
          {chat !== 'group' ? (
            ''
          ) : (
            <>
              <div className={classes.center}>
                <a href="#" className={`${classes.my2} ${classes.btn}`}>
                  CREATE GROUP
                </a>
              </div>
              {groups &&
                groups.length > 0 &&
                [...groups]
                  .sort((a, b) => a.name - b.name)
                  .map((group, index) => {
                    return (
                      <div
                        key={group.id}
                        className={`${classes.dFlex} ${classes.justifyContentBetween} ${classes.my2}`}
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
        </div>
        <div>
          <div className={`${classes.dFlex} ${classes.box} ${classes.mx2}`}>
            <Avatar src="./Avatar.png" />
            <div className={classes.mx2}>
              <h4 className={classes.fontBig}>Dwark Matths</h4>
              <small className={classes.textMuted}>You:</small>
              <small className={classes.textMuted}>UX Consulting</small>
            </div>
          </div>
        </div>
      </div>
      <Dialog fullWidth={true} maxWidth={'md'} open={create} onClose={handleCloseCreate}>
        <InviteModel />
      </Dialog>
      <InviteHarmony setShowNot={setShowNot} show={show} setShow={setShow} />
    </>
  )
}

export default LeftHarmony
