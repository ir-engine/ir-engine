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

import { ModalState } from '@ir-engine/client-core/src/common/services/ModalState'
import { NotificationService } from '@ir-engine/client-core/src/common/services/NotificationService'
import Modal from '@ir-engine/ui/src/primitives/tailwind/Modal'
import TextArea from '@ir-engine/ui/src/primitives/tailwind/TextArea'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { HiOutlineDocumentDuplicate } from 'react-icons/hi2'

type Props = Readonly<{
  url: string
}>

export const CopyEmbedCodePopover = ({ url }: Props) => {
  const { t } = useTranslation()

  const embedCode = `<iframe style="border: 1px solid rgba (0, 0, 0, 0.1);" width="375" height="687" src="${url}" allowfullscreen></iframe>`

  const handleCopyEmbed = () => {
    navigator.clipboard
      .writeText(embedCode)
      .then(() => {
        NotificationService.dispatchNotify(t('common:components.embedCodeCopied'), {
          variant: 'success'
        })
      })
      .catch((err) => {
        NotificationService.dispatchNotify(`Failed to copy URL: ${err.message}`, { variant: 'error' })
      })
  }

  return (
    <Modal
      id="copy-embed-code-modal"
      className="w-[50vw] max-w-2xl"
      submitButtonText={t('common:components.close')}
      title={t('common:components.copyEmbedCode')}
      onClose={ModalState.closeModal}
      onSubmit={ModalState.closeModal}
      showCloseButton={false}
    >
      <TextArea
        containerClassName="text-text-secondary"
        className="h-20 border-ui-tertiary bg-[#F6F8FA] dark:border-ui-outline dark:bg-surface-2"
        labelClassname="text-xs text-text-secondary"
        label={t('common:components.embed')}
        value={embedCode}
        readOnly
        endComponent={
          <div className="mr-6 hover:cursor-pointer" onClick={handleCopyEmbed}>
            <HiOutlineDocumentDuplicate className="text-xl text-text-tertiary" />
          </div>
        }
      />
    </Modal>
  )
}
