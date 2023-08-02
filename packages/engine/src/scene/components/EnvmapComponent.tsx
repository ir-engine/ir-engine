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

import React, { useEffect } from 'react'
import {
  Color,
  CubeTexture,
  DataTexture,
  EquirectangularReflectionMapping,
  Mesh,
  MeshMatcapMaterial,
  MeshStandardMaterial,
  Object3D,
  RGBAFormat,
  Scene,
  SRGBColorSpace,
  Texture
} from 'three'

import { EntityUUID } from '@etherealengine/common/src/interfaces/EntityUUID'
import { getMutableState, useHookstate } from '@etherealengine/hyperflux'

import { AssetLoader } from '../../assets/classes/AssetLoader'
import { isClient } from '../../common/functions/getEnvironment'
import { Entity } from '../../ecs/classes/Entity'
import { SceneState } from '../../ecs/classes/Scene'
import { defineComponent, useComponent } from '../../ecs/functions/ComponentFunctions'
import { useEntityContext } from '../../ecs/functions/EntityFunctions'
import { RendererState } from '../../renderer/RendererState'
import { EnvMapSourceType, EnvMapTextureType } from '../constants/EnvMapEnum'
import { getPmremGenerator, getRGBArray, loadCubeMapTexture } from '../constants/Util'
import { addError, removeError } from '../functions/ErrorFunctions'
import { applyBoxProjection, EnvMapBakeComponent } from './EnvMapBakeComponent'
import { GroupComponent } from './GroupComponent'
import { UUIDComponent } from './UUIDComponent'

const tempColor = new Color()

export const EnvmapComponent = defineComponent({
  name: 'EnvmapComponent',
  jsonID: 'envmap',
  onInit: (entity) => {
    return {
      type: EnvMapSourceType.None as (typeof EnvMapSourceType)[keyof typeof EnvMapSourceType],
      envMapTextureType:
        EnvMapTextureType.Equirectangular as (typeof EnvMapTextureType)[keyof typeof EnvMapTextureType],
      envMapSourceColor: new Color(0xfff) as Color,
      envMapSourceURL: '',
      envMapSourceEntityUUID: '' as EntityUUID,
      envMapIntensity: 1
    }
  },

  onSet: (entity, component, json) => {
    if (typeof json?.type === 'string') component.type.set(json.type)
    if (typeof json?.envMapTextureType === 'string') component.envMapTextureType.set(json.envMapTextureType)
    if (typeof json?.envMapSourceColor === 'number') component.envMapSourceColor.set(new Color(json.envMapSourceColor))
    if (typeof json?.envMapSourceURL === 'string') component.envMapSourceURL.set(json.envMapSourceURL)
    if (typeof json?.envMapSourceEntityUUID === 'string')
      component.envMapSourceEntityUUID.set(json.envMapSourceEntityUUID)
    if (typeof json?.envMapIntensity === 'number') component.envMapIntensity.set(json.envMapIntensity)
  },

  toJSON: (entity, component) => {
    return {
      type: component.type.value,
      envMapTextureType: component.envMapTextureType.value,
      envMapSourceColor: component.envMapSourceColor.value,
      envMapSourceURL: component.envMapSourceURL.value,
      envMapSourceEntityUUID: component.envMapSourceEntityUUID.value,
      envMapIntensity: component.envMapIntensity.value
    }
  },

  reactor: function () {
    const entity = useEntityContext()
    if (!isClient) return null

    const component = useComponent(entity, EnvmapComponent)
    const group = useComponent(entity, GroupComponent)
    const background = useHookstate(getMutableState(SceneState).background)

    useEffect(() => {
      updateEnvMapIntensity(group.value, component.envMapIntensity.value)
    }, [group, component.envMapIntensity])

    useEffect(() => {
      if (component.type.value !== EnvMapSourceType.Skybox) return
      updateEnvMap(group.value, background.value as Texture | null)
    }, [component.type, group, background])

    useEffect(() => {
      if (component.type.value !== EnvMapSourceType.Color) return

      const col = component.envMapSourceColor.value ?? tempColor
      const resolution = 64 // Min value required
      const texture = new DataTexture(getRGBArray(col), resolution, resolution, RGBAFormat)
      texture.needsUpdate = true
      texture.colorSpace = SRGBColorSpace

      updateEnvMap(group.value, getPmremGenerator().fromEquirectangular(texture).texture)
    }, [component.type, group])

    useEffect(() => {
      if (component.type.value !== EnvMapSourceType.Texture) return

      switch (component.envMapTextureType.value) {
        case EnvMapTextureType.Cubemap:
          loadCubeMapTexture(
            component.envMapSourceURL.value,
            (texture: CubeTexture | undefined) => {
              if (texture) {
                const EnvMap = getPmremGenerator().fromCubemap(texture).texture
                EnvMap.colorSpace = SRGBColorSpace
                if (group?.value) updateEnvMap(group.value, texture)
                removeError(entity, EnvmapComponent, 'MISSING_FILE')
              }
            },
            undefined,
            (_) => addError(entity, EnvmapComponent, 'MISSING_FILE', 'Skybox texture could not be found!')
          )
          break

        case EnvMapTextureType.Equirectangular:
          AssetLoader.loadAsync(component.envMapSourceURL.value, {}).then((texture) => {
            if (texture) {
              texture.mapping = EquirectangularReflectionMapping
              updateEnvMap(group.value, texture)
              removeError(entity, EnvmapComponent, 'MISSING_FILE')
              texture.dispose()
            } else {
              addError(entity, EnvmapComponent, 'MISSING_FILE', 'Skybox texture could not be found!')
            }
          })
      }
    }, [component.type, group, component.envMapSourceURL])

    const entitiesByUUIDState = useHookstate(UUIDComponent.entitiesByUUIDState)
    const bakeEntity = entitiesByUUIDState[component.envMapSourceEntityUUID.value].value

    if (component.type.value !== EnvMapSourceType.Bake) return null

    return <EnvBakeComponentReactor key={bakeEntity} envmapEntity={entity} bakeEntity={bakeEntity} />
  },

  errors: ['MISSING_FILE']
})

