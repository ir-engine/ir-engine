/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/ir-engine/ir-engine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Infinite Reality Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Infinite Reality Engine team.

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2023 
Infinite Reality Engine. All Rights Reserved.
*/

import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import { InviteType, UserName } from '@ir-engine/common/src/schema.type.module'

import { useMutableState } from '@ir-engine/hyperflux'

import Button from '@ir-engine/ui/src/primitives/tailwind/Button'
import { first } from 'lodash'
import { HiMiniXMark } from 'react-icons/hi2'
import { InviteService, InviteState } from '../../social/services/InviteService'
import { AuthState } from '../../user/services/AuthService'

const InviteToast = () => {
  const { t } = useTranslation()
  const inviteState = useMutableState(InviteState)
  const authState = useMutableState(AuthState)
  const newestInvite: InviteType = first(inviteState.receivedInvites.invites)?.value as InviteType

  useEffect(() => {
    if (inviteState.receivedUpdateNeeded.value && authState.isLoggedIn.value)
      InviteService.retrieveReceivedInvites(undefined, undefined, 'createdAt', 'desc')
  }, [inviteState.receivedUpdateNeeded.value, authState.isLoggedIn.value])

  const acceptInvite = () => {
    InviteService.acceptInvite(newestInvite)
  }

  const declineInvite = () => {
    InviteService.declineInvite(newestInvite)
  }

  if (!newestInvite?.inviteType) {
    return null
  }

  return (
    <div className="fixed right-[25px] top-[100px] flex w-80 flex-col rounded-lg bg-[#191B1F] p-5 shadow-xl shadow-black">
      <div className="flex">
        <span className="flex-1 text-neutral-100 first-letter:uppercase">
          {t('social:invite.inviteMessage', {
            inviteType: newestInvite?.inviteType.replace('-', ' '),
            userName: newestInvite.user?.name as UserName
          })}
        </span>

        <HiMiniXMark className="cursor-pointer text-xl" onClick={declineInvite} />
      </div>
      <div className="ml-auto mt-6">
        <Button onClick={acceptInvite} className="cursor-pointer">
          {t('social:invite.accept')}
        </Button>
      </div>
    </div>
  )
}

export default InviteToast
