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

import React, { useCallback } from 'react'
import { Texture } from 'three'

import styles from '@etherealengine/editor/src/components/layout/styles.module.scss'

import { NO_PROXY, none, useHookstate } from '@etherealengine/hyperflux'
import createReadableTexture from '@etherealengine/spatial/src/renderer/functions/createReadableTexture'
import MaterialLibraryIcon from '@mui/icons-material/Yard'
import { Box, Divider, Stack } from '@mui/material'

import { EntityUUID, UUIDComponent, getComponent } from '@etherealengine/ecs'
import { getTextureAsync } from '@etherealengine/engine/src/assets/functions/resourceHooks'
import { SourceComponent } from '@etherealengine/engine/src/scene/components/SourceComponent'
import { setMaterialName } from '@etherealengine/engine/src/scene/materials/functions/materialSourcingFunctions'
import { MaterialComponent } from '@etherealengine/spatial/src/renderer/materials/MaterialComponent'
import { getMaterial } from '@etherealengine/spatial/src/renderer/materials/materialFunctions'
import { useTranslation } from 'react-i18next'
import { EditorControlFunctions } from '../../functions/EditorControlFunctions'
import { InputGroup } from '../inputs/InputGroup'
import ParameterInput from '../inputs/ParameterInput'
import SelectInput from '../inputs/SelectInput'
import StringInput from '../inputs/StringInput'
import { PanelDragContainer, PanelIcon, PanelTitle } from '../layout/Panel'
import { InfoTooltip } from '../layout/Tooltip'

type ThumbnailData = {
  src: string
  blob: string
}

const toBlobs = (thumbnails: Record<string, ThumbnailData>): Record<string, string> => {
  const blobs = {}
  Object.entries(thumbnails).map(([k, { blob }]) => {
    blobs[k] = blob
  })
  return blobs
}

