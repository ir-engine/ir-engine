import React, { useContext } from 'react'
import { Container, Avatar, Drawer, Dialog, DialogActions, DialogTitle, Button } from '@mui/material'
import { useHarmonyStyles } from '../style'
import ModeContext from '../context/modeContext'
import { AddCircleOutline } from '@mui/icons-material'
import { Delete } from '@mui/icons-material'
import IconButton from '@mui/material/IconButton'
import { PartyService } from '@xrengine/client-core/src/social/services/PartyService'

interface Props {
  selectedParty: any
  selfUser: any
  openDrawer: boolean
  setOpenDrawer: any
}

const ViewMembers = ({ selectedParty, selfUser, openDrawer, setOpenDrawer }: Props) => {
  const { darkMode } = useContext(ModeContext)
  const classes = useHarmonyStyles()
  const [showWarning, setShowWarning] = React.useState(false)
  const [partyUserId, setPartyUserId] = React.useState('')

  const selfPartyUser =
    selectedParty &&
    selectedParty.partyUsers?.length > 0 &&
    selectedParty.partyUsers.find((partyUser) => partyUser.userId === selfUser.id)

  //   const [openDrawer, setOpenDrawer] = React.useState(false)

  const removeUser = (id) => {
    setPartyUserId(id)
    setShowWarning(true)
  }

  const cancelPartyUserDelete = (e: any) => {
    e.preventDefault()
    setShowWarning(false)
  }

  const confirmPartyUserDelete = (e) => {
    e.preventDefault()
    setShowWarning(false)
    PartyService.removePartyUser(partyUserId)
  }
  return (
    <div>
      <Drawer
        anchor={'right'}
        open={openDrawer}
        onClose={() => {
          setOpenDrawer(false)
        }}
      >
        {openDrawer && (
          <Container
            className={darkMode ? classes.bgDark : classes.bgLight}
            style={{ height: '100vh', overflowY: 'scroll' }}
          >
            <div className={`${classes.dFlex} ${classes.alignCenter} ${classes.p5}`}>
              <AddCircleOutline />
              &nbsp;&nbsp;&nbsp;&nbsp;
              <h1>
                {selectedParty && selectedParty.name.toUpperCase()}{' '}
                <small>&nbsp;&nbsp; {selectedParty && selectedParty.partyUsers?.length} Members (s)</small>
              </h1>
            </div>
            {selectedParty &&
              selectedParty?.partyUsers?.length > 0 &&
              selectedParty?.partyUsers
                .map((partyUser) => partyUser) //Makes a copy of the state; otherwise, .sort attempts to alter state directly, which hookState throws errors on
                .sort((a, b) => a.name - b.name)
                .map((partyUser) => {
                  return (
                    <div
                      key={partyUser.id}
                      className={`${classes.dFlex} ${classes.justifyContentBetween} ${classes.alignCenter} ${classes.my2} ${classes.p5}`}
                    >
                      <div className={`${classes.dFlex} ${classes.alignCenter}`}>
                        <Avatar src={partyUser.avatarUrl} />
                        {selfUser.id === partyUser.user.id && (
                          <div className={classes.mx2}>
                            <h4 className={classes.fontBig}>{partyUser.user.name + ' (you)'}</h4>
                          </div>
                        )}
                        {selfUser.id !== partyUser.user.id && (
                          <div className={classes.mx2}>
                            <h4 className={classes.fontBig}>{partyUser.user.name}</h4>
                          </div>
                        )}
                      </div>
                      {(selfPartyUser?.isOwner || selfPartyUser?.id === partyUser?.id) && (
                        <IconButton className={classes.border0} onClick={() => removeUser(partyUser.id)}>
                          <Delete fontSize="small" className={classes.danger} />
                        </IconButton>
                      )}
                    </div>
                  )
                })}
          </Container>
        )}
      </Drawer>

      <Dialog
        open={showWarning}
        onClose={() => setShowWarning(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        classes={{ paper: classes.paperDialog }}
      >
        {selfPartyUser?.id !== partyUserId && (
          <DialogTitle id="alert-dialog-title">Confirm party user deletion!</DialogTitle>
        )}
        {selfPartyUser?.id === partyUserId && <DialogTitle id="alert-dialog-title">Confirm leaving party!</DialogTitle>}
        <DialogActions>
          <Button onClick={cancelPartyUserDelete} className={classes.spanNone}>
            Cancel
          </Button>
          <Button className={classes.spanDange} onClick={confirmPartyUserDelete} autoFocus>
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  )
}

export default ViewMembers
