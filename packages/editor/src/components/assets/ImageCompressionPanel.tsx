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

import { NotificationService } from '@etherealengine/client-core/src/common/services/NotificationService'
import { uploadToFeathersService } from '@etherealengine/client-core/src/util/upload'
import { fileBrowserUploadPath } from '@etherealengine/common/src/schema.type.module'
import {
  KTX2EncodeArguments,
  KTX2EncodeDefaultArguments
} from '@etherealengine/engine/src/assets/constants/CompressionParms'
import { useHookstate } from '@etherealengine/hyperflux'
import { KTX2Encoder } from '@etherealengine/xrui/core/textures/KTX2Encoder'

import { PopoverState } from '@etherealengine/client-core/src/common/services/PopoverState'
import BooleanInput from '@etherealengine/ui/src/components/editor/input/Boolean'
import InputGroup from '@etherealengine/ui/src/components/editor/input/Group'
import SelectInput from '@etherealengine/ui/src/components/editor/input/Select'
import Button from '@etherealengine/ui/src/primitives/tailwind/Button'
import LoadingView from '@etherealengine/ui/src/primitives/tailwind/LoadingView'
import Select from '@etherealengine/ui/src/primitives/tailwind/Select'
import Slider from '@etherealengine/ui/src/primitives/tailwind/Slider'
import Text from '@etherealengine/ui/src/primitives/tailwind/Text'
import { useTranslation } from 'react-i18next'
import { MdClose } from 'react-icons/md'
import { FileType } from './FileBrowser/FileBrowserContentPanel'

const UASTCFlagOptions = [
  { label: 'Fastest', value: 0 },
  { label: 'Faster', value: 1 },
  { label: 'Default', value: 2 },
  { label: 'Slower', value: 3 },
  { label: 'Very Slow', value: 4 },
  { label: 'Mask', value: 0xf },
  { label: 'UASTC Error', value: 8 },
  { label: 'BC7 Error', value: 16 },
  { label: 'Faster Hints', value: 64 },
  { label: 'Fastest Hints', value: 128 },
  { label: 'Disable Flip and Individual', value: 256 }
]

