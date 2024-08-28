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
import { t } from 'i18next'
import React from 'react'

import { PopoverState } from '@ir-engine/client-core/src/common/services/PopoverState'
import { useHookstate } from '@ir-engine/hyperflux'

import Modal, { ModalProps } from '../../../primitives/tailwind/Modal'
import Text from '../../../primitives/tailwind/Text'

interface ConfirmDialogProps {
  title?: string
  text: string
  onSubmit: () => Promise<void> | void
  onClose?: () => void
  modalProps?: Partial<ModalProps>
}

export const ConfirmDialog = ({ title, text, onSubmit, onClose, modalProps }: ConfirmDialogProps) => {
  const errorText = useHookstate('')
  const modalProcessing = useHookstate(false)

  const handled = async () => {
    modalProcessing.set(true)
    try {
      await onSubmit()
      PopoverState.hidePopupover()
    } catch (error) {
      errorText.set(error.message)
    }
    modalProcessing.set(false)
  }

  return (
    <Modal
      title={title || t('admin:components.common.confirmation')}
      onSubmit={handled}
      onClose={() => {
        PopoverState.hidePopupover()
        onClose?.()
      }}
      className="w-[50vw] max-w-2xl"
      submitLoading={modalProcessing.value}
      {...modalProps}
    >
      <div className="flex flex-col items-center gap-2">
        <Text>{text}</Text>
        {errorText.value && <Text className="text-red-700	">{errorText.value}</Text>}
      </div>
    </Modal>
  )
}

export default ConfirmDialog
