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

import React, { useEffect } from 'react'
import { twMerge } from 'tailwind-merge'
import { LoaderUtils } from 'three'

import {
  transformModel as clientSideTransformModel,
  ModelTransformStatus
} from '@ir-engine/common/src/model/ModelTransformFunctions'
import { setComponent } from '@ir-engine/ecs/src/ComponentFunctions'
import {
  DefaultModelTransformParameters as defaultParams,
  ModelTransformParameters
} from '@ir-engine/engine/src/assets/classes/ModelTransform'
import { Heuristic, VariantComponent } from '@ir-engine/engine/src/scene/components/VariantComponent'
import { NO_PROXY, none, useHookstate } from '@ir-engine/hyperflux'
import { iterateEntityNode, removeEntityNodeRecursively } from '@ir-engine/spatial/src/transform/components/EntityTree'

import { PopoverState } from '@ir-engine/client-core/src/common/services/PopoverState'
import { useTranslation } from 'react-i18next'
import { defaultLODs, LODList, LODVariantDescriptor } from '../../constants/GLTFPresets'
import exportGLTF from '../../functions/exportGLTF'

import { pathJoin } from '@ir-engine/engine/src/assets/functions/miscUtils'
import { SourceComponent } from '@ir-engine/engine/src/scene/components/SourceComponent'
import { createSceneEntity } from '@ir-engine/engine/src/scene/functions/createSceneEntity'
import ConfirmDialog from '@ir-engine/ui/src/components/tailwind/ConfirmDialog'
import Button from '@ir-engine/ui/src/primitives/tailwind/Button'
import Text from '@ir-engine/ui/src/primitives/tailwind/Text'
import { HiPlus, HiXMark } from 'react-icons/hi2'
import { MdClose } from 'react-icons/md'
import { FileDataType } from '../../constants/AssetTypes'
import GLTFTransformProperties from '../properties/GLTFTransformProperties'

const progressCaptions: Record<ModelTransformStatus, string> = {
  [ModelTransformStatus.TransformingModels]: 'editor:properties.model.transform.status.transformingmodels',
  [ModelTransformStatus.ProcessingTexture]: 'editor:properties.model.transform.status.processingtexture',
  [ModelTransformStatus.WritingFiles]: 'editor:properties.model.transform.status.writingfiles',
  [ModelTransformStatus.Complete]: 'editor:properties.model.transform.status.complete'
}

const createLODVariants = async (
  srcURL: string,
  lods: LODVariantDescriptor[],
  heuristic: Heuristic,
  exportCombined = false,
  onProgress: (
    progress: number,
    status: ModelTransformStatus,
    numerator: number,
    denominator: number
  ) => void = () => {}
) => {
  const lodVariantParams: ModelTransformParameters[] = lods.map((lod) => ({
    ...lod.params
  }))

  const transformMetadata: Record<string, any>[] = []
  await clientSideTransformModel(
    srcURL,
    lodVariantParams,
    (i, key, data) => {
      if (!transformMetadata[i]) transformMetadata[i] = {}
      transformMetadata[i][key] = data
    },
    onProgress
  )

  if (exportCombined) {
    const firstLODParams = lods[0].params

    const result = createSceneEntity('container')
    const variant = createSceneEntity('LOD Variant', result)
    setComponent(variant, VariantComponent, {
      levels: lods.map((lod, lodIndex) => ({
        src: `${LoaderUtils.extractUrlBase(srcURL)}${lod.params.dst}.${lod.params.modelFormat}`,
        metadata: {
          ...lod.variantMetadata,
          ...transformMetadata[lodIndex]
        }
      })),
      heuristic
    })
    const destinationPath = srcURL.replace(/\.[^.]*$/, `-integrated.gltf`)
    iterateEntityNode(result, (entity) => setComponent(entity, SourceComponent, destinationPath))
    await exportGLTF(result, destinationPath)
    removeEntityNodeRecursively(result)
  }
}

