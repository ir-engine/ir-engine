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

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2025
Infinite Reality Engine. All Rights Reserved.
*/

import {
  Entity,
  getComponent,
  hasComponent,
  removeComponent,
  setComponent,
  useComponent,
  useOptionalComponent,
  UUIDComponent
} from '@ir-engine/ecs'
import { getTextureAsync } from '@ir-engine/engine/src/assets/functions/resourceLoaderHooks'
import { getState, NO_PROXY, none, useHookstate } from '@ir-engine/hyperflux'

import { AuthoringState } from '@ir-engine/engine/src/authoring/AuthoringState'
import { NameComponent } from '@ir-engine/spatial/src/common/NameComponent'
import createReadableTexture from '@ir-engine/spatial/src/renderer/functions/createReadableTexture'
import { generateDefaults } from '@ir-engine/spatial/src/renderer/materials/constants/DefaultArgs'
import {
  MaterialPluginComponents,
  MaterialPrototypeDefinitions,
  MaterialStateComponent
} from '@ir-engine/spatial/src/renderer/materials/MaterialComponent'
import { Button, Tooltip } from '@ir-engine/ui'
import InputGroup from '@ir-engine/ui/src/components/editor/input/Group'
import SelectInput from '@ir-engine/ui/src/components/editor/input/Select'
import StringInput from '@ir-engine/ui/src/components/editor/input/String'
import { PanelDragContainer, PanelTitle } from '@ir-engine/ui/src/components/editor/layout/Panel'
import ParameterInput from '@ir-engine/ui/src/components/editor/properties/parameter'
import React, { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { Material, Texture } from 'three'
import { commitProperty } from '../../components/properties/Util'

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

export function MaterialEditor(props: { entity: Entity }) {
  const { t } = useTranslation()
  const entity = props.entity
  const materialComponent = useComponent(entity, MaterialStateComponent)
  const material = materialComponent.material.get(NO_PROXY) as Material

  const thumbnails = useHookstate<Record<string, ThumbnailData>>({})
  const textureUnloadMap = useHookstate<Record<string, (() => void) | undefined>>({})
  const selectedPlugin = useHookstate(
    Object.keys(MaterialPluginComponents).find((key) => hasComponent(entity, MaterialPluginComponents[key])) ?? ''
  )

  const currentPlugin = selectedPlugin.value
    ? getComponent(entity, MaterialPluginComponents[selectedPlugin.value])
    : undefined

  const pluginOptions = Object.keys(MaterialPluginComponents).map((key) => ({ label: key, value: key }))
  pluginOptions.unshift({
    label: 'None',
    value: ''
  })

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
  }, [materialComponent])

  const materialName = useOptionalComponent(entity, NameComponent)

  // useEffect(() => {
  //   clearThumbs().then(createThumbnails).then(checkThumbs)
  // }, [currentSelectedMaterial])

  const shouldLoadTexture = async (value, key: string, parametersObject) => {
    let prop
    if (parametersObject[key].type === 'texture') {
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
        <div className="flex flex-row gap-2 rounded-lg bg-[#212226] p-1 text-xs text-white">
          <div className="justify-cneter flex items-center align-middle">
            <label>{t('editor:properties.mesh.material.path')}</label>
          </div>
          <div className="break-all">{UUIDComponent.getSourceEntity(entity) ?? 'None'}</div>
        </div>
      </InputGroup>
      <br />
      <ParameterInput
        path={UUIDComponent.get(entity)}
        values={materialComponent.parameters.get(NO_PROXY)}
        onChange={(key) => commitProperty(MaterialStateComponent, ('parameters.' + key) as any)}
        defaults={getState(MaterialPrototypeDefinitions)[material.type].arguments}
        thumbnails={toBlobs(thumbnails.value)}
      />
      <br />
      <div className="flex flex-row justify-between rounded-lg p-1 align-middle">
        <SelectInput
          value={selectedPlugin.value}
          options={pluginOptions}
          onChange={(value) => selectedPlugin.set(value as string)}
        />
        <Button
          variant="tertiary"
          size="sm"
          onClick={() => {
            if (!selectedPlugin.value) return
            setComponent(entity, MaterialPluginComponents[selectedPlugin.value])
            AuthoringState.snapshotEntities([entity])
          }}
        >
          {t('editor:properties.mesh.material.setPlugin')}
        </Button>
      </div>
      {selectedPlugin.value && currentPlugin && (
        <>
          <ParameterInput
            path={UUIDComponent.get(entity)}
            values={currentPlugin}
            onChange={(key) => commitProperty(MaterialPluginComponents[selectedPlugin.value], key)}
            defaults={generateDefaults(currentPlugin)}
          />
          <Button
            variant="tertiary"
            size="sm"
            onClick={() => {
              removeComponent(entity, MaterialPluginComponents[selectedPlugin.value])
              AuthoringState.snapshotEntities([entity])
            }}
          >
            Remove Plugin
          </Button>
        </>
      )}
    </div>
  )
}

export const MaterialPropertyTitle = () => {
  const { t } = useTranslation()

  return (
    <div className="flex flex-col gap-2">
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
