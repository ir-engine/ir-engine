import { Close } from '@material-ui/icons'
import { Check } from '@mui/icons-material'
import { Dialog, Avatar } from '@mui/material'
import { InviteService } from '@xrengine/client-core/src/social/services/InviteService'
import { useInviteState } from '@xrengine/client-core/src/social/services/InviteService'
import * as React from 'react'
import ModeContext from '../context/modeContext'
import { useHarmonyStyles } from '../style'

interface Props {
  setShow: any
  show: boolean
  setShowNot: any
}

const InviteHarmony = (props: Props) => {
  const { darkMode } = React.useContext(ModeContext)
  const { setShow, show, setShowNot } = props
  const capitalize = (word) => word[0].toUpperCase() + word.slice(1)
  const classes = useHarmonyStyles()
  const [state, setState] = React.useState('Received')

  const inviteState = useInviteState()
  const receivedInviteState = inviteState.receivedInvites
  const receivedInvites = receivedInviteState.invites
  const sentInviteState = inviteState.sentInvites
  const sentInvites = sentInviteState.invites
  const targetObjectType = inviteState.targetObjectType
  const [deletePending, setDeletePending] = React.useState('')
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }

  if (receivedInvites.value.length) setShowNot(true)

  React.useEffect(() => {
    if (inviteState.sentUpdateNeeded.value === true && inviteState.getSentInvitesInProgress.value !== true)
      InviteService.retrieveSentInvites()
    if (inviteState.receivedUpdateNeeded.value === true && inviteState.getReceivedInvitesInProgress.value !== true)
      InviteService.retrieveReceivedInvites()
    if (targetObjectType?.value == null || targetObjectType?.value?.length === 0)
      InviteService.updateInviteTarget('user', null)
  }, [
    inviteState.sentUpdateNeeded.value,
    inviteState.receivedInvites.value,
    inviteState.receivedUpdateNeeded.value,
    inviteState.getReceivedInvitesInProgress.value,
    inviteState.targetObjectType.value
  ])

  const handleClickClose = () => {
    setShowNot(false)
    setShow(false)
  }

  const acceptRequest = (invite) => {
    InviteService.acceptInvite(invite.id, invite.passcode)
    console.log('Setting')
    setShowNot(false)
    console.log('Settled')
  }

  const declineRequest = (invite) => {
    InviteService.declineInvite(invite)
    setShowNot(false)
  }

  const cancelDelete = () => {
    setDeletePending('')
  }

  const confirmDelete = (inviteId) => {
    setDeletePending('')
    InviteService.removeInvite(inviteId)
  }

  const showDeleteConfirm = (inviteId) => {
    setDeletePending(inviteId)
  }

  return (
    <Dialog fullWidth={true} maxWidth={'sm'} open={show} onClose={handleClickClose}>
      <div
        className={`${classes.dFlex} ${classes.justifyContentBetween} ${classes.alignCenter} ${
          darkMode ? classes.bgModal : classes.bgModalLight
        }`}
      >
        <button
          className={`${classes.btns} ${state === 'Received' && classes.borderBottom}`}
          onClick={() => setState('Received')}
        >
          <b className={`${state === 'Received' ? classes.info : darkMode && classes.white}`}>RECEIVED</b>
        </button>
        <button
          className={`${classes.btns} ${state === 'Sent' && classes.borderBottom}`}
          onClick={() => setState('Sent')}
        >
          <b className={`${state === 'Sent' ? classes.info : darkMode && classes.white}`}>SENT</b>
        </button>
      </div>
      <div className={`${darkMode ? classes.bgModal : classes.bgModalLight} ${classes.p4}`}>
        {state === 'Received' ? (
          <>
            {[...receivedInvites?.value]
              .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
              .map((invite) => {
                const dt = invite.createdAt.split('T')[0].split('-')
                const formatedDate = new Date(Date.UTC(+dt[0], +dt[1] - 1, +dt[2]))
                return (
                  <div
                    key={invite.id}
                    className={`${classes.dFlex} ${classes.justifyContentBetween} ${classes.alignCenter} ${classes.my2}`}
                  >
                    <div className={`${classes.dFlex} ${classes.alignCenter} ${classes.mx2}`}>
                      <Avatar src={invite.user.avatarUrl} />
                      {invite?.inviteType === 'friend' && (
                        <div className={classes.mx2}>
                          <h4 className={classes.fontBig}>
                            {capitalize(invite?.inviteType || '')} request from {invite.user.name}
                          </h4>
                          <small className={classes.textMuted}>
                            {formatedDate.toLocaleDateString(undefined, options)}
                          </small>
                        </div>
                      )}
                      {invite?.inviteType === 'group' && (
                        <div className={classes.mx2}>
                          <h4 className={classes.fontBig}>
                            Join group {invite.groupName} from {invite.user.name}
                          </h4>
                          <small className={classes.textMuted}>
                            {formatedDate.toLocaleDateString(undefined, options)}
                          </small>
                        </div>
                      )}
                      {invite?.inviteType === 'party' && (
                        <div className={classes.mx2}>
                          <h4 className={classes.fontBig}>Join a party from {invite.user.name}</h4>
                          <small className={classes.textMuted}>
                            {formatedDate.toLocaleDateString(undefined, options)}
                          </small>
                        </div>
                      )}
                    </div>
                    <div className={`${classes.dFlex} ${classes.alignCenter}`}>
                      <button
                        className={`${classes.smallBtn} ${classes.lightDanger}`}
                        onClick={() => declineRequest(invite)}
                      >
                        <Close fontSize="small" style={{ color: '#DD3333' }} />
                      </button>
                      <button
                        className={`${classes.smallBtn} ${classes.lightSuccess}`}
                        onClick={() => acceptRequest(invite)}
                      >
                        <Check fontSize="small" style={{ color: '#57C290' }} />
                      </button>
                    </div>
                  </div>
                )
              })}
          </>
        ) : (
          <>
            {[...sentInvites?.value]
              .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
              .map((invite) => {
                const dt = invite.createdAt.split('T')[0].split('-')
                const formatedDate = new Date(Date.UTC(+dt[0], +dt[1] - 1, +dt[2]))
                return (
                  <div
                    key={invite.id}
                    className={`${classes.dFlex} ${classes.justifyContentBetween} ${classes.alignCenter} ${classes.my2}`}
                  >
                    <div className={`${classes.dFlex} ${classes.alignCenter} ${classes.mx2}`}>
                      <Avatar src={invite.user.avatarUrl} />
                      {invite?.inviteType === 'friend' && (
                        <div className={classes.mx2}>
                          <h4 className={classes.fontBig}>
                            {capitalize(invite?.inviteType)} request to{' '}
                            {invite.invitee ? invite.invitee.name : invite.token}
                          </h4>
                          <small className={classes.textMuted}>
                            {formatedDate.toLocaleDateString(undefined, options)}
                          </small>
                        </div>
                      )}
                      {invite?.inviteType === 'group' && (
                        <div className={classes.mx2}>
                          <h4 className={classes.fontBig}>
                            Join group {invite?.groupName} to {invite.invitee ? invite.invitee.name : invite.token}
                          </h4>
                          <small className={classes.textMuted}>
                            {formatedDate.toLocaleDateString(undefined, options)}
                          </small>
                        </div>
                      )}
                      {invite?.inviteType === 'party' && (
                        <div className={classes.mx2}>
                          <h4 className={classes.fontBig}>
                            Join a party to {invite.invitee ? invite.invitee.name : invite.token}
                          </h4>
                          <small className={classes.textMuted}>
                            {formatedDate.toLocaleDateString(undefined, options)}
                          </small>
                        </div>
                      )}
                    </div>
                    {deletePending === invite.id && (
                      <div className={`${classes.dFlex} ${classes.alignCenter}`}>
                        <button className={`${classes.smallBtn} ${classes.lightDanger}`} onClick={() => cancelDelete()}>
                          <Close fontSize="small" style={{ color: '#DD3333' }} />
                        </button>
                        <button
                          className={`${classes.smallBtn} ${classes.lightSuccess}`}
                          onClick={() => confirmDelete(invite)}
                        >
                          <Check fontSize="small" style={{ color: '#57C290' }} />
                        </button>
                      </div>
                    )}
                    {deletePending !== invite.id && (
                      <button
                        className={`${classes.my2} ${classes.btn} ${classes.btnCursor}`}
                        onClick={() => showDeleteConfirm(invite.id)}
                      >
                        <span className={classes.danger}>Uninvite</span>
                      </button>
                    )}
                  </div>
                )
              })}
          </>
        )}
      </div>
    </Dialog>
  )
}

export default InviteHarmony
