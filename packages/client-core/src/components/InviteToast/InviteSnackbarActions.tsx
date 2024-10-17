import { InviteType } from '@ir-engine/common/src/schema.type.module'
import { useMutableState } from '@ir-engine/hyperflux'
import Button from '@ir-engine/ui/src/primitives/tailwind/Button'
import { first } from 'lodash'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { InviteService, InviteState } from '../../social/services/InviteService'

type Props = {
  closeSnackbar: () => void
}

const InviteSnackbarActions = ({ closeSnackbar }: Props) => {
  const { t } = useTranslation()
  const inviteState = useMutableState(InviteState)
  const newestInvite: InviteType = first(inviteState.receivedInvites.invites)?.value as InviteType

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
