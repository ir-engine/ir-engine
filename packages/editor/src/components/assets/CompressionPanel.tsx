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

import { t } from 'i18next'
import React from 'react'

import { API } from '@etherealengine/client-core/src/API'
import Button from '@etherealengine/client-core/src/common/components/Button'
import Menu from '@etherealengine/client-core/src/common/components/Menu'
import { uploadToFeathersService } from '@etherealengine/client-core/src/util/upload'
import {
  KTX2EncodeArguments,
  KTX2EncodeDefaultArguments
} from '@etherealengine/engine/src/assets/constants/CompressionParms'
import { State, useHookstate } from '@etherealengine/hyperflux'
import CircularProgress from '@etherealengine/ui/src/primitives/mui/CircularProgress'
import Typography from '@etherealengine/ui/src/primitives/mui/Typography'
import { KTX2Encoder } from '@etherealengine/xrui/core/textures/KTX2Encoder'

import BooleanInput from '../inputs/BooleanInput'
import CompoundNumericInput from '../inputs/CompoundNumericInput'
import InputGroup from '../inputs/InputGroup'
import SelectInput from '../inputs/SelectInput'
import { FileType } from './FileBrowserContentPanel'
import styles from './styles.module.scss'

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

export default function CompressionPanel({
  openCompress,
  fileProperties,
  onRefreshDirectory
}: {
  openCompress: State<boolean>
  fileProperties: State<FileType>
  onRefreshDirectory: () => Promise<void>
}) {
  const compressProperties = useHookstate<KTX2EncodeArguments>(KTX2EncodeDefaultArguments)
  const compressionLoading = useHookstate(false)

  const compressContentInBrowser = async () => {
    compressionLoading.set(true)

    const props = fileProperties.value
    compressProperties.src.set(props.type === 'folder' ? `${props.url}/${props.key}` : props.url)
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

    const newFileName = props.key.replace(/.*\/(.*)\..*/, '$1') + '.ktx2'
    const path = props.key.replace(/(.*\/).*/, '$1')

    const file = new File([data], newFileName, { type: 'image/ktx2' })

    await uploadToFeathersService('file-browser/upload', [file], {
      fileName: newFileName,
      path,
      contentType: file.type
    }).promise
    await onRefreshDirectory()

    compressionLoading.set(false)
    openCompress.set(false)
  }

  /** @todo */
  const compressContent = async () => {
    const props = fileProperties.value
    compressProperties.src.set(props.type === 'folder' ? `${props.url}/${props.key}` : props.url)
    const compressedPath = await API.instance.client.service('ktx2-encode').create(compressProperties.value)
    await onRefreshDirectory()
    openCompress.set(false)
  }

  return (
    <Menu
      open={openCompress.value}
      onClose={() => openCompress.set(false)}
      showCloseButton={true}
      header={fileProperties.value.name}
      actions={
        <>
          {!compressionLoading.value ? (
            <Button type="gradient" className={styles.horizontalCenter} onClick={compressContentInBrowser}>
              {t('editor:properties.model.transform.compress') as string}
            </Button>
          ) : (
            <CircularProgress style={{ margin: '1rem auto' }} className={styles.horizontalCenter} />
          )}
        </>
      }
    >
      <InputGroup name="fileType" label={fileProperties.value?.isFolder ? 'Directory' : 'File'}>
        <Typography variant="body2">{t('editor:properties.model.transform.compress') as string}</Typography>
      </InputGroup>
      <InputGroup
        name="mode"
        label={t('editor:properties.model.transform.mode')}
        info={t('editor:properties.model.transform.modeTooltip')}
      >
        <SelectInput
          options={[
            { label: 'ETC1S', value: 'ETC1S' },
            { label: 'UASTC', value: 'UASTC' }
          ]}
          value={compressProperties.mode.value}
          onChange={(val: 'ETC1S' | 'UASTC') => compressProperties.mode.set(val)}
        />
      </InputGroup>
      <InputGroup
        name="flipY"
        label={t('editor:properties.model.transform.flipY')}
        info={t('editor:properties.model.transform.flipYTooltip')}
      >
        <BooleanInput value={compressProperties.flipY.value} onChange={compressProperties.flipY.set} />
      </InputGroup>
      <InputGroup
        name="linear"
        label={t('editor:properties.model.transform.srgb')}
        info={t('editor:properties.model.transform.srgbTooltip')}
      >
        <BooleanInput value={compressProperties.srgb.value} onChange={compressProperties.srgb.set} />
      </InputGroup>
      <InputGroup
        name="mipmaps"
        label={t('editor:properties.model.transform.mipmaps')}
        info={t('editor:properties.model.transform.mipmapsTooltip')}
      >
        <BooleanInput value={compressProperties.mipmaps.value} onChange={compressProperties.mipmaps.set} />
      </InputGroup>
      <InputGroup
        name="normalMap"
        label={t('editor:properties.model.transform.normalMap')}
        info={t('editor:properties.model.transform.normalMapTooltip')}
      >
        <BooleanInput value={compressProperties.normalMap.value} onChange={compressProperties.normalMap.set} />
      </InputGroup>
      {compressProperties.mode.value === 'ETC1S' && (
        <>
          <InputGroup
            name="quality"
            label={t('editor:properties.model.transform.quality')}
            info={t('editor:properties.model.transform.qualityTooltip')}
          >
            <CompoundNumericInput
              value={compressProperties.quality.value}
              onChange={compressProperties.quality.set}
              min={1}
              max={255}
              step={1}
            />
          </InputGroup>
          <InputGroup
            name="compressionLevel"
            label={t('editor:properties.model.transform.compressionLevel')}
            info={t('editor:properties.model.transform.compressionLevelTooltip')}
          >
            <CompoundNumericInput
              value={compressProperties.compressionLevel.value}
              onChange={compressProperties.compressionLevel.set}
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
            name="uastcZstandard"
            label={t('editor:properties.model.transform.uastcZstandard')}
            info={t('editor:properties.model.transform.uastcZstandardTooltip')}
          >
            <BooleanInput
              value={compressProperties.uastcZstandard.value}
              onChange={compressProperties.uastcZstandard.set}
            />
          </InputGroup>
        </>
      )}
    </Menu>
  )
}
