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
import { imageConvertPath } from '@etherealengine/common/src/schema.type.module'
import { FileDataType } from '@etherealengine/editor/src/components/assets/FileBrowser/FileDataType'
import {
  ImageConvertDefaultParms,
  ImageConvertParms
} from '@etherealengine/engine/src/assets/constants/ImageConvertParms'
import { useHookstate } from '@etherealengine/hyperflux'
import { useMutation } from '@etherealengine/spatial/src/common/functions/FeathersHooks'
import Checkbox from '../../../../../primitives/tailwind/Checkbox'
import Label from '../../../../../primitives/tailwind/Label'
import Modal from '../../../../../primitives/tailwind/Modal'
import Select from '../../../../../primitives/tailwind/Select'
import Text from '../../../../../primitives/tailwind/Text'
import NumericInput from '../../../input/Numeric'

export default function ImageConvertModal({
  file,
  refreshDirectory
}: {
  file: FileDataType
  refreshDirectory: () => Promise<void>
}) {
  const { t } = useTranslation()
  const modalProcessing = useHookstate(false)

  const convertProperties = useHookstate<ImageConvertParms>(ImageConvertDefaultParms)
  const imageConvertMutation = useMutation(imageConvertPath)

  const handleSubmit = async () => {
    convertProperties.src.set(file.isFolder ? `${file.url}/${file.key}` : file.url)
    imageConvertMutation
      .create({
        ...convertProperties.value
      })
      .then(() => {
        refreshDirectory()
        PopoverState.hidePopupover()
      })
  }

  return (
    <Modal
      title={t('editor:layout.filebrowser.convert')}
      className="w-[50vw] max-w-2xl"
      onSubmit={handleSubmit}
      onClose={PopoverState.hidePopupover}
      submitLoading={modalProcessing.value}
    >
      <div className="ml-32 flex flex-col gap-4">
        <Text fontWeight="semibold">
          {file.name} {file.isFolder ? t('editor:layout.filebrowser.directory') : t('editor:layout.filebrowser.file')}
        </Text>
        <div className="flex items-center gap-2">
          <Label className="w-16">{t('editor:layout.filebrowser.image-convert.format')}</Label>
          <Select
            inputClassName="px-2 py-0.5 text-theme-input text-sm"
            options={[
              { label: 'PNG', value: 'png' },
              { label: 'JPG', value: 'jpg' },
              { label: 'WEBP', value: 'webp' }
            ]}
            currentValue={convertProperties.format.value}
            onChange={(value) => convertProperties.format.set(value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Label className="w-16">{t('editor:layout.filebrowser.image-convert.resize')}</Label>
          <Checkbox
            className="bg-theme-highlight"
            value={convertProperties.resize.value}
            onChange={(value) => convertProperties.resize.set(value)}
          />
        </div>
        {convertProperties.resize.value && (
          <>
            <div className="flex items-center gap-2">
              <Label className="w-16">{t('editor:layout.filebrowser.image-convert.width')}</Label>
              <NumericInput
                className="w-52 bg-[#141619] px-2 py-0.5"
                value={convertProperties.width.value}
                onChange={(value) => convertProperties.width.set(value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Label className="w-16">{t('editor:layout.filebrowser.image-convert.height')}</Label>
              <NumericInput
                className="w-52 bg-[#141619] px-2 py-0.5"
                value={convertProperties.height.value}
                onChange={(value) => convertProperties.height.set(value)}
              />
            </div>
          </>
        )}
      </div>
    </Modal>
  )
}
