import React, { useContext } from 'react'
import { useGroupState } from '@xrengine/client-core/src/social/services/GroupService'
import { ChatService } from '@xrengine/client-core/src/social/services/ChatService'
import { useHarmonyStyles } from '../style'
import { Delete, Edit, Forum, GroupAdd, MoreHoriz } from '@material-ui/icons'
import { AddCircleOutline } from '@mui/icons-material'
import {
  Container,
  MenuList,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Popover,
  Dialog,
  DialogActions,
  DialogTitle,
  Button,
  Avatar,
  Drawer
} from '@mui/material'
import { InviteService } from '@xrengine/client-core/src/social/services/InviteService'
import { GroupService } from '@xrengine/client-core/src/social/services/GroupService'
import ModeContext from '../context/modeContext'

interface Props {
  setShowChat: any
  setInvite: any
  setCreate: any
  toggleUpdateDrawer: (anchor: string, open: boolean) => void
  openDetails: (e: any, type: string, object: any) => void
  isUserRank: string
  anchorEl: any
  setAnchorEl: any
  selfUser: any
  selectedGroup: any
  handleClose: () => void
}

const GroupList = (props: Props) => {
  const {
    setShowChat,
    setInvite,
    setCreate,
    toggleUpdateDrawer,
    anchorEl,
    setAnchorEl,
    selfUser,
    openDetails,
    selectedGroup,
    handleClose,
    isUserRank
  } = props
  const { darkMode } = useContext(ModeContext)
  const classes = useHarmonyStyles()
  const [openDrawer, setOpenDrawer] = React.useState(false)
  const [showWarning, setShowWarning] = React.useState(false)

  //group state
  const groupState = useGroupState()
  const groupSubState = groupState.groups
  const groups = groupSubState.groups.value

  const setActiveChat = (channelType, target): void => {
    ChatService.updateMessageScrollInit(true)
    ChatService.updateChatTarget(channelType, target)
  }

  const openInvite = (targetObjectType?: string, targetObjectId?: string): void => {
    InviteService.updateInviteTarget(targetObjectType, targetObjectId)
  }

  const handleOpenDrawer = () => {
    setOpenDrawer(true)
  }

  const showGroupDeleteConfirm = () => {
    setAnchorEl(null)
    setShowWarning(true)
  }

  const cancelGroupDelete = (e: any) => {
    e.preventDefault()
    setShowWarning(false)
    handleClose()
  }

  const confirmGroupDelete = (e) => {
    e.preventDefault()
    setShowWarning(false)
    GroupService.removeGroup(selectedGroup.id)
    handleClose()
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
                  <a
                    href="#"
                    className={classes.border0}
                    onClick={(e) => {
                      openDetails(e, 'group', group)
                      // handleClick(e)
                    }}
                  >
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
                        {(isUserRank === 'owner' || isUserRank === 'admin') && (
                          <MenuItem
                            className={classes.my2}
                            onClick={() => {
                              openInvite('group', selectedGroup.id), handleClose(), setCreate(true), setInvite('Group')
                            }}
                          >
                            <ListItemIcon>
                              <GroupAdd fontSize="small" className={classes.success} />
                            </ListItemIcon>
                            <ListItemText>INVITE</ListItemText>
                          </MenuItem>
                        )}
                        {isUserRank === 'owner' && (
                          <MenuItem className={classes.my2} onClick={showGroupDeleteConfirm}>
                            <ListItemIcon>
                              <Delete fontSize="small" className={classes.danger} />
                            </ListItemIcon>
                            <ListItemText>DELETE</ListItemText>
                          </MenuItem>
                        )}
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
                      </div>
                    </div>
                  </Popover>
                </div>
              </div>
            )
          })}
      <Drawer
        anchor={'right'}
        open={openDrawer}
        onClose={() => {
          setOpenDrawer(false)
        }}
      >
        <Container className={classes.bgDark} style={{ height: '100vh', overflowY: 'scroll' }}>
          <div className={`${classes.dFlex} ${classes.alignCenter} ${classes.p5}`}>
            <AddCircleOutline />
            &nbsp;&nbsp;&nbsp;&nbsp;
            <h1>
              {selectedGroup && selectedGroup.name.toUpperCase()}{' '}
              <small>&nbsp;&nbsp; {selectedGroup && selectedGroup.groupUsers?.length} Members (s)</small>
            </h1>
          </div>
          {selectedGroup &&
            selectedGroup.groupUsers?.length > 0 &&
            selectedGroup.groupUsers
              .map((groupUser) => groupUser) //Makes a copy of the state; otherwise, .sort attempts to alter state directly, which hookState throws errors on
              .sort((a, b) => a.name - b.name)
              .map((groupUser) => {
                return (
                  <div
                    key={groupUser.id}
                    className={`${classes.dFlex} ${classes.justifyContentBetween} ${classes.alignCenter} ${classes.my2} ${classes.p5}`}
                  >
                    <div className={`${classes.dFlex} ${classes.alignCenter}`}>
                      <Avatar src={groupUser.avatarUrl} />
                      {selfUser.id === groupUser.user.id && (
                        <div className={classes.mx2}>
                          <h4 className={classes.fontBig}>{groupUser.user.name + ' (you)'}</h4>
                        </div>
                      )}
                      {selfUser.id !== groupUser.user.id && (
                        <div className={classes.mx2}>
                          <h4 className={classes.fontBig}>{groupUser.user.name}</h4>
                        </div>
                      )}
                    </div>
                    <a href="#" className={classes.border0}>
                      <Delete fontSize="small" className={classes.danger} />
                    </a>
                  </div>
                )
              })}
        </Container>
      </Drawer>
      <Dialog
        open={showWarning}
        onClose={() => setShowWarning(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        classes={{ paper: classes.paperDialog }}
      >
        <DialogTitle id="alert-dialog-title">Confirm to delete this group!</DialogTitle>
        <DialogActions>
          <Button onClick={cancelGroupDelete} className={classes.spanNone}>
            Cancel
          </Button>
          <Button className={classes.spanDange} onClick={confirmGroupDelete} autoFocus>
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  )
}

export default GroupList
