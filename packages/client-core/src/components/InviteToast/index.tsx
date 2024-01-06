/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/EtherealEngine/etherealengine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Ethereal Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Ethereal Engine team.

All portions of the code written by the Ethereal Engine team are Copyright © 2021-2023 
Ethereal Engine. All Rights Reserved.
*/

import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import capitalizeFirstLetter from '@etherealengine/common/src/utils/capitalizeFirstLetter'
import { Button } from '@etherealengine/editor/src/components/inputs/Button'
import { getMutableState, useHookstate } from '@etherealengine/hyperflux'

import { UserName } from '@etherealengine/common/src/schema.type.module'
import { InviteService, InviteState } from '../../social/services/InviteService'
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
            {capitalizeFirstLetter(newestInvite?.inviteType).replace('-', ' ')} invite from{' '}
            {newestInvite.user?.name as UserName}
          </span>
        )}
        <div className={`${styles.btnContainer}`}>
          <Button style={{ color: 'primary' }} className={styles.acceptBtn} onClick={() => acceptInvite(newestInvite)}>
            {t('social:invite.accept')}
          </Button>
          <Button
            style={{ color: 'primary' }}
            className={styles.declineBtn}
            onClick={() => declineInvite(newestInvite)}
          >
            {t('social:invite.decline')}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default InviteToast
