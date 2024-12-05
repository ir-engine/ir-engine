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

import {
  Entity,
  EntityUUID,
  UUIDComponent,
  getComponent,
  getOptionalComponent,
  hasComponent,
  removeComponent,
  setComponent,
  useComponent,
  useOptionalComponent
} from '@ir-engine/ecs'
import styles from '@ir-engine/editor/src/components/layout/styles.module.scss'
import { EditorControlFunctions } from '@ir-engine/editor/src/functions/EditorControlFunctions'
import { getTextureAsync } from '@ir-engine/engine/src/assets/functions/resourceLoaderHooks'
import { SourceComponent } from '@ir-engine/engine/src/scene/components/SourceComponent'
import { MaterialSelectionState } from '@ir-engine/engine/src/scene/materials/MaterialLibraryState'
import { NO_PROXY, State, none, useHookstate, useMutableState } from '@ir-engine/hyperflux'
import { NameComponent } from '@ir-engine/spatial/src/common/NameComponent'
import createReadableTexture from '@ir-engine/spatial/src/renderer/functions/createReadableTexture'
import {
  MaterialPlugins,
  MaterialPrototypeComponent,
  MaterialStateComponent,
  prototypeQuery
} from '@ir-engine/spatial/src/renderer/materials/MaterialComponent'
import { getDefaultType } from '@ir-engine/spatial/src/renderer/materials/constants/DefaultArgs'
import {
  extractValues,
  formatMaterialArgs,
  getMaterial
} from '@ir-engine/spatial/src/renderer/materials/materialFunctions'
import { Tooltip } from '@ir-engine/ui'
import InputGroup from '@ir-engine/ui/src/components/editor/input/Group'
import SelectInput from '@ir-engine/ui/src/components/editor/input/Select'
import StringInput from '@ir-engine/ui/src/components/editor/input/String'
import { PanelDragContainer, PanelTitle } from '@ir-engine/ui/src/components/editor/layout/Panel'
import ParameterInput from '@ir-engine/ui/src/components/editor/properties/parameter'
import Button from '@ir-engine/ui/src/primitives/tailwind/Button'
import React, { useCallback, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Material, Texture, Uniform } from 'three'

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
  const prototypes = prototypeQuery().map((prototype) => ({
    label: getComponent(prototype, NameComponent),
    value: prototype
  }))

  const entity = UUIDComponent.getEntityByUUID(props.materialUUID)
  console.log(entity)
  const materialComponent = useComponent(entity, MaterialStateComponent)
  const material = materialComponent.material.get(NO_PROXY) as Material
  const thumbnails = useHookstate<Record<string, ThumbnailData>>({})
  const textureUnloadMap = useHookstate<Record<string, (() => void) | undefined>>({})
  const selectedPlugin = useHookstate(Object.keys(MaterialPlugins)[0])

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
  }, [materialComponent, materialComponent.prototypeEntity])

  const prototypeName = useHookstate('')

  prototypeName.set(material.userData.type || material.type)

  const currentSelectedMaterial = useMutableState(MaterialSelectionState).selectedMaterial
  const materialName = useOptionalComponent(
    UUIDComponent.getEntityByUUID(currentSelectedMaterial.value!),
    NameComponent
  )

  useEffect(() => {
    clearThumbs().then(createThumbnails).then(checkThumbs)
  }, [prototypeName, currentSelectedMaterial])

  const prototypeEntity = materialComponent.prototypeEntity.value!
  const prototype = useComponent(prototypeEntity, MaterialPrototypeComponent)

  const shouldLoadTexture = async (value, key: string, parametersObject: State<any>) => {
    let prop
    if (parametersObject[key].type.value === 'texture') {
      if (value) {
        const priorUnload = textureUnloadMap.get(NO_PROXY)[key]
        if (priorUnload) {
          priorUnload()
        }
        const [texture, unload] = await getTextureAsync(value)
        textureUnloadMap.merge({ [key]: unload })
        prop = texture
      } else {
        prop = null
      }
    } else {
      prop = value
    }
    return prop
  }

  const materialParameters = useHookstate({})

  useEffect(() => {
    materialParameters.set({})
    materialParameters.set(
      Object.fromEntries(
        Object.keys(
          extractValues(getComponent(prototypeEntity, MaterialPrototypeComponent).prototypeArguments, material)
        ).map((k) => [k, material[k]])
      )
    )
  }, [currentSelectedMaterial])

  useEffect(() => {})

  //for each parameter type, default values
  const pluginParameters = useHookstate({})
  //for the current values of the parameters
  const pluginValues = useHookstate({})

  useEffect(() => {
    pluginValues.set({})
    pluginParameters.set({})
  }, [selectedPlugin, currentSelectedMaterial])

  useEffect(() => {
    for (const pluginComponent of Object.values(MaterialPlugins)) {
      const component = getOptionalComponent(entity, pluginComponent)
      if (!component || pluginComponent != MaterialPlugins[selectedPlugin.value]) {
        continue
      }
      const pluginParameterValues = {}
      Object.entries(component).map(([key, uniform]) => {
        const value = (uniform as Uniform).value
        pluginParameterValues[key] = { type: getDefaultType(value), default: value }
      })
      pluginParameters.set(formatMaterialArgs(pluginParameterValues))
      for (const key in component) pluginValues[key].set(component[key].value)
      return
    }
  }, [selectedPlugin, useOptionalComponent(entity, MaterialPlugins[selectedPlugin.value])])
  return (
    <div className="relative flex flex-col gap-2">
      <InputGroup name="Name" label={t('editor:properties.mesh.material.name')}>
        <StringInput
          value={materialName?.value ?? ''}
          onChange={(name) => {
            setComponent(entity, NameComponent, name)
            materialName?.set(name)
          }}
        />
      </InputGroup>
      <InputGroup name="Source" label={t('editor:properties.mesh.material.source')}>
        <div className="border-grey-500 flex flex-row gap-2 rounded-lg border-2 border-solid bg-[#212226] p-1 text-xs text-white">
          <div className="justify-cneter flex items-center align-middle">
            <label>{t('editor:properties.mesh.material.path')}</label>
          </div>
          <div className="break-all">{getOptionalComponent(entity, SourceComponent) ?? 'None'}</div>
        </div>
      </InputGroup>
      <br />
      <InputGroup name="Prototype" label={t('editor:properties.mesh.material.prototype')}>
        <SelectInput
          value={prototypeEntity}
          options={prototypes}
          onChange={(prototypeEntity: Entity) => {
            if (materialComponent.prototypeEntity.value)
              materialComponent.prototypeEntity.set(prototypeEntity as Entity)
            prototypeName.set(materialComponent.material.value.userData.type)
          }}
        />
      </InputGroup>

      <ParameterInput
        entity={props.materialUUID}
        values={materialParameters.get(NO_PROXY)}
        onChange={(key) => async (value) => {
          const property = await shouldLoadTexture(value, key, prototype.prototypeArguments)
          const texture = property as Texture
          if (texture?.isTexture) {
            texture.flipY = false
            texture.needsUpdate = true
          }
          EditorControlFunctions.modifyMaterial(
            [materialComponent.material.value!.uuid],
            materialComponent.material.value!.uuid as EntityUUID,
            [{ [key]: property }]
          )
          if (materialComponent.parameters.value) materialComponent.parameters[key].set(property)
          await checkThumbs()
        }}
        onModify={() => {
          getMaterial(materialComponent.material.value.uuid as EntityUUID).needsUpdate = true
        }}
        defaults={prototype.prototypeArguments!.value}
        thumbnails={toBlobs(thumbnails.value)}
      />

      <br />
      <div className="border-grey-500 flex flex-row justify-between rounded-lg border-2 border-solid p-1 align-middle">
        <SelectInput
          value={selectedPlugin.value}
          options={Object.keys(MaterialPlugins).map((key) => ({ label: key, value: key }))}
          onChange={(value) => selectedPlugin.set(value as string)}
        />
        <Button
          variant="outline"
          size="small"
          onClick={() => {
            setComponent(entity, MaterialPlugins[selectedPlugin.value])
          }}
        >
          {t('editor:properties.mesh.material.setPlugin')}
        </Button>
      </div>
      {hasComponent(entity, MaterialPlugins[selectedPlugin.value]) && (
        <div className={styles.contentContainer}>
          <ParameterInput
            entity={props.materialUUID}
            values={pluginValues.value}
            onChange={(key) => async (value) => {
              const property = await shouldLoadTexture(value, key, pluginParameters)
              getComponent(entity, MaterialPlugins[selectedPlugin.value])[key].value = property
              pluginValues[key].set(property)
            }}
            defaults={pluginParameters.value}
          />
          <Button
            variant="outline"
            size="small"
            onClick={() => {
              removeComponent(entity, MaterialPlugins[selectedPlugin.value])
            }}
          >
            Remove Plugin
          </Button>
        </div>
      )}
    </div>
  )
}

export const MaterialPropertyTitle = () => {
  const { t } = useTranslation()

  return (
    <div className={styles.dockableTab}>
      <PanelDragContainer>
        <PanelTitle>
          <Tooltip content={t('editor:properties.mesh.materialProperties.info')}>
            {t('editor:properties.mesh.materialProperties.title')}
          </Tooltip>
        </PanelTitle>
      </PanelDragContainer>
    </div>
  )
}

export default MaterialEditor