export function MaterialEditor(props: { materialUUID: EntityUUID }) {
  const { t } = useTranslation()
  const { materialUUID: materialID } = props
  const material = getMaterial(materialID)!
  const prototypes = Object.keys(MaterialComponent.prototypeByName).map((prototype) => ({
    label: prototype,
    value: prototype
  }))
  const thumbnails = useHookstate<Record<string, ThumbnailData>>({})
  const textureUnloadMap = useHookstate<Record<string, (() => void) | undefined>>({})
  const selectedPlugin = useHookstate('')

  const createThumbnail = async (field: string, texture: Texture) => {
    if (texture?.isTexture) {
      try {
        const blob: string = (await createReadableTexture(texture, {
          maxDimensions: { width: 256, height: 256 },
          url: true
        })) as string
        const thumbData: ThumbnailData = {
          src: texture.image?.src ?? 'BLOB',
          blob
        }
        thumbnails[field].set(thumbData)
        return Promise.resolve()
      } catch (e) {
        console.warn('failed loading thumbnail: ' + e)
      }
    }
  }

  const createThumbnails = async () => {
    const promises = Object.entries(material).map(([field, texture]: [string, Texture]) =>
      createThumbnail(field, texture)
    )
    return Promise.all(promises)
  }

  const checkThumbs = async () => {
    thumbnails.promised && (await thumbnails.promise)
    const thumbnailVals = thumbnails.value
    Object.entries(thumbnailVals).map(([k, { blob }]) => {
      if (!material[k]) {
        URL.revokeObjectURL(blob)
        thumbnails[k].set(none)
      }
    })
    await Promise.all(
      Object.entries(material).map(async ([field, texture]: [string, Texture]) => {
        if (texture?.isTexture) {
          if (!thumbnails[field]?.value || thumbnails[field]?.value?.src !== texture.image?.src)
            await createThumbnail(field, texture)
        }
      })
    )
  }

  const clearThumbs = useCallback(async () => {
    Object.values(thumbnails.value).map(({ blob }) => URL.revokeObjectURL(blob))
    thumbnails.set({})
  }, [])

  // useEffect(() => {
  //   clearThumbs().then(createThumbnails).then(checkThumbs)
  // }, [materialComponent.uuid])

  const entity = UUIDComponent.getEntityByUUID(materialID)
  const materialComponent = getComponent(entity, MaterialComponent)

  return (
    <div style={{ position: 'relative' }}>
      <InputGroup name="Name" label={t('editor:properties.mesh.material.name')}>
        <StringInput
          value={materialComponent.material!.name}
          onChange={(name) => setMaterialName(UUIDComponent.getEntityByUUID(materialID as EntityUUID), name)}
        />
      </InputGroup>
      <InputGroup name="Source" label={t('editor:properties.mesh.material.source')}>
        <div className={styles.contentContainer}>
          <Box className="Box" sx={{ padding: '8px', overflow: 'scroll' }}>
            <Stack className="Stack" spacing={2} direction="column" alignContent={'center'}>
              <Stack className="Stack" spacing={2} direction="row" alignContent={'flex-start'}>
                {/* <div>
                  <label>{t('editor:properties.mesh.material.type')}</label>
                </div>
                <div>{materialComponent.src.type.value}</div> */}
              </Stack>
              <Stack className="Stack" spacing={2} direction="row">
                <div>
                  <label>{t('editor:properties.mesh.material.path')}</label>
                </div>
                <div>{getComponent(entity, SourceComponent)}</div>
              </Stack>
            </Stack>
          </Box>
        </div>
      </InputGroup>
      <br />
      <InputGroup name="Prototype" label={t('editor:properties.mesh.material.prototype')}>
        <SelectInput
          value={
            getComponent(UUIDComponent.getEntityByUUID(materialComponent.prototypeUuid), MaterialComponent)
              .prototypeName
          }
          options={prototypes}
          onChange={(protoId) => {
            //const nuMat = changeMaterialPrototype(material, protoId)
            //materialComponent.set(materialFromId(nuMat!.uuid))
            // prototypeComponent = prototypeFromId(materialComponent.prototype.value)
          }}
        />
      </InputGroup>
      <Divider className={styles.divider} />
      <ParameterInput
        entity={material.uuid}
        values={materialComponent.parameters}
        onChange={(k) => async (val) => {
          let prop
          if (materialComponent.prototypeArguments.value[k].type === 'texture' && typeof val === 'string') {
            if (val) {
              const priorUnload = textureUnloadMap.get(NO_PROXY)[k]
              if (priorUnload) {
                priorUnload()
              }
              const [texture, unload] = await getTextureAsync(val)
              textureUnloadMap.merge({ [k]: unload })
              prop = texture
            } else {
              prop = null
            }
          } else {
            prop = val
          }
          EditorControlFunctions.modifyMaterial([materialID], materialComponent.material!.uuid, [{ [k]: prop }])
          materialComponent.parameters[k].set(prop)
        }}
        defaults={materialComponent.prototypeArguments.value}
        thumbnails={toBlobs(thumbnails.value)}
      />
      <br />
      {/* <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          border: '1px solid #fff',
          borderRadius: '4px',
          padding: '4px'
        }}
      >
        <SelectInput
          value={selectedPlugin.value}
          options={Object.keys(materialLibrary.plugins).map((key) => ({ label: key, value: key }))}
          onChange={selectedPlugin.set}
        />
        <Button
          onClick={() => {
            materialComponent.plugins.set(materialComponent.plugins.concat(selectedPlugin.value))
          }}
        >
          {t('editor:properties.mesh.material.addPlugin')}
        </Button>
      </div> */}
      {/* <PaginatedList
        list={materialComponent.plugins}
        element={(plugin: State<string>) => {
          return (
            <div className={styles.contentContainer}>
              <InputGroup name="Plugin" label={t('editor:properties.mesh.material.plugin')}>
                <SelectInput
                  value={plugin.value}
                  options={Object.keys(materialLibrary.plugins.value).map((key) => ({ label: key, value: key }))}
                  onChange={plugin.set}
                />
              </InputGroup>
              <Button
                onClick={() => {
                  removeMaterialPlugin(material, plugin.value)
                  materialComponent.plugins.set(materialComponent.plugins.value.filter((val) => val !== plugin.value))
                }}
                style={{ backgroundColor: '#f00' }}
              >
                x
              </Button>
            </div>
          )
        }}
      /> */}
    </div>
  )
}

export const MaterialPropertyTitle = () => {
  const { t } = useTranslation()

  return (
    <div className={styles.dockableTab}>
      <PanelDragContainer>
        <PanelIcon as={MaterialLibraryIcon} size={12} />
        <PanelTitle>
          <InfoTooltip title={t('editor:properties.mesh.materialProperties.info')}>
            <span>{t('editor:properties.mesh.materialProperties.title')}</span>
          </InfoTooltip>
        </PanelTitle>
      </PanelDragContainer>
    </div>
  )
}

export default MaterialEditor
