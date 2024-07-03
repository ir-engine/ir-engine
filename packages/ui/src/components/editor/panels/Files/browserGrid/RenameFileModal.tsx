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

import React from 'react'
import { useTranslation } from 'react-i18next'

import { PopoverState } from '@etherealengine/client-core/src/common/services/PopoverState'
import { fileBrowserPath } from '@etherealengine/common/src/schema.type.module'
import { FileDataType } from '@etherealengine/editor/src/components/assets/FileBrowser/FileDataType'
import { useHookstate } from '@etherealengine/hyperflux'
import { useMutation } from '@etherealengine/spatial/src/common/functions/FeathersHooks'
import Input from '../../../../../primitives/tailwind/Input'
import Modal from '../../../../../primitives/tailwind/Modal'

export default function RenameFileModal({ projectName, file }: { projectName: string; file: FileDataType }) {
  const { t } = useTranslation()
  const newFileName = useHookstate(file.name)
  const fileService = useMutation(fileBrowserPath)

  const handleSubmit = async () => {
    fileService.update(null, {
      oldProject: projectName,
      newProject: projectName,
      oldName: file.fullName,
      newName: file.isFolder ? newFileName.value : `${newFileName.value}.${file.type}`,
      oldPath: file.path,
      newPath: file.path,
      isCopy: false
    })
    PopoverState.hidePopupover()
  }

  return (
    <Modal
      title={t('editor:layout.filebrowser.renameFile')}
      className="w-[50vw] max-w-2xl"
      onSubmit={handleSubmit}
      onClose={PopoverState.hidePopupover}
    >
      <Input value={newFileName.value} onChange={(event) => newFileName.set(event.target.value)} />
    </Modal>
  )
}