export default function ModelCompressionPanel({
  selectedFiles,
  refreshDirectory
}: {
  selectedFiles: readonly FileDataType[]
  refreshDirectory: () => Promise<void>
}) {
  const { t } = useTranslation()
  const compressionLoading = useHookstate(false)
  const compressionProgress = useHookstate({
    progress: 0,
    caption: ''
  })
  const selectedLODIndex = useHookstate(0)
  const selectedPreset = useHookstate(defaultParams)
  const presetList = useHookstate(structuredClone(LODList))

  useEffect(() => {
    const presets = localStorage.getItem('presets')
    if (presets !== null) {
      presetList.set(JSON.parse(presets))
    }
  }, [])

  const lods = useHookstate<LODVariantDescriptor[]>([])

  const compressContentInBrowser = async () => {
    compressionLoading.set(true)
    compressionProgress.set({
      progress: 0,
      caption: ''
    })
    for (const file of selectedFiles) {
      await compressModel(file)
    }
    await refreshDirectory()
    compressionLoading.set(false)
  }

  const applyPreset = (preset: ModelTransformParameters) => {
    selectedPreset.set(JSON.parse(JSON.stringify(preset)))
    PopoverState.showPopupover(
      <ConfirmDialog text={t('editor:properties.model.transform.applyPresetConfirmation')} onSubmit={confirmPreset} />
    )
  }

  const confirmPreset = () => {
    const lod = lods[selectedLODIndex.value].get(NO_PROXY)
    const dst = lod.params.dst
    const modelFormat = lod.params.modelFormat
    const uri = lod.params.resourceUri

    const presetParams = JSON.parse(JSON.stringify(selectedPreset.value)) as ModelTransformParameters
    presetParams.dst = dst
    presetParams.modelFormat = modelFormat
    presetParams.resourceUri = uri

    lods[selectedLODIndex.value].params.set(presetParams)
  }

  const savePresetList = () => {
    presetList.merge([JSON.parse(JSON.stringify(lods[selectedLODIndex.value].value))])
    localStorage.setItem('presets', JSON.stringify(presetList.value))
  }

  const compressModel = async (file: FileDataType) => {
    const exportCombined = true

    let fileLODs = lods.value as LODVariantDescriptor[]

    const url = new URL(file.url)
    const srcURL = pathJoin(url.origin, url.pathname)
    const modelFormat = srcURL.endsWith('.gltf') ? 'gltf' : srcURL.endsWith('.vrm') ? 'vrm' : 'glb'

    if (selectedFiles.length > 1) {
      fileLODs = fileLODs.map((lod) => {
        const fileName = srcURL.split('/').pop()!.split('.').shift()!
        const dst = fileName + lod.suffix
        return {
          ...lod,
          dst,
          modelFormat
        }
      })
    }

    await createLODVariants(
      srcURL,
      fileLODs,
      Heuristic.DISTANCE,
      exportCombined,
      (progress, status, numerator, denominator) => {
        const caption = t(progressCaptions[status]!, {
          numerator: numerator + 1,
          denominator
        })
        compressionProgress.set({ progress, caption })
      }
    )
  }

  const deletePreset = (event: React.MouseEvent, idx: number) => {
    event.stopPropagation()
    presetList[idx].set(none)
    // presetList.set(presetList.value.filter((_, i) => i !== idx))
    localStorage.setItem('presets', JSON.stringify(presetList.value))
  }

  const handleRemoveLOD = (idx: number) => {
    lods.set((currentLods) => currentLods.filter((_, i) => i !== idx))
    if (selectedLODIndex.value >= lods.length) {
      selectedLODIndex.set(lods.length - 1)
    }
  }

  useEffect(() => {
    const firstFile = selectedFiles[0]
    if (firstFile == null) {
      return
    }
    const url = new URL(firstFile.url)
    const fullSrc = pathJoin(url.origin, url.pathname)
    const fileName = fullSrc.split('/').pop()!.split('.').shift()!

    const defaults = defaultLODs.map((defaultLOD) => {
      const lod = JSON.parse(JSON.stringify(defaultLOD)) as LODVariantDescriptor
      lod.params.dst = fileName + lod.suffix
      lod.params.modelFormat = fullSrc.endsWith('.gltf') ? 'gltf' : fullSrc.endsWith('.vrm') ? 'vrm' : 'glb'
      lod.params.resourceUri = ''
      return lod
    })

    lods.set(defaults)
  }, [selectedFiles])

  const handleAddLOD = () => {
    const params = JSON.parse(JSON.stringify(lods[selectedLODIndex.value].params.value)) as ModelTransformParameters
    const suffix = '-LOD' + lods.length
    params.dst = params.dst.replace(lods[selectedLODIndex.value].suffix.value, suffix)
    lods.merge([
      {
        params: params,
        suffix: suffix,
        variantMetadata: {}
      }
    ])
    selectedLODIndex.set(lods.length - 1)
  }

  return (
    <div className="max-h-[80vh] w-[60vw] overflow-y-auto rounded-xl bg-[#212226]">
      <div className="relative flex items-center justify-center px-8 py-3">
        <Text className="leading-6">{t('editor:properties.model.transform.compress')}</Text>
        <Button
          variant="outline"
          className="absolute right-0 border-0 dark:bg-transparent dark:text-[#A3A3A3]"
          startIcon={<MdClose />}
          onClick={() => PopoverState.hidePopupover()}
        />
      </div>
      <div className="px-8 pb-6 pt-2 text-left">
        <Text className="mb-6 font-semibold">{t('editor:properties.model.transform.lodLevels')}</Text>
        <div className="mb-8 flex gap-x-4">
          {lods.value.map((_lod, index) => (
            <span key={index} className="flex items-center">
              <Button
                variant="transparent"
                className={`rounded-none px-1 pb-4 text-sm font-medium ${
                  selectedLODIndex.value === index ? 'border-b border-blue-primary text-blue-primary' : 'text-[#9CA0AA]'
                }`}
                onClick={() => selectedLODIndex.set(Math.min(index, lods.length - 1))}
              >
                {t('editor:properties.model.transform.lodLevelNumber', { index: index + 1 })}
              </Button>
              {selectedLODIndex.value !== index && (
                <Button
                  className={twMerge('m-0 p-0 pb-1')}
                  variant="transparent"
                  onClick={() => handleRemoveLOD(index)}
                  startIcon={<HiXMark />}
                  title="remove"
                />
              )}
            </span>
          ))}
          <Button
            className="self-center rounded-md bg-[#162546] p-1 [&>*]:m-0"
            variant="transparent"
            onClick={handleAddLOD}
          >
            <HiPlus />
          </Button>
        </div>

        <div className="my-8 flex items-center justify-around gap-x-1 overflow-x-auto rounded-lg border border-theme-input p-2">
          {presetList.value.map((lodItem: LODVariantDescriptor, index) => (
            <Button
              key={index}
              variant="transparent"
              className="text-nowrap rounded-full bg-[#212226] px-2 py-0.5"
              onClick={() => applyPreset(lodItem.params)}
              endIcon={
                !LODList.find((l) => l.params.dst === lodItem.params.dst) && (
                  <HiXMark onClick={(event) => deletePreset(event, index)} />
                )
              }
            >
              {lodItem.params.dst}
            </Button>
          ))}
          <Button
            variant="transparent"
            className="text-nowrap rounded bg-[#162546] px-3 py-2"
            onClick={() => savePresetList()}
          >
            {t('editor:properties.model.transform.savePreset')}
          </Button>
        </div>

        <div className="ml-[16.66%] w-4/6">
          <GLTFTransformProperties
            transformParms={lods[selectedLODIndex.value].params}
            itemCount={selectedFiles.length}
          />
        </div>

        <div className="flex justify-end justify-items-stretch px-8">
          {compressionLoading.value ? (
            <div className="flex w-full flex-col">
              <div className="h-4 w-full overflow-hidden rounded bg-white">
                <div
                  className="h-4 w-full origin-left bg-blue-primary transition-transform"
                  style={{
                    transform: `scaleX(${compressionProgress.progress.value})`
                  }}
                />
              </div>
              {compressionProgress.caption.value}
            </div>
          ) : (
            <Button variant="primary" onClick={compressContentInBrowser}>
              {t('editor:properties.model.transform.compress')}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
