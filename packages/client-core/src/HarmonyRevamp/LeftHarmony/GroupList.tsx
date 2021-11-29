import React, { useContext } from 'react'
import { useGroupState } from '@xrengine/client-core/src/social/services/GroupService'
import { ChatService } from '@xrengine/client-core/src/social/services/ChatService'
import { useHarmonyStyles } from '../style'
import { Delete, Edit, Forum, GroupAdd, MoreHoriz } from '@material-ui/icons'
import {
  MenuList,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Popover,
  Dialog,
  DialogActions,
  DialogTitle,
  Button
} from '@mui/material'
import { InviteService } from '@xrengine/client-core/src/social/services/InviteService'
import { GroupService } from '@xrengine/client-core/src/social/services/GroupService'
import ModeContext from '../context/modeContext'
import ViewMembers from './ViewMembers'
import ListItem from '@mui/material/ListItem'
import List from '@mui/material/List'
import { useHistory } from 'react-router-dom'
import queryString from 'querystring'

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
  const history = useHistory()
  const persed = queryString.parse(location.search)

  //group state
  const groupState = useGroupState()
  const groupSubState = groupState.groups
  const groups = groupSubState.groups.value

  const setActiveChat = (channelType, target): void => {
    history.push({
      pathname: '/harmony',
      search: `?channel=${channelType}&&id=${target.id}`
    })
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
    <List>
      {groups &&
        groups.length > 0 &&
        [...groups]
          .sort((a, b) => a.name - b.name)
          .map((group, index) => {
            return (
              <ListItem
                key={group.id}
                classes={{ selected: darkMode ? classes.selected : classes.selectedLigth }}
                className={`${classes.dFlex} ${classes.alignCenter} ${classes.flexGrow2} ${classes.my2} ${
                  classes.cpointer
                } ${darkMode ? classes.bgActive : classes.bgActiveLight}`}
                selected={persed.id === group.id}
                button
              >
                <div
                  className={`${classes.mx2} ${classes.flexGrow2}`}
                  onClick={() => {
                    setActiveChat('group', group), setShowChat(true)
                  }}
                >
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
                    <div className={darkMode ? classes.bgDark : classes.bgLight}>
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
              </ListItem>
            )
          })}
      {openDrawer && (
        <ViewMembers
          selectedGroup={selectedGroup}
          selfUser={selfUser}
          setOpenDrawer={setOpenDrawer}
          openDrawer={openDrawer}
        />
      )}

      <Dialog
        open={showWarning}
        onClose={() => setShowWarning(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        classes={{ paper: classes.paperDialog }}
      >
        <DialogTitle id="alert-dialog-title">Confirm group deletion!</DialogTitle>
        <DialogActions>
          <Button onClick={cancelGroupDelete} className={classes.spanNone}>
            Cancel
          </Button>
          <Button className={classes.spanDange} onClick={confirmGroupDelete} autoFocus>
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </List>
  )
}

export default GroupList
