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
import { NO_PROXY, none, State, useHookstate } from '@etherealengine/hyperflux'
import CircularProgress from '@etherealengine/ui/src/primitives/mui/CircularProgress'
import Typography from '@etherealengine/ui/src/primitives/mui/Typography'

import BooleanInput from '../inputs/BooleanInput'
import InputGroup from '../inputs/InputGroup'
import styles from './styles.module.scss'

import { FileBrowserService } from '@etherealengine/client-core/src/common/services/FileBrowserService'
import {
  DefaultModelTransformParameters as defaultParms,
  ModelTransformParameters
} from '@etherealengine/engine/src/assets/classes/ModelTransform'
import { transformModel as clientSideTransformModel } from '@etherealengine/engine/src/assets/compression/ModelTransformFunctions'
import { Engine } from '@etherealengine/engine/src/ecs/classes/Engine'
import { setComponent } from '@etherealengine/engine/src/ecs/functions/ComponentFunctions'
import { createSceneEntity } from '@etherealengine/engine/src/ecs/functions/createSceneEntity'
import { ModelComponent } from '@etherealengine/engine/src/scene/components/ModelComponent'
import { VariantComponent } from '@etherealengine/engine/src/scene/components/VariantComponent'
import { modelTransformPath } from '@etherealengine/engine/src/schemas/assets/model-transform.schema'
import Icon from '@etherealengine/ui/src/primitives/mui/Icon'
import IconButton from '@etherealengine/ui/src/primitives/mui/IconButton'
import { Box, List, ListItemButton, ListItemText } from '@mui/material'
import exportGLTF from '../../functions/exportGLTF'
import { ListItem } from '../layout/List'
import GLTFTransformProperties from '../properties/GLTFTransformProperties'
import { FileType } from './FileBrowser/FileBrowserContentPanel'

type LODVariantDescriptor = {
  params: ModelTransformParameters
  metadata: Record<string, any>
  suffix?: string
}

export default function ModelCompressionPanel({
  openCompress,
  fileProperties,
  onRefreshDirectory
}: {
  openCompress: State<boolean>
  fileProperties: State<FileType>
  onRefreshDirectory: () => Promise<void>
}) {
  const [compressionLoading, setCompressionLoading] = useState<boolean>(false)
  const [isClientside, setIsClientSide] = useState<boolean>(true)
  const [isIntegratedPrefab, setIsIntegratedPrefab] = useState<boolean>(true)
  const [selectedLOD, setSelectedLOD] = useState<number>(0)

  const transformParms = useHookstate<ModelTransformParameters>({
    ...defaultParms,
    src: fileProperties.value.url,
    modelFormat: fileProperties.value.url.endsWith('.gltf') ? 'gltf' : 'glb'
  })

  const lods = useHookstate<LODVariantDescriptor[]>([
    { suffix: '-LOD_0', params: { ...defaultParms, maxTextureSize: 2048 }, metadata: { device: 'DESKTOP' } },
    { suffix: '-LOD_1', params: { ...defaultParms, maxTextureSize: 1024 }, metadata: { device: 'XR' } },
    { suffix: '-LOD_2', params: { ...defaultParms, maxTextureSize: 512 }, metadata: { device: 'MOBILE' } }
  ])

  const compressContentInBrowser = async () => {
    setCompressionLoading(true)

    await compressModel()
    await onRefreshDirectory()

    setCompressionLoading(false)
    openCompress.set(false)
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
      ...lod.params,
      src: modelSrc,
      dst: `${modelDst}${lod.suffix ?? ''}.${lod.params.modelFormat}`
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

  const compressModel = async () => {
    const modelSrc = fileProperties.url.value
    const modelDst = transformParms.dst.value
    const clientside = isClientside
    const exportCombined = isIntegratedPrefab

    const heuristic = 'DEVICE'
    await createLODVariants(modelSrc, modelDst, lods.value, clientside, heuristic, exportCombined)

    const [_, directoryToRefresh, __] = /.*\/(projects\/.*)\/([\w\d\s\-_.]*)$/.exec(modelSrc)!
    await FileBrowserService.fetchFiles(directoryToRefresh)
  }

  useEffect(() => {
    const fullSrc = fileProperties.url.value
    const fileName = fullSrc.split('/').pop()!.split('.').shift()!
    const dst = `${fileName}-transformed`
    transformParms.dst.set(dst)
  }, [fileProperties.url])

  useEffect(() => {
    loadSelectedLOD()
  }, [selectedLOD])

  const saveSelectedLOD = () => {
    const val = transformParms.get(NO_PROXY)
    console.log('saveSelectedLOD', selectedLOD, val)
    lods[selectedLOD].params.set(val)
  }

  const loadSelectedLOD = () => {
    const val = lods[selectedLOD].params.get(NO_PROXY)
    console.log('loadSelectedLOD', selectedLOD, val)
    transformParms.set(val)
  }

  const handleLODSelect = (index) => {
    saveSelectedLOD()
    setSelectedLOD(index)
  }

  const handleLODDelete = (index) => {
    lods[index].set(none)

    if (selectedLOD === index) {
      setSelectedLOD(Math.min(index, lods.length - 1))
      loadSelectedLOD()
    }
  }

  const handleLODAdd = () => {
    lods.merge([
      {
        // parms: {...defaultParms},
        params: lods[selectedLOD].params.get(NO_PROXY),
        metadata: {}
      }
    ])
    setSelectedLOD(lods.length - 1)
    loadSelectedLOD()
  }

  return (
    <Menu
      open={openCompress.value}
      onClose={() => openCompress.set(false)}
      showCloseButton={true}
      maxWidth={'lg'}
      header={fileProperties.value.name}
      actions={
        <>
          {!compressionLoading ? (
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
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div className={styles.headerContainer}>LOD Levels</div>
            <List>
              {lods.map((lod, index) => (
                <ListItem>
                  <ListItemButton selected={selectedLOD === index} onClick={() => handleLODSelect(index)}>
                    {' '}
                    <ListItemText
                      primary={`LOD Level ${index}`}
                      secondary={Object.entries(lod.metadata.value)
                        .map((a) => a.join(': '))
                        .join(', ')}
                    />
                  </ListItemButton>
                  {lods.length > 1 && (
                    <IconButton
                      onClick={() => handleLODDelete(index)}
                      icon={<Icon type="Delete" style={{ color: 'var(--iconButtonColor)' }} />}
                    ></IconButton>
                  )}
                </ListItem>
              ))}
            </List>
            <div>
              <IconButton
                onClick={() => handleLODAdd()}
                icon={<Icon type="Add" style={{ color: 'var(--iconButtonColor)' }} />}
              ></IconButton>
            </div>
          </div>
        </Box>
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
            <InputGroup name="Generate Integrated Variant Prefab" label="Generate Integrated Variant Prefab">
              <BooleanInput
                value={isIntegratedPrefab}
                onChange={(val: boolean) => {
                  setIsIntegratedPrefab(val)
                }}
              />
            </InputGroup>
          </>
        </Box>
      </div>
    </Menu>
  )
}
