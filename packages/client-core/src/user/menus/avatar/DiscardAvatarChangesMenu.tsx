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

import { Button } from '@ir-engine/ui'
import Modal from '@ir-engine/ui/src/primitives/tailwind/Modal'
import Text from '@ir-engine/ui/src/primitives/tailwind/Text'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { GoAlert } from 'react-icons/go'
import { PopoverState } from '../../../common/services/PopoverState'

interface Props {
  handleConfirm: () => void
  handleCancel?: () => void
}

export const DiscardAvatarChangesMenu = ({ handleConfirm, handleCancel }: Props) => {
  const { t } = useTranslation()

  const handleClose = () => {
    PopoverState.hidePopupover()
    if (handleCancel) handleCancel()
  }

  return (
    <Modal
      className="max-h-1/3 pointer-events-auto h-fit w-1/4 rounded-lg md:h-72 md:w-96"
      hideFooter
      rawChildren={
        <div className="grid h-full grid-flow-row grid-rows-[auto,1fr,auto] p-6">
          <div className="flex h-14 w-14 justify-self-center rounded-full bg-surface-4">
            <GoAlert className="m-auto text-3xl text-ui-hover-error" />
          </div>
          <div className="flex flex-col items-center justify-center">
            <Text fontSize="xl" fontWeight="bold" className="capitalize text-text-primary">
              {t('user:avatar.discardAvatarChanges')}
            </Text>
            <Text fontSize="base" className="mt-2 text-text-secondary">
              {t('user:common.changesLostAlert')}
            </Text>
          </div>

          <div className="flex justify-center gap-6">
            <Button className="rounded-md" fullWidth onClick={handleClose}>
              {t('common:components.back')}
            </Button>
            <Button className="rounded-md" fullWidth onClick={handleConfirm}>
              {t('user:common.discard')}
            </Button>
          </div>
        </div>
      }
    />
  )
}