const EnvBakeComponentReactor = (props: { envmapEntity: Entity; bakeEntity: Entity }) => {
  const { envmapEntity, bakeEntity } = props
  const bakeComponent = useComponent(bakeEntity, EnvMapBakeComponent)
  const group = useComponent(envmapEntity, GroupComponent)
  const renderState = useHookstate(getMutableState(RendererState))

  useEffect(() => {
    AssetLoader.loadAsync(bakeComponent.envMapOrigin.value, {}).then((texture) => {
      if (texture) {
        texture.mapping = EquirectangularReflectionMapping
        updateEnvMap(group.value, texture)
        if (bakeComponent.boxProjection.value) applyBoxProjection(bakeEntity, group.value)
        removeError(envmapEntity, EnvmapComponent, 'MISSING_FILE')
        texture.dispose()
      } else {
        addError(envmapEntity, EnvmapComponent, 'MISSING_FILE', 'Skybox texture could not be found!')
      }
    })
  }, [renderState.forceBasicMaterials, bakeComponent.envMapOrigin])

  return null
}

function updateEnvMap(obj3ds: Object3D[], envmap: Texture | null) {
  if (!obj3ds?.length) return

  for (const obj of obj3ds) {
    if (obj instanceof Scene) {
      obj.environment = envmap
    } else {
      obj.traverse((child: Mesh<any, MeshStandardMaterial>) => {
        if (child.material instanceof MeshMatcapMaterial) return
        if (child.material) child.material.envMap = envmap!
      })

      if ((obj as Mesh<any, MeshStandardMaterial>).material) {
        if ((obj as Mesh).material instanceof MeshMatcapMaterial) return
        ;(obj as Mesh<any, MeshStandardMaterial>).material.envMap = envmap!
      }
    }
  }
}

const updateEnvMapIntensity = (group: typeof GroupComponent._TYPE, intensity: number) => {
  for (const obj of group)
    obj.traverse((obj: Mesh) => {
      if (!obj.material) return
      if (Array.isArray(obj.material)) {
        obj.material.forEach((m: MeshStandardMaterial) => {
          m.envMapIntensity = intensity
        })
      } else {
        ;(obj.material as MeshStandardMaterial).envMapIntensity = intensity
      }
    })
}
