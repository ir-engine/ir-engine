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

import { useEffect, useState } from 'react'
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
  sRGBEncoding,
  Texture,
  Vector3
} from 'three'

import { getMutableState, getState, useHookstate } from '@etherealengine/hyperflux'

import { AssetLoader } from '../../assets/classes/AssetLoader'
import { isClient } from '../../common/functions/getEnvironment'
import { EngineState } from '../../ecs/classes/EngineState'
import { Entity } from '../../ecs/classes/Entity'
import { SceneState } from '../../ecs/classes/Scene'
import {
  defineComponent,
  defineQuery,
  getComponent,
  setComponent,
  useComponent,
  useOptionalComponent
} from '../../ecs/functions/ComponentFunctions'
import { useEntityContext } from '../../ecs/functions/EntityFunctions'
import { RendererState } from '../../renderer/RendererState'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { EnvMapSourceType, EnvMapTextureType } from '../constants/EnvMapEnum'
import { getPmremGenerator, getRGBArray, loadCubeMapTexture } from '../constants/Util'
import { addError, removeError } from '../functions/ErrorFunctions'
import { applyBoxProjection, EnvMapBakeComponent, isInsideBox } from './EnvMapBakeComponent'
import { GroupComponent } from './GroupComponent'

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
      envMapIntensity: 1
    }
  },

  onSet: (entity, component, json) => {
    if (typeof json?.type === 'string') component.type.set(json.type)
    if (typeof json?.envMapTextureType === 'string') component.envMapTextureType.set(json.envMapTextureType)
    if (typeof json?.envMapSourceColor === 'number') component.envMapSourceColor.set(new Color(json.envMapSourceColor))
    if (typeof json?.envMapSourceURL === 'string') component.envMapSourceURL.set(json.envMapSourceURL)
    if (typeof json?.envMapIntensity === 'number') component.envMapIntensity.set(json.envMapIntensity)
  },

  toJSON: (entity, component) => {
    return {
      type: component.type.value,
      envMapTextureType: component.envMapTextureType.value,
      envMapSourceColor: component.envMapSourceColor.value,
      envMapSourceURL: component.envMapSourceURL.value,
      envMapIntensity: component.envMapIntensity.value
    }
  },

  reactor: function () {
    const entity = useEntityContext()
    if (!isClient) return null

    const component = useComponent(entity, EnvmapComponent)
    const group = useOptionalComponent(entity, GroupComponent)
    const background = useHookstate(getMutableState(SceneState).background)

    const updateGroup = () => {
      if (group?.value)
        for (const obj of group.value)
          obj.traverse((obj: Mesh) => {
            if (!obj.material) return

            if (Array.isArray(obj.material)) {
              obj.material.forEach((m: MeshStandardMaterial) => (m.envMapIntensity = component.envMapIntensity.value))
            } else {
              ;(obj.material as MeshStandardMaterial).envMapIntensity = component.envMapIntensity.value
            }
          })
    }

    useEffect(() => {
      if (!group?.value?.length) return
      if (component.type.value !== EnvMapSourceType.Skybox) return

      applyEnvMap(group.value, background.value as Texture | null)
      updateGroup()
    }, [component.type, group?.length, background])

    useEffect(() => {
      if (!group?.value?.length) return
      if (component.type.value !== EnvMapSourceType.Color) return

      const col = component.envMapSourceColor.value ?? tempColor
      const resolution = 64 // Min value required
      const texture = new DataTexture(getRGBArray(col), resolution, resolution, RGBAFormat)
      texture.needsUpdate = true
      texture.encoding = sRGBEncoding

      applyEnvMap(group.value, getPmremGenerator().fromEquirectangular(texture).texture)
    }, [component.type, group?.length])

    useEffect(() => {
      if (!group?.value?.length) return
      if (component.type.value !== EnvMapSourceType.Texture) return

      switch (component.envMapTextureType.value) {
        case EnvMapTextureType.Cubemap:
          loadCubeMapTexture(
            component.envMapSourceURL.value,
            (texture: CubeTexture | undefined) => {
              if (texture) {
                const EnvMap = getPmremGenerator().fromCubemap(texture).texture
                EnvMap.encoding = sRGBEncoding
                if (group?.value) applyEnvMap(group.value, texture)
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
              applyEnvMap(group.value, texture)
              removeError(entity, EnvmapComponent, 'MISSING_FILE')
              texture.dispose()
            } else {
              addError(entity, EnvmapComponent, 'MISSING_FILE', 'Skybox texture could not be found!')
            }
          })
      }
    }, [component.type, group?.length, component.envMapSourceURL])
    const engineState = useHookstate(getMutableState(EngineState))
    const renderState = useHookstate(getMutableState(RendererState))
    const relativePos = new Vector3()
    useEffect(() => {
      if (!group?.value?.length || !engineState.sceneLoaded.value) return
      if (component.type.value !== EnvMapSourceType.Default) return
      const bakeComponentQuery = defineQuery([EnvMapBakeComponent])
      for (const bakeEntity of bakeComponentQuery()) {
        const bakeComponent = getComponent(bakeEntity, EnvMapBakeComponent)
        const transformComponent = getComponent(entity, TransformComponent)
        relativePos.subVectors(transformComponent.position, getComponent(bakeEntity, TransformComponent).position)
        if (!isInsideBox(bakeComponent.bakeScale, relativePos) || !bakeComponent.boxProjection) continue
        setComponent(entity, EnvmapComponent, { envMapSourceURL: bakeComponent.envMapOrigin })

        AssetLoader.loadAsync(component.envMapSourceURL.value, {}).then((texture) => {
          if (texture) {
            texture.mapping = EquirectangularReflectionMapping
            applyEnvMap(group.value, texture)
            applyBoxProjection(bakeEntity, group.value)
            removeError(entity, EnvmapComponent, 'MISSING_FILE')
            texture.dispose()
          } else {
            addError(entity, EnvmapComponent, 'MISSING_FILE', 'Skybox texture could not be found!')
          }
        })
      }
    }, [group?.length, component.type, engineState.sceneLoaded, renderState.forceBasicMaterials])

    return null
  },

  errors: ['MISSING_FILE']
})

function applyEnvMap(obj3ds: Object3D[], envmap: Texture | null) {
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
