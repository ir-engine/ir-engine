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

import { InviteType } from '@ir-engine/common/src/schema.type.module'
import { useMutableState } from '@ir-engine/hyperflux'
import Button from '@ir-engine/ui/src/primitives/tailwind/Button'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { InviteService, InviteState } from '../../social/services/InviteService'

type Props = {
  closeSnackbar: () => void
}

const InviteSnackbarActions = ({ closeSnackbar }: Props) => {
  const { t } = useTranslation()
  const inviteState = useMutableState(InviteState)
  const newestInvite = inviteState.receivedInvites.invites[0]?.value as InviteType

  const handleAccept = () => {
    InviteService.acceptInvite(newestInvite)
    closeSnackbar()
  }

  const handleDecline = () => {
    InviteService.declineInvite(newestInvite)
    closeSnackbar()
  }

  return (
    <div className="flex gap-2">
      <Button onClick={handleDecline} size="small" variant="outline" className="cursor-pointer">
        {t('social:invite.decline')}
      </Button>
      <Button onClick={handleAccept} size="small" variant="primary" className="cursor-pointer">
        {t('social:invite.accept')}
      </Button>
    </div>
  )
}

export default InviteSnackbarActions
