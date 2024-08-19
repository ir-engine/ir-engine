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

import React from 'react'
import { useTranslation } from 'react-i18next'

import { NotificationService } from '@ir-engine/client-core/src/common/services/NotificationService'
import { PopoverState } from '@ir-engine/client-core/src/common/services/PopoverState'
import { fileBrowserPath } from '@ir-engine/common/src/schema.type.module'
import { FileDataType } from '@ir-engine/editor/src/components/assets/FileBrowser/FileDataType'
import { useHookstate } from '@ir-engine/hyperflux'
import { useMutation } from '@ir-engine/spatial/src/common/functions/FeathersHooks'
import Modal from '../../../../../primitives/tailwind/Modal'
import Text from '../../../../../primitives/tailwind/Text'

export default function DeleteFileModal({
  files,
  onComplete
}: {
  files: FileDataType[]
  onComplete?: (err?: unknown) => void
}) {
  const { t } = useTranslation()
  const modalProcessing = useHookstate(false)
  const fileService = useMutation(fileBrowserPath)

  const handleSubmit = async () => {
    modalProcessing.set(true)
    try {
      await Promise.all(files.map((file) => fileService.remove(file.key)))
      modalProcessing.set(false)
      PopoverState.hidePopupover()
      onComplete?.()
    } catch (err) {
      NotificationService.dispatchNotify(err?.message, { variant: 'error' })
      modalProcessing.set(false)
      onComplete?.(err)
    }
  }

  return (
    <Modal
      title={t('editor:layout.filebrowser.deleteFile')}
      className="w-[50vw] max-w-2xl"
      onSubmit={handleSubmit}
      onClose={PopoverState.hidePopupover}
      submitLoading={modalProcessing.value}
    >
      <Text className="w-full text-center">
        {files.length === 1
          ? t('editor:dialog.delete.confirm-content', { content: files[0].fullName })
          : t('editor:dialog.delete.confirm-multiple', { first: files[0].fullName, count: files.length - 1 })}
      </Text>
    </Modal>
  )
}
