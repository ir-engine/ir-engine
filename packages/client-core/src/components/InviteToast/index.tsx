import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import capitalizeFirstLetter from '@xrengine/common/src/utils/capitalizeFirstLetter'
import { Button } from '@xrengine/editor/src/components/inputs/Button'

import { InviteService, useInviteState } from '../../social/services/InviteService'
import { useAuthState } from '../../user/services/AuthService'
import styles from './index.module.scss'

const InviteToast = () => {
  const inviteState = useInviteState()
  const authState = useAuthState()
  const newestInvite =
    inviteState.receivedInvites.total.value > 0 ? inviteState.receivedInvites.invites[0].value : ({} as any)
  const { t } = useTranslation()

  InviteService.useAPIListeners()

  useEffect(() => {
    if (inviteState.receivedUpdateNeeded.value && authState.isLoggedIn.value)
      InviteService.retrieveReceivedInvites(undefined, undefined, 'createdAt', 'desc')
  }, [inviteState.receivedUpdateNeeded, authState.isLoggedIn])

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
