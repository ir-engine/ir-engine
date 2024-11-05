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

import { PopoverState } from '@ir-engine/client-core/src/common/services/PopoverState'
import { useMutation } from '@ir-engine/common'
import { fileBrowserPath } from '@ir-engine/common/src/schema.type.module'
import { isValidFileName } from '@ir-engine/common/src/utils/validateFileName'
import { useHookstate } from '@ir-engine/hyperflux'
import { Input } from '@ir-engine/ui'
import Modal from '@ir-engine/ui/src/primitives/tailwind/Modal'
import { FileDataType } from '../../../constants/AssetTypes'

export default function RenameFileModal({ projectName, file }: { projectName: string; file: FileDataType }) {
  const { t } = useTranslation()
  const newFileName = useHookstate(file.name)
  const fileService = useMutation(fileBrowserPath)
  const isValid = isValidFileName(newFileName.value)

  const handleSubmit = async () => {
    const name = newFileName.value
    if (isValidFileName(name)) {
      fileService.update(null, {
        oldProject: projectName,
        newProject: projectName,
        oldName: file.fullName,
        newName: file.isFolder ? name : `${name}.${file.type}`,
        oldPath: file.path,
        newPath: file.path,
        isCopy: false
      })
    }
    PopoverState.hidePopupover()
  }

  return (
    <Modal
      title={t('editor:layout.filebrowser.renameFile')}
      className="w-[50vw] max-w-2xl"
      onSubmit={handleSubmit}
      onClose={PopoverState.hidePopupover}
      submitButtonDisabled={!isValid}
    >
      <Input
        value={newFileName.value}
        data-testid="rename-file-input"
        onChange={(event) => newFileName.set(event.target.value)}
        state={!isValid ? 'error' : undefined}
        helperText={!isValid ? t('editor:layout.filebrowser.renameFileError') : undefined}
      />
    </Modal>
  )
}
