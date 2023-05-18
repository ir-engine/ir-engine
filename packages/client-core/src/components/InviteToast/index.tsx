import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import capitalizeFirstLetter from '@etherealengine/common/src/utils/capitalizeFirstLetter'
import { Button } from '@etherealengine/editor/src/components/inputs/Button'
import { addActionReceptor, getMutableState, removeActionReceptor, useHookstate } from '@etherealengine/hyperflux'

import { InviteService, InviteServiceReceptor, InviteState } from '../../social/services/InviteService'
import { AuthState } from '../../user/services/AuthService'
import styles from './index.module.scss'

const InviteToast = () => {
  const inviteState = useHookstate(getMutableState(InviteState))
  const authState = useHookstate(getMutableState(AuthState))
  const newestInvite =
    inviteState.receivedInvites.total.value > 0 ? inviteState.receivedInvites.invites[0].value : ({} as any)
  const { t } = useTranslation()

  useEffect(() => {
    if (inviteState.receivedUpdateNeeded.value && authState.isLoggedIn.value)
      InviteService.retrieveReceivedInvites(undefined, undefined, 'createdAt', 'desc')
  }, [inviteState.receivedUpdateNeeded.value, authState.isLoggedIn.value])

  useEffect(() => {
    addActionReceptor(InviteServiceReceptor)
    return () => {
      removeActionReceptor(InviteServiceReceptor)
    }
  }, [])

  const acceptInvite = (invite) => {
    InviteService.acceptInvite(invite)
  }

  const declineInvite = (invite) => {
    InviteService.declineInvite(invite)
  }
  return (
    <div
      className={`${styles.inviteToast} ${
        inviteState.receivedInvites.total.value > 0 ? styles.animateLeft : styles.fadeOutLeft
      }`}
    >
      <div className={`${styles.toastContainer} `}>
        {newestInvite?.inviteType && (
          <span>
            {capitalizeFirstLetter(newestInvite?.inviteType).replace('-', ' ')} invite from {newestInvite.user?.name}
          </span>
        )}
        <div className={`${styles.btnContainer}`}>
          <Button color="primary" className={styles.acceptBtn} onClick={() => acceptInvite(newestInvite)}>
            {t('social:invite.accept')}
          </Button>
          <Button color="secondary" className={styles.declineBtn} onClick={() => declineInvite(newestInvite)}>
            {t('social:invite.decline')}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default InviteToast
