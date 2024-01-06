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
import React, { useEffect, useState } from 'react'

import Button from '@etherealengine/client-core/src/common/components/Button'
import Menu from '@etherealengine/client-core/src/common/components/Menu'
import { NO_PROXY, State, useHookstate } from '@etherealengine/hyperflux'
import CircularProgress from '@etherealengine/ui/src/primitives/mui/CircularProgress'
import Typography from '@etherealengine/ui/src/primitives/mui/Typography'

import BooleanInput from '../inputs/BooleanInput'
import InputGroup from '../inputs/InputGroup'
import { FileType } from './FileBrowserContentPanel'
import styles from './styles.module.scss'

import { FileBrowserService } from '@etherealengine/client-core/src/common/services/FileBrowserService'
import {
  DefaultModelTransformParameters,
  ModelTransformParameters
} from '@etherealengine/engine/src/assets/classes/ModelTransform'
import { transformModel as clientSideTransformModel } from '@etherealengine/engine/src/assets/compression/ModelTransformFunctions'
import { Engine } from '@etherealengine/engine/src/ecs/classes/Engine'
import { setComponent } from '@etherealengine/engine/src/ecs/functions/ComponentFunctions'
import { createSceneEntity } from '@etherealengine/engine/src/ecs/functions/createSceneEntity'
import { ModelComponent } from '@etherealengine/engine/src/scene/components/ModelComponent'
import { VariantComponent } from '@etherealengine/engine/src/scene/components/VariantComponent'
import { modelTransformPath } from '@etherealengine/engine/src/schemas/assets/model-transform.schema'
import { Box, ListItemButton, ListItemText, Modal } from '@mui/material'
import exportGLTF from '../../functions/exportGLTF'
import { List } from '../layout/List'
import GLTFTransformProperties from '../properties/GLTFTransformProperties'

// TODO: Find place to put hard-coded list
const LODList: ModelTransformParameters[] = [
  {
    ...DefaultModelTransformParameters,
    src: 'Desktop - Low',
    dst: 'Desktop - Low',
    maxTextureSize: 1024
  },
  {
    ...DefaultModelTransformParameters,
    src: 'Desktop - Medium',
    dst: 'Desktop - Medium',
    maxTextureSize: 2048
  },
  {
    ...DefaultModelTransformParameters,
    src: 'Desktop - High',
    dst: 'Desktop - High',
    maxTextureSize: 2048
  },
  {
    ...DefaultModelTransformParameters,
    src: 'Mobile - Low',
    dst: 'Mobile - Low',
    maxTextureSize: 512
  },
  {
    ...DefaultModelTransformParameters,
    src: 'Mobile - High',
    dst: 'Mobile - High',
    maxTextureSize: 1024
  },
  {
    ...DefaultModelTransformParameters,
    src: 'XR - Low',
    dst: 'XR - Low',
    maxTextureSize: 1024
  },
  {
    ...DefaultModelTransformParameters,
    src: 'XR - Medium',
    dst: 'XR - Medium',
    maxTextureSize: 1024
  },
  {
    ...DefaultModelTransformParameters,
    src: 'XR - High',
    dst: 'XR - High',
    maxTextureSize: 2048
  }
]

export default function ModelCompressionPanel({
  openCompress,
  fileProperties,
  onRefreshDirectory
}: {
  openCompress: State<boolean>
  fileProperties: State<FileType>
  onRefreshDirectory: () => Promise<void>
}) {
  const compressionLoading = useHookstate(false)
  const isClientside = useHookstate<boolean>(true)
  const isBatchCompress = useHookstate<boolean>(true)
  const isIntegratedPrefab = useHookstate<boolean>(true)
  const transformParms = useHookstate<ModelTransformParameters>({
    ...DefaultModelTransformParameters,
    src: fileProperties.url.value,
    modelFormat: fileProperties.url.value.endsWith('.gltf') ? 'gltf' : 'glb'
  })

  const [modalOpen, setModalOpen] = useState<boolean>(false)
  const [selectedPreset, setSelectedPreset] = useState<ModelTransformParameters>(DefaultModelTransformParameters)
  const [presetList, setPresetList] = useState<ModelTransformParameters[]>(LODList)

  useEffect(() => {
    const presets = localStorage.getItem('presets')
    if (presets !== null) {
      setPresetList(JSON.parse(presets))
    }
  }, [])

  const compressContentInBrowser = async () => {
    compressionLoading.set(true)

    const compressor = compressModel
    await compressor()
    await onRefreshDirectory()

    compressionLoading.set(false)
    openCompress.set(false)
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
    }
  }

  const applyPreset = (preset: ModelTransformParameters) => {
    setSelectedPreset(preset)
    setModalOpen(true)
  }

  const confirmPreset = () => {
    if (!LODList.find((l) => l === selectedPreset)) {
      const prevDst = transformParms.dst.value
      transformParms.dst.set(`${prevDst}-${selectedPreset.dst.replace(/\s/g, '').toLowerCase()}`)
      transformParms.maxTextureSize.set(selectedPreset.maxTextureSize)
    }
    setModalOpen(false)
  }

  const savePresetList = (deleting: boolean) => {
    if (!deleting) {
      setPresetList([...presetList, transformParms.value])
    }
    localStorage.setItem('presets', JSON.stringify(presetList))
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

  const deletePreset = (idx: number) => {
    const newList = [...presetList]
    newList.splice(idx, 1)
    setPresetList(newList)
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
      <div className={styles.modelMenu}>
        <Box>
          <InputGroup name="fileType" label={fileProperties.value?.isFolder ? 'Directory' : 'File'}>
            <Typography variant="body2">{t('editor:properties.model.transform.compress') as string}</Typography>
          </InputGroup>
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
        </Box>
        <Box className={styles.presetBox}>
          <Typography className={styles.presetHeader} align="center">
            LOD Presets
          </Typography>
          <Box display="flex" alignItems="center">
            <List>
              {presetList.map((lodItem: ModelTransformParameters, idx) => (
                <Box>
                  <ListItemButton className={styles.presetButton} onClick={() => applyPreset(lodItem)}>
                    <ListItemText>{lodItem.dst}</ListItemText>
                  </ListItemButton>
                  {!LODList.find((l) => l.dst === lodItem.dst) && (
                    <ListItemButton onClick={() => deletePreset(idx)}>x</ListItemButton>
                  )}
                </Box>
              ))}
            </List>
          </Box>
          <Button onClick={() => savePresetList(false)}>Save Preset</Button>
        </Box>
      </div>
      <Modal open={modalOpen}>
        <Box className={styles.confirmModal}>
          <Typography>Would you like to apply this preset?</Typography>
          <Typography>{selectedPreset.dst}</Typography>
          <Box className={styles.confirmModalButtons}>
            <Button onClick={() => confirmPreset()}>Yes</Button>
            <Button onClick={() => setModalOpen(false)}>Close</Button>
          </Box>
        </Box>
      </Modal>
    </Menu>
  )
}
