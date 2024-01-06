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
import React, { useEffect } from 'react'

import Button from '@etherealengine/client-core/src/common/components/Button'
import Menu from '@etherealengine/client-core/src/common/components/Menu'
import { uploadToFeathersService } from '@etherealengine/client-core/src/util/upload'
import {
  KTX2EncodeArguments,
  KTX2EncodeDefaultArguments
} from '@etherealengine/engine/src/assets/constants/CompressionParms'
import { NO_PROXY, State, useHookstate } from '@etherealengine/hyperflux'
import CircularProgress from '@etherealengine/ui/src/primitives/mui/CircularProgress'
import Typography from '@etherealengine/ui/src/primitives/mui/Typography'
import { KTX2Encoder } from '@etherealengine/xrui/core/textures/KTX2Encoder'

import { fileBrowserUploadPath } from '@etherealengine/engine/src/schemas/media/file-browser-upload.schema'
import BooleanInput from '../inputs/BooleanInput'
import CompoundNumericInput from '../inputs/CompoundNumericInput'
import InputGroup from '../inputs/InputGroup'
import SelectInput from '../inputs/SelectInput'
import { FileType } from './FileBrowser/FileBrowserContentPanel'
import styles from './styles.module.scss'

import { FileBrowserService } from '@etherealengine/client-core/src/common/services/FileBrowserService'
import { CommonKnownContentTypes } from '@etherealengine/common/src/utils/CommonKnownContentTypes'
import {
  DefaultModelTransformParameters,
  ModelTransformParameters
} from '@etherealengine/engine/src/assets/classes/ModelTransform'
import { transformModel as clientSideTransformModel } from '@etherealengine/engine/src/assets/compression/ModelTransformFunctions'
import { Engine } from '@etherealengine/engine/src/ecs/classes/Engine'
import { setComponent } from '@etherealengine/engine/src/ecs/functions/ComponentFunctions'
import { removeEntityNodeRecursively } from '@etherealengine/engine/src/ecs/functions/EntityTree'
import { createSceneEntity } from '@etherealengine/engine/src/ecs/functions/createSceneEntity'
import { ModelComponent } from '@etherealengine/engine/src/scene/components/ModelComponent'
import { VariantComponent } from '@etherealengine/engine/src/scene/components/VariantComponent'
import { modelTransformPath } from '@etherealengine/engine/src/schemas/assets/model-transform.schema'
import exportGLTF from '../../functions/exportGLTF'
import GLTFTransformProperties from '../properties/GLTFTransformProperties'

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

