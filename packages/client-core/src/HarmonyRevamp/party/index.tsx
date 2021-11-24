import React, { useContext } from 'react'
import { MoreHoriz, Forum, GroupAdd, Delete } from '@material-ui/icons'
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
import { useAuthState } from '@xrengine/client-core/src/user/services/AuthService'
import { PartyService } from '@xrengine/client-core/src/social/services/PartyService'
import { usePartyState } from '@xrengine/client-core/src/social/services/PartyService'
import { useHarmonyStyles } from '../style'
import ModeContext from '../context/modeContext'
import ViewMembers from './ViewMembers'

interface Props {
  setActiveChat: any
  setShowChat: any
  setInvite: any
  handleCreate: any
  selfUser: any
}

const Party = (props: Props) => {
  const classes = useHarmonyStyles()
  const { darkMode } = useContext(ModeContext)
  const [openDrawer, setOpenDrawer] = React.useState(false)
  const { setActiveChat, setShowChat, setInvite, handleCreate, selfUser } = props
  const [anchorEl, setAnchorEl] = React.useState(null)
  const [showWarning, setShowWarning] = React.useState(false)
  const user = useAuthState().user.value
  const partyState = usePartyState()
  const party = partyState.party.value

  const handleClose = () => {
    setAnchorEl(null)
  }

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget)
  }

  const openInvite = (targetObjectType?: string, targetObjectId?: string): void => {
    InviteService.updateInviteTarget(targetObjectType, targetObjectId)
  }

  const handleOpenDrawer = () => {
    setOpenDrawer(true)
  }

  const showPartyDeleteConfirm = (e) => {
    e.preventDefault()
    setShowWarning(true)
  }

  const cancelPartyDelete = (e) => {
    e.preventDefault()
    setShowWarning(false)
  }

  const confirmPartyDelete = (e, partyId) => {
    e.preventDefault()
    setShowWarning(false)
    PartyService.removeParty(partyId)
  }

  React.useEffect(() => {
    if (partyState.updateNeeded.value) {
      PartyService.getParty()
    }
  }, [partyState.updateNeeded.value])

  const open = Boolean(anchorEl)
  const id = open ? 'simple-popover' : undefined
  const partyUsers = party?.partyUsers?.length ? party.partyUsers : []
  let selfPartyUser
  for (const partyUser of partyUsers) {
    if (partyUser.userId === user.id) selfPartyUser = { ...partyUser }
  }

  return (
    <>
      {party && (
        <div className={`${classes.dFlex} ${classes.alignCenter} ${classes.my2} ${classes.cpointer}`}>
          <div
            onClick={() => {
              setShowChat(true), setActiveChat('party', party)
            }}
            className={`${classes.mx2} ${classes.flexGrow2}`}
          >
            <h4 className={classes.fontBig}>{party.name}</h4>
            <small className={classes.textMuted}>Current party </small>
            <small className={classes.textMuted}>{party.instance?.ipAddress}</small>
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
              <div className={darkMode ? classes.bgDark : classes.bgLight}>
                <MenuList sx={{ width: 210, maxWidth: '100%', borderRadius: 10 }}>
                  <MenuItem
                    className={classes.my2}
                    onClick={() => {
                      setActiveChat('party', party), setShowChat(true), handleClose()
                    }}
                  >
                    <ListItemIcon>
                      <Forum fontSize="small" className={classes.info} />
                    </ListItemIcon>
                    <ListItemText>CHAT</ListItemText>
                  </MenuItem>
                  {(selfPartyUser?.isOwner === true || selfPartyUser?.isOwner === 1) && (
                    <MenuItem
                      className={classes.my2}
                      onClick={() => {
                        openInvite('party', party.id), handleClose(), setInvite('Party'), handleCreate()
                      }}
                    >
                      <ListItemIcon>
                        <GroupAdd fontSize="small" className={classes.success} />
                      </ListItemIcon>
                      <ListItemText>INVITE</ListItemText>
                    </MenuItem>
                  )}
                  {(selfPartyUser?.isOwner === true || selfPartyUser?.isOwner === 1) && (
                    <MenuItem className={classes.my2} onClick={showPartyDeleteConfirm}>
                      <ListItemIcon>
                        <Delete fontSize="small" className={classes.danger} />
                      </ListItemIcon>
                      <ListItemText>Delete</ListItemText>
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
      )}
      <ViewMembers selectedParty={party} selfUser={selfUser} setOpenDrawer={setOpenDrawer} openDrawer={openDrawer} />
      <Dialog
        open={showWarning}
        onClose={() => setShowWarning(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        classes={{ paper: classes.paperDialog }}
      >
        <DialogTitle id="alert-dialog-title">Confirm party deletion!</DialogTitle>
        <DialogActions>
          <Button onClick={cancelPartyDelete} className={classes.spanNone}>
            Cancel
          </Button>
          <Button className={classes.spanDange} onClick={confirmPartyDelete} autoFocus>
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default Party
