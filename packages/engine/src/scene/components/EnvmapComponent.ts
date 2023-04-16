import { useEffect } from 'react'
import {
  Color,
  CubeTexture,
  DataTexture,
  EquirectangularRefractionMapping,
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
import { isClient } from '../../common/functions/isClient'
import { SceneState } from '../../ecs/classes/Scene'
import {
  defineComponent,
  getOptionalComponent,
  removeComponent,
  useComponent,
  useOptionalComponent
} from '../../ecs/functions/ComponentFunctions'
import { isMobileXRHeadset } from '../../xr/XRState'
import { EnvMapSourceType, EnvMapTextureType } from '../constants/EnvMapEnum'
import { getPmremGenerator, loadCubeMapTexture } from '../constants/Util'
import { addError, removeError } from '../functions/ErrorFunctions'
import { EnvMapBakeTypes } from '../types/EnvMapBakeTypes'
import { EnvMapBakeComponent } from './EnvMapBakeComponent'
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
    if (entity === getState(SceneState).sceneEntity) removeComponent(entity, EnvmapComponent)
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
      envMapSourceColor: component.envMapSourceColor.value.getHex(),
      envMapSourceURL: component.envMapSourceURL.value,
      envMapIntensity: component.envMapIntensity.value
    }
  },

  reactor: function ({ root }) {
    const entity = root.entity
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
    }, [component.type, group?.length])

    useEffect(() => {
      if (!group?.value?.length) return
      if (component.type.value !== EnvMapSourceType.Default) return

      const options = getOptionalComponent(entity, EnvMapBakeComponent)
      if (options)
        switch (options.bakeType) {
          case EnvMapBakeTypes.Baked:
            AssetLoader.loadAsync(options.envMapOrigin, {}).then((texture: Texture) => {
              texture.mapping = EquirectangularRefractionMapping
              applyEnvMap(group.value, texture)
            })
            break
          case EnvMapBakeTypes.Realtime:
            // const map = new CubemapCapturer(EngineRenderer.instance.renderer, Engine.scene, options.resolution)
            // const EnvMap = (await map.update(options.bakePosition)).cubeRenderTarget.texture
            // applyEnvMap(obj3d, EnvMap)
            break
        }
      applyEnvMap(group.value, null)
    }, [component.type, group?.length])

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
      if (isMobileXRHeadset) return
      obj.traverse((child: Mesh<any, MeshStandardMaterial>) => {
        if (child.material instanceof MeshMatcapMaterial) return
        if (child.material) child.material.envMap = envmap
      })

      if ((obj as Mesh<any, MeshStandardMaterial>).material) {
        if ((obj as Mesh).material instanceof MeshMatcapMaterial) return
        ;(obj as Mesh<any, MeshStandardMaterial>).material.envMap = envmap
      }
    }
  }
}
