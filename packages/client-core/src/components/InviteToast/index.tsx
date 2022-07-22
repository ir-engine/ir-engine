import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import capitalizeFirstLetter from '@xrengine/common/src/utils/capitalizeFirstLetter'
import { Button } from '@xrengine/editor/src/components/inputs/Button'

import { InviteService, useInviteState } from '../../social/services/InviteService'
import styles from './index.module.scss'

interface Props {
  animate?: any
}

const InviteToast = (props: Props) => {
  const InviteState = useInviteState()
  const newestInvite =
    InviteState.receivedInvites.total.value > 0 ? InviteState.receivedInvites.invites[0].value : ({} as any)
  const { t } = useTranslation()

  useEffect(() => {
    if (InviteState.receivedUpdateNeeded.value)
      InviteService.retrieveReceivedInvites(undefined, undefined, 'createdAt', 'desc')
  }, [InviteState.receivedUpdateNeeded.value])

  InviteService.useAPIListeners()

  const acceptInvite = (invite) => {
    InviteService.acceptInvite(invite)
  }

  const declineInvite = (invite) => {
    InviteService.declineInvite(invite)
  }
  return (
    <div
      className={`${styles.inviteToast} ${
        InviteState.receivedInvites.total.value > 0 ? styles.animateLeft : styles.fadeOutLeft
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
