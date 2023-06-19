import { cloneDeep } from 'lodash'
import { useEffect, useState } from 'react'
import {
  Color,
  CubeReflectionMapping,
  CubeTexture,
  DataTexture,
  EquirectangularReflectionMapping,
  EquirectangularRefractionMapping,
  LinearFilter,
  Mesh,
  MeshLambertMaterial,
  MeshMatcapMaterial,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  Object3D,
  RGBAFormat,
  Scene,
  sRGBEncoding,
  Texture,
  Vector3,
  WebGLCubeRenderTarget,
  WebGLRenderTarget
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
  getMutableComponent,
  getOptionalComponent,
  removeComponent,
  setComponent,
  useComponent,
  useOptionalComponent
} from '../../ecs/functions/ComponentFunctions'
import { useEntityContext } from '../../ecs/functions/EntityFunctions'
import { RendererState } from '../../renderer/RendererState'
import { EngineRenderer } from '../../renderer/WebGLRendererSystem'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { isMobileXRHeadset } from '../../xr/XRState'
import { envmapPhysicalParsReplace, worldposReplace } from '../classes/BPCEMShader'
import { convertEquiToCubemap } from '../classes/ImageUtils'
import { EnvMapSourceType, EnvMapTextureType } from '../constants/EnvMapEnum'
import { getPmremGenerator, loadCubeMapTexture } from '../constants/Util'
import { addError, removeError } from '../functions/ErrorFunctions'
import { EnvMapBakeTypes } from '../types/EnvMapBakeTypes'
import { applyBoxProjection, EnvMapBakeComponent, isInsideBox } from './EnvMapBakeComponent'
import { GroupComponent } from './GroupComponent'
import { NameComponent } from './NameComponent'

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
      const size = resolution * resolution
      const data = new Uint8Array(4 * size)

      for (let i = 0; i < size; i++) {
        const stride = i * 4
        data[stride] = Math.floor(col.r * 255)
        data[stride + 1] = Math.floor(col.g * 255)
        data[stride + 2] = Math.floor(col.b * 255)
        data[stride + 3] = 255
      }

      const texture = new DataTexture(data, resolution, resolution, RGBAFormat)
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
                if (group?.value) applyEnvMap(group.value, EnvMap)
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
              const EnvMap = getPmremGenerator().fromEquirectangular(texture).texture
              EnvMap.encoding = sRGBEncoding
              applyEnvMap(group.value, EnvMap)

              removeError(entity, EnvmapComponent, 'MISSING_FILE')
              texture.dispose()
            } else {
              addError(entity, EnvmapComponent, 'MISSING_FILE', 'Skybox texture could not be found!')
            }
          })
      }
    }, [component.type, group?.length, component.envMapSourceURL])
    const engineState = useHookstate(getMutableState(EngineState))
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
    }, [group?.length, component.type, engineState.sceneLoaded])

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
