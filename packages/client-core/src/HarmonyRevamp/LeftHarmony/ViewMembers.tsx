import React, { useContext } from 'react'
import { Container, Avatar, Drawer, Dialog, DialogActions, DialogTitle, Button } from '@mui/material'
import { useHarmonyStyles } from '../style'
import ModeContext from '../context/modeContext'
import { AddCircleOutline } from '@mui/icons-material'
import { Delete } from '@material-ui/icons'
import IconButton from '@mui/material/IconButton'
import { GroupService } from '@xrengine/client-core/src/social/services/GroupService'
import { useGroupState } from '@xrengine/client-core/src/social/services/GroupService'

interface Props {
  selectedGroup: any
  selfUser: any
  openDrawer: boolean
  setOpenDrawer: any
}

const ViewMembers = ({ selectedGroup, selfUser, openDrawer, setOpenDrawer, handleClose }: Props) => {
  const { darkMode } = useContext(ModeContext)
  const classes = useHarmonyStyles()
  const [showWarning, setShowWarning] = React.useState(false)
  const [groupUserId, setGroupUserId] = React.useState('')
  //   const [openDrawer, setOpenDrawer] = React.useState(false)

  //group state
  const groupState = useGroupState()
  const groupSubState = groupState.groups

  React.useEffect(() => {
    console.log('mkhfjghsfdfjgfdsfj')
    if (groupState.updateNeeded.value === true && groupState.getGroupsInProgress.value !== true) {
      GroupService.getGroups(0)
    }
  }, [groupState.updateNeeded.value, groupState.getGroupsInProgress.value])

  const removeUser = (id) => {
    setGroupUserId(id)
    setShowWarning(true)
  }

  const cancelGroupUserDelete = (e: any) => {
    e.preventDefault()
    setShowWarning(false)
  }

  const confirmGroupUserDelete = (e) => {
    e.preventDefault()
    setShowWarning(false)
    setOpenDrawer(false)
    GroupService.removeGroupUser(groupUserId)
  }

  const selfGroupUser =
    selectedGroup &&
    groupSubState.groups.value.length > 0 &&
    selectedGroup?.groupUsers?.length &&
    selectedGroup.groupUsers.find((groupUser) => groupUser.userId === selfUser.id)

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
                      {(selfGroupUser?.groupUserRank === 'owner' ||
                        selfGroupUser?.groupUserRank === 'admin' ||
                        groupUser.id === selfGroupUser?.id) && (
                        <IconButton className={classes.border0} onClick={() => removeUser(groupUser.id)}>
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
        <DialogTitle id="alert-dialog-title">Confirm group user deletion!</DialogTitle>
        <DialogActions>
          <Button onClick={cancelGroupUserDelete} className={classes.spanNone}>
            Cancel
          </Button>
          <Button className={classes.spanDange} onClick={confirmGroupUserDelete} autoFocus>
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  )
}

export default ViewMembers
