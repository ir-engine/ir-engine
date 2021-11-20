import React from 'react'
import { MoreHoriz, Forum, GroupAdd, Delete } from '@material-ui/icons'
import { MenuList, MenuItem, ListItemIcon, ListItemText, Popover } from '@mui/material'
import { InviteService } from '@xrengine/client-core/src/social/services/InviteService'
import { useAuthState } from '@xrengine/client-core/src/user/services/AuthService'
import { PartyService } from '@xrengine/client-core/src/social/services/PartyService'
import { usePartyState } from '@xrengine/client-core/src/social/services/PartyService'
import { useHarmonyStyles } from '../style'

interface Props {
  party?: any
  setActiveChat: any
  setShowChat: any
  setInvite: any
  handleCreate: any
}

const Party = (props: Props) => {
  const classes = useHarmonyStyles()
  const { setActiveChat, setShowChat, setInvite, handleCreate } = props
  const [anchorEl, setAnchorEl] = React.useState(null)
  const [partyDeletePending, setPartyDeletePending] = React.useState(false)
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

  const showPartyDeleteConfirm = (e) => {
    e.preventDefault()
    setPartyDeletePending(true)
  }

  const cancelPartyDelete = (e) => {
    e.preventDefault()
    setPartyDeletePending(false)
  }

  const confirmPartyDelete = (e, partyId) => {
    e.preventDefault()
    setPartyDeletePending(false)
    PartyService.removeParty(partyId)
  }

  React.useEffect(() => {
    if (partyState.updateNeeded.value === true) {
      PartyService.getParty()
    }
  }, [partyState.updateNeeded])

  const open = Boolean(anchorEl)
  const id = open ? 'simple-popover' : undefined

  return (
    <>
      {[...party]
        .sort((a, b) => a.createdAt - b.createdAt)
        .map((part) => {
          const partyUsers = party?.partyUsers?.length ? party.partyUsers : []
          let selfPartyUser
          for (const user of partyUsers) {
            if (user.user.id === user.id) selfPartyUser = { ...user }
          }
          // const selfPartyUser = partyUsers.find((partyUser) => {
          //   console.log("5555555555555555555", partyUser.user.id === user.id)
          //   console.log("6666666666666666666", partyUser)
          //   return partyUser.user.id === user.id
          // })

          // console.log("KKKKKKKLL", user.id)
          // console.log("LLLLLLLLLL", party.partyUsers)

          return (
            <div key={part.id} className={`${classes.dFlex} ${classes.alignCenter} ${classes.my2} ${classes.cpointer}`}>
              <div
                onClick={() => {
                  setShowChat(true), setActiveChat('party', part)
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
                          setActiveChat('party', party), setShowChat(true), handleClose()
                        }}
                      >
                        <ListItemIcon>
                          <Forum fontSize="small" className={classes.info} />
                        </ListItemIcon>
                        <ListItemText>CHAT</ListItemText>
                      </MenuItem>
                      {selfPartyUser?.isOwner === true && (
                        <MenuItem
                          className={classes.my2}
                          onClick={() => {
                            openInvite('party', part.id), handleClose(), setInvite('Party'), handleCreate()
                          }}
                        >
                          <ListItemIcon>
                            <GroupAdd fontSize="small" className={classes.success} />
                          </ListItemIcon>
                          <ListItemText>INVITE</ListItemText>
                        </MenuItem>
                      )}
                      {partyDeletePending !== true && selfPartyUser?.isOwner === true && (
                        <MenuItem className={classes.my2}>
                          <ListItemIcon>
                            <Delete fontSize="small" className={classes.danger} />
                          </ListItemIcon>
                          <ListItemText>Delete</ListItemText>
                        </MenuItem>
                      )}
                    </MenuList>
                  </div>
                </Popover>
              </div>
            </div>
          )
        })}
    </>
  )
}

export default Party