export default function ImageCompressionPanel({
  selectedFile,
  refreshDirectory
}: {
  selectedFile: FileType
  refreshDirectory: () => Promise<void>
}) {
  const { t } = useTranslation()
  const compressProperties = useHookstate<KTX2EncodeArguments>(KTX2EncodeDefaultArguments)
  const compressionLoading = useHookstate(false)

  const compressContentInBrowser = async () => {
    compressionLoading.set(true)

    compressProperties.src.set(
      selectedFile.type === 'folder' ? `${selectedFile.url}/${selectedFile.key}` : selectedFile.url
    )

    await compressImage()
    await refreshDirectory()

    compressionLoading.set(false)
    PopoverState.hidePopupover()
  }

  const compressImage = async () => {
    const ktx2Encoder = new KTX2Encoder()

    const img = await new Promise<HTMLImageElement>((resolve) => {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.onload = function () {
        resolve(img)
      }
      img.src = compressProperties.src.value
    })

    const canvas = new OffscreenCanvas(img.width, img.height)
    const ctx = canvas.getContext('2d')!
    ctx.drawImage(img, 0, 0)

    const imageData = ctx.getImageData(0, 0, img.width, img.height)

    const data = await ktx2Encoder.encode(imageData, {
      uastc: compressProperties.mode.value === 'UASTC',
      qualityLevel: compressProperties.quality.value,
      mipmaps: compressProperties.mipmaps.value,
      compressionLevel: compressProperties.compressionLevel.value,
      yFlip: compressProperties.flipY.value,
      srgb: !compressProperties.srgb.value,
      uastcFlags: compressProperties.uastcFlags.value,
      normalMap: compressProperties.normalMap.value,
      uastcZstandard: compressProperties.uastcZstandard.value
    })

    const newFileName = selectedFile.key.replace(/.*\/(.*)\..*/, '$1') + '.ktx2'
    const path = selectedFile.key.replace(/(.*\/).*/, '$1')
    const projectName = selectedFile.key.split('/')[1] // TODO: support projects with / in the name
    const relativePath = path.replace('projects/' + projectName + '/', '')

    const file = new File([data], newFileName, { type: 'image/ktx2' })

    try {
      await uploadToFeathersService(fileBrowserUploadPath, [file], {
        args: [
          {
            project: projectName,
            path: relativePath + file.name,
            contentType: file.type
          }
        ]
      }).promise
    } catch (err) {
      NotificationService.dispatchNotify(err.message, { variant: 'error' })
    }
  }

  return (
    <div className="max-h-[80vh] w-[35vw] overflow-y-auto rounded-xl bg-[#0E0F11]">
      <div className="relative flex items-center justify-center px-8 py-3">
        <Text className="leading-6">{t('editor:properties.model.transform.compressImage')}</Text>
        <Button
          variant="outline"
          className="absolute right-0 border-0 dark:bg-transparent dark:text-[#A3A3A3]"
          startIcon={<MdClose />}
          onClick={() => PopoverState.hidePopupover()}
        />
      </div>

      <div className="mx-auto grid w-1/2 gap-y-2">
        <InputGroup
          className="justify-start"
          labelClassName="w-20 text-[#D3D5D9]"
          infoClassName="text-[#D3D5D9]"
          name="mode"
          label={t('editor:properties.model.transform.mode')}
          info={t('editor:properties.model.transform.modeTooltip')}
        >
          <Select
            inputClassName="px-2 py-0.5 text-[#9CA0AA] text-sm"
            options={[
              { label: 'ETC1S', value: 'ETC1S' },
              { label: 'UASTC', value: 'UASTC' }
            ]}
            currentValue={compressProperties.mode.value}
            onChange={(val: 'ETC1S' | 'UASTC') => compressProperties.mode.set(val)}
          />
        </InputGroup>
        <InputGroup
          className="justify-start"
          labelClassName="w-20 text-[#D3D5D9]"
          infoClassName="text-[#D3D5D9]"
          name="flipY"
          label={t('editor:properties.model.transform.flipY')}
          info={t('editor:properties.model.transform.flipYTooltip')}
        >
          <BooleanInput
            className="bg-[#141619]"
            value={compressProperties.flipY.value}
            onChange={compressProperties.flipY.set}
          />
        </InputGroup>
        <InputGroup
          className="justify-start"
          labelClassName="w-20 text-[#D3D5D9]"
          infoClassName="text-[#D3D5D9]"
          name="linear"
          label={t('editor:properties.model.transform.srgb')}
          info={t('editor:properties.model.transform.srgbTooltip')}
        >
          <BooleanInput
            className="bg-[#141619]"
            value={compressProperties.srgb.value}
            onChange={compressProperties.srgb.set}
          />
        </InputGroup>
        <InputGroup
          className="justify-start"
          labelClassName="w-20 text-[#D3D5D9]"
          infoClassName="text-[#D3D5D9]"
          name="mipmaps"
          label={t('editor:properties.model.transform.mipmaps')}
          info={t('editor:properties.model.transform.mipmapsTooltip')}
        >
          <BooleanInput
            className="bg-[#141619]"
            value={compressProperties.mipmaps.value}
            onChange={compressProperties.mipmaps.set}
          />
        </InputGroup>
        <InputGroup
          className="justify-start"
          labelClassName="w-20 text-[#D3D5D9]"
          infoClassName="text-[#D3D5D9]"
          name="normalMap"
          label={t('editor:properties.model.transform.normalMap')}
          info={t('editor:properties.model.transform.normalMapTooltip')}
        >
          <BooleanInput
            className="bg-[#141619]"
            value={compressProperties.normalMap.value}
            onChange={compressProperties.normalMap.set}
          />
        </InputGroup>
        {compressProperties.mode.value === 'ETC1S' && (
          <>
            <InputGroup
              className="justify-start"
              labelClassName="w-20 text-[#D3D5D9]"
              infoClassName="text-[#D3D5D9]"
              name="quality"
              label={t('editor:properties.model.transform.quality')}
              info={t('editor:properties.model.transform.qualityTooltip')}
            >
              <Slider
                width={160}
                value={compressProperties.quality.value}
                onChange={compressProperties.quality.set}
                onRelease={compressProperties.quality.set}
                min={1}
                max={255}
                step={1}
              />
            </InputGroup>
            <InputGroup
              className="justify-start"
              labelClassName="w-20 text-[#D3D5D9]"
              infoClassName="text-[#D3D5D9]"
              name="compressionLevel"
              label={t('editor:properties.model.transform.compressionLevel')}
              info={t('editor:properties.model.transform.compressionLevelTooltip')}
            >
              <Slider
                width={160}
                value={compressProperties.compressionLevel.value}
                onChange={compressProperties.compressionLevel.set}
                onRelease={compressProperties.compressionLevel.set}
                min={0}
                max={6}
                step={1}
              />
            </InputGroup>
          </>
        )}
        {compressProperties.mode.value === 'UASTC' && (
          <>
            <InputGroup
              className="justify-start"
              labelClassName="w-20 text-[#D3D5D9]"
              infoClassName="text-[#D3D5D9]"
              name="uastcFlags"
              label={t('editor:properties.model.transform.uastcFlags')}
              info={t('editor:properties.model.transform.uastcFlagsTooltip')}
            >
              <SelectInput
                options={UASTCFlagOptions}
                value={compressProperties.uastcFlags.value}
                onChange={(val: number) => compressProperties.uastcFlags.set(val)}
              />
            </InputGroup>
            <InputGroup
              className="justify-start"
              labelClassName="w-20 text-[#D3D5D9]"
              infoClassName="text-[#D3D5D9]"
              name="uastcZstandard"
              label={t('editor:properties.model.transform.uastcZstandard')}
              info={t('editor:properties.model.transform.uastcZstandardTooltip')}
            >
              <BooleanInput
                className="bg-[#141619]"
                value={compressProperties.uastcZstandard.value}
                onChange={compressProperties.uastcZstandard.set}
              />
            </InputGroup>
          </>
        )}
      </div>

      <div className="mb-6 flex justify-end px-8">
        {compressionLoading.value ? (
          <LoadingView spinnerOnly className="mx-0 h-12 w-12" />
        ) : (
          <Button variant="primary" onClick={compressContentInBrowser}>
            {t('editor:properties.model.transform.compress')}
          </Button>
        )}
      </div>
    </div>
  )
}