const fileConsistsOfContentType = function (file: FileType, contentType: string): boolean {
  if (file.isFolder) {
    return contentType.startsWith('image')
  } else {
    const guessedType: string = CommonKnownContentTypes[file.type]
    return guessedType?.startsWith(contentType)
  }
}

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
  const isClientside = useHookstate<boolean>(true)
  const isBatchCompress = useHookstate<boolean>(true)
  const isIntegratedPrefab = useHookstate<boolean>(true)
  const transformParms = useHookstate<ModelTransformParameters>({
    ...DefaultModelTransformParameters,
    src: fileProperties.url.value,
    modelFormat: fileProperties.url.value.endsWith('.gltf') ? 'gltf' : 'glb'
  })

  const compressContentInBrowser = async () => {
    compressionLoading.set(true)

    const props = fileProperties.value
    compressProperties.src.set(props.type === 'folder' ? `${props.url}/${props.key}` : props.url)

    const compressor = fileConsistsOfContentType(fileProperties.value, 'model') ? compressModel : compressImage
    await compressor()
    await onRefreshDirectory()

    compressionLoading.set(false)
    openCompress.set(false)
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

    const props = fileProperties.value
    const newFileName = props.key.replace(/.*\/(.*)\..*/, '$1') + '.ktx2'
    const path = props.key.replace(/(.*\/).*/, '$1')

    const file = new File([data], newFileName, { type: 'image/ktx2' })

    await uploadToFeathersService(fileBrowserUploadPath, [file], {
      fileName: newFileName,
      path,
      contentType: file.type
    }).promise
  }

  type LODVariantDescriptor = {
    parms: ModelTransformParameters
    metadata: Record<string, any>
    suffix?: string
  }

  const createLODVariants = async (
    modelSrc: string,
    modelDst: string,
    lods: LODVariantDescriptor[],
    clientside: boolean,
    heuristic: 'DISTANCE' | 'SCENE_SCALE' | 'MANUAL' | 'DEVICE',
    exportCombined = false
  ) => {
    const lodVariantParms: ModelTransformParameters[] = lods.map((lod) => ({
      ...lod.parms,
      src: modelSrc,
      dst: `${modelDst}${lod.suffix ?? ''}.${lod.parms.modelFormat}`
    }))

    for (const variant of lodVariantParms) {
      if (clientside) {
        await clientSideTransformModel(variant)
      } else {
        await Engine.instance.api.service(modelTransformPath).create(variant)
      }
    }

    if (exportCombined) {
      const result = createSceneEntity('container')
      setComponent(result, ModelComponent)
      const variant = createSceneEntity('LOD Variant', result)
      setComponent(variant, ModelComponent)
      setComponent(variant, VariantComponent, {
        levels: lods.map((lod, index) => ({
          src: modelSrc.replace(/[^\/]+$/, lodVariantParms[index].dst),
          metadata: lod.metadata
        })),
        heuristic
      })

      const combinedModelFormat = modelSrc.endsWith('.gltf') ? 'gltf' : 'glb'
      await exportGLTF(result, modelSrc.replace(/\.[^.]*$/, `-integrated.${combinedModelFormat}`))
      removeEntityNodeRecursively(result)
    }
  }

  const compressModel = async () => {
    const modelSrc = fileProperties.url.value
    const modelDst = transformParms.dst.value
    const clientside = isClientside.value
    const batchCompress = isBatchCompress.value
    const exportCombined = isIntegratedPrefab.value

    const basis = transformParms.get(NO_PROXY)
    const lods = batchCompress
      ? [
          { suffix: '-LOD_0', parms: { ...basis, maxTextureSize: 2048 }, metadata: { device: 'DESKTOP' } },
          { suffix: '-LOD_1', parms: { ...basis, maxTextureSize: 1024 }, metadata: { device: 'XR' } },
          { suffix: '-LOD_2', parms: { ...basis, maxTextureSize: 512 }, metadata: { device: 'MOBILE' } }
        ]
      : [{ parms: basis, metadata: {} }]
    const heuristic = 'DEVICE'
    await createLODVariants(modelSrc, modelDst, lods, clientside, heuristic, exportCombined)

    const [_, directoryToRefresh, __] = /.*\/(projects\/.*)\/([\w\d\s\-_.]*)$/.exec(modelSrc)!
    await FileBrowserService.fetchFiles(directoryToRefresh)
  }

  useEffect(() => {
    const fullSrc = fileProperties.url.value
    const fileName = fullSrc.split('/').pop()!.split('.').shift()!
    const dst = `${fileName}-transformed`
    transformParms.dst.set(dst)
  }, [fileProperties.url])

  return (
    <Menu
      open={openCompress.value}
      onClose={() => openCompress.set(false)}
      showCloseButton={true}
      maxWidth={'lg'}
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

      {fileConsistsOfContentType(fileProperties.value, 'model') && (
        <>
          <GLTFTransformProperties
            transformParms={transformParms}
            onChange={(transformParms: ModelTransformParameters) => {}}
          />
          <InputGroup name="Clientside Transform" label="Clientside Transform">
            <BooleanInput
              value={
                true
                // isClientside.value
              }
              onChange={(val: boolean) => {
                // isClientside.set(val)
              }}
              disabled={true}
            />
          </InputGroup>
          <InputGroup name="Batch Compress" label="Batch Compress">
            <BooleanInput
              value={isBatchCompress.value}
              onChange={(val: boolean) => {
                isBatchCompress.set(val)
              }}
            />
          </InputGroup>
          <InputGroup name="Generate Integrated Variant Prefab" label="Generate Integrated Variant Prefab">
            <BooleanInput
              value={isIntegratedPrefab.value}
              onChange={(val: boolean) => {
                isIntegratedPrefab.set(val)
              }}
            />
          </InputGroup>
        </>
      )}

      {fileConsistsOfContentType(fileProperties.value, 'image') && (
        <div>
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
        </div>
      )}
    </Menu>
  )
}
