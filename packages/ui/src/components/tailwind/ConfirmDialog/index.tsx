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

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2025
Infinite Reality Engine. All Rights Reserved.
*/
import { t } from 'i18next'
import React from 'react'

import { ModalState } from '@ir-engine/client-core/src/common/services/ModalState'
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
      ModalState.closeModal()
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
        ModalState.closeModal()
        onClose?.()
      }}
      className="h-[90dvh] w-[50vw] min-w-[720px] max-w-2xl xsh:h-auto xsh:min-w-fit"
      submitLoading={modalProcessing.value}
      rawChildren={
        <div
          className="flex h-[calc(90dvh-4rem-4.5rem)] flex-col items-center justify-center gap-2 xsh:h-auto xsh:py-2"
          data-testid="confirm-dialog"
        >
          <Text className="text-text-secondary" data-testid="confirm-dialog-text-element">
            {text}
          </Text>
          {errorText.value && (
            <Text className="text-red-700	" data-testid="confirm-dialog-error-text-element">
              {errorText.value}
            </Text>
          )}
        </div>
      }
      {...modalProps}
    ></Modal>
  )
}

export default ConfirmDialog
