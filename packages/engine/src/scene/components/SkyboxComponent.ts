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

import { useEffect } from 'react'
import {
  Color,
  CubeReflectionMapping,
  CubeTexture,
  DataTexture,
  EquirectangularReflectionMapping,
  LinearFilter,
  RGBAFormat,
  SRGBColorSpace
} from 'three'

import { Engine, entityExists, useEntityContext } from '@ir-engine/ecs'
import {
  defineComponent,
  getComponent,
  hasComponent,
  removeComponent,
  setComponent,
  useComponent
} from '@ir-engine/ecs/src/ComponentFunctions'
import { useHookstate, useImmediateEffect } from '@ir-engine/hyperflux'
import { RendererComponent } from '@ir-engine/spatial/src/renderer/components/RendererComponent'
import { BackgroundComponent } from '@ir-engine/spatial/src/renderer/components/SceneComponents'

import { S } from '@ir-engine/ecs/src/schemas/JSONSchemas'
import { iOS } from '@ir-engine/spatial/src/common/functions/isMobile'
import { T } from '@ir-engine/spatial/src/schema/schemaFunctions'
import { useTexture } from '../../assets/functions/resourceLoaderHooks'
import { Sky } from '../classes/Sky'
import { SkyTypeEnum } from '../constants/SkyTypeEnum'
import { getRGBArray, loadCubeMapTexture } from '../constants/Util'
import { addError, removeError } from '../functions/ErrorFunctions'

const tempColor = new Color(0.65, 0.8, 1)

export const SkyboxComponent = defineComponent({
  name: 'SkyboxComponent',
  jsonID: 'EE_skybox',

  schema: S.Object({
    backgroundColor: T.Color(0x000000),
    equirectangularPath: S.String({ default: '' }),
    cubemapPath: S.String({ default: '' }),
    backgroundType: S.Number({ default: 1 }),
    sky: S.Type<Sky | null>({ serialized: false }),
    skyboxProps: S.Object({
      turbidity: S.Number({ default: 10 }),
      rayleigh: S.Number({ default: 1 }),
      luminance: S.Number({ default: 1 }),
      mieCoefficient: S.Number({ default: 0.004999999999999893 }),
      mieDirectionalG: S.Number({ default: 0.99 }),
      inclination: S.Number({ default: 0.10471975511965978 }),
      azimuth: S.Number({ default: 0.16666666666666666 })
    })
  }),

  reactor: function () {
    const entity = useEntityContext()
    // if (!isClient) return null

    const skyboxState = useComponent(entity, SkyboxComponent)
    const cubemapTexture = useHookstate<undefined | CubeTexture>(undefined)
    const [texture, error] = useTexture(
      skyboxState.backgroundType.value === SkyTypeEnum.equirectangular && !iOS
        ? skyboxState.equirectangularPath.value
        : '',
      entity
    )

    useImmediateEffect(() => {
      return () => {
        if (entityExists(entity) && hasComponent(entity, BackgroundComponent))
          removeComponent(entity, BackgroundComponent)
      }
    }, [])

    const forceColorFallback = useHookstate(false)
    useEffect(() => {
      // temporary logic to force solid color on iOS. We use a separate variable to keep track of this
      // so we can fall back to a sensical default value (in spite of bad serialized color data)
      // in the event the user did not set up a color themselves
      /**@todo implement smart asset LOD system to load lower resolution skybox textures on iOS */
      if (iOS) forceColorFallback.set(true)
    }, [])

    useEffect(() => {
      if (!texture) return
      return () => {
        texture.dispose()
      }
    }, [texture])

    useEffect(() => {
      if (skyboxState.backgroundType.value !== SkyTypeEnum.equirectangular || !texture) return

      texture.colorSpace = SRGBColorSpace
      texture.mapping = EquirectangularReflectionMapping
      texture.minFilter = LinearFilter
      texture.generateMipmaps = false
      setComponent(entity, BackgroundComponent, texture)
    }, [texture, skyboxState.backgroundType])

    useEffect(() => {
      if (!error) return
      addError(entity, SkyboxComponent, 'FILE_ERROR', error.message)
      return () => {
        removeError(entity, SkyboxComponent, 'FILE_ERROR')
      }
    }, [error])

    useEffect(() => {
      if (skyboxState.backgroundType.value !== SkyTypeEnum.color && !forceColorFallback.value) return

      const col =
        forceColorFallback.value && skyboxState.backgroundType.value !== SkyTypeEnum.color
          ? tempColor
          : skyboxState.backgroundColor.value
      const resolution = 64 // Min value required
      /** @todo track this in resource manager */
      const colorTexture = new DataTexture(getRGBArray(new Color(col)), resolution, resolution, RGBAFormat)
      // ResourceState.addResource(texture, texture.uuid, entity)
      colorTexture.needsUpdate = true
      colorTexture.colorSpace = SRGBColorSpace
      colorTexture.mapping = EquirectangularReflectionMapping
      colorTexture.generateMipmaps = false
      setComponent(entity, BackgroundComponent, colorTexture)

      return () => {
        // ResourceState.unload(texture.uuid, entity)
        colorTexture.dispose()
        removeComponent(entity, BackgroundComponent)
      }
    }, [skyboxState.backgroundType, skyboxState.backgroundColor, forceColorFallback])

    useEffect(() => {
      if (skyboxState.backgroundType.value !== SkyTypeEnum.cubemap) return
      const onLoad = (cubeTexture: CubeTexture) => {
        cubeTexture.colorSpace = SRGBColorSpace
        cubeTexture.mapping = CubeReflectionMapping
        cubeTexture.generateMipmaps = false
        cubemapTexture.set(cubeTexture)
        setComponent(entity, BackgroundComponent, cubeTexture)
        removeError(entity, SkyboxComponent, 'FILE_ERROR')
      }
      const loadArgs: [
        string,
        (texture: CubeTexture) => void,
        ((event: ProgressEvent<EventTarget>) => void) | undefined,
        ((event: ErrorEvent) => void) | undefined
      ] = [
        skyboxState.cubemapPath.value,
        onLoad,
        undefined,
        (error) => addError(entity, SkyboxComponent, 'FILE_ERROR', error.message)
      ]
      /** @todo replace this with useCubemap */
      loadCubeMapTexture(...loadArgs)
      return () => {
        removeComponent(entity, BackgroundComponent)
      }
    }, [skyboxState.backgroundType, skyboxState.cubemapPath])

    useEffect(() => {
      const cubemap = cubemapTexture.value
      if (!cubemap) return

      return () => {
        cubemap.dispose()
      }
    }, [cubemapTexture])

    useEffect(() => {
      if (skyboxState.backgroundType.value !== SkyTypeEnum.skybox) {
        if (skyboxState.sky.value) skyboxState.sky.set(null)
        return
      }

      skyboxState.sky.set(new Sky())

      const sky = skyboxState.sky.value! as Sky

      sky.azimuth = skyboxState.skyboxProps.value.azimuth
      sky.inclination = skyboxState.skyboxProps.value.inclination

      sky.mieCoefficient = skyboxState.skyboxProps.value.mieCoefficient
      sky.mieDirectionalG = skyboxState.skyboxProps.value.mieDirectionalG
      sky.rayleigh = skyboxState.skyboxProps.value.rayleigh
      sky.turbidity = skyboxState.skyboxProps.value.turbidity
      sky.luminance = skyboxState.skyboxProps.value.luminance

      const renderer = getComponent(Engine.instance.viewerEntity, RendererComponent)
      const generatedTexture = sky.generateSkyboxTextureCube(renderer.renderer!)
      generatedTexture.mapping = CubeReflectionMapping
      generatedTexture.generateMipmaps = false

      setComponent(entity, BackgroundComponent, generatedTexture)
      sky.dispose()
    }, [
      skyboxState.backgroundType,
      skyboxState.skyboxProps,
      skyboxState.skyboxProps.azimuth,
      skyboxState.skyboxProps.inclination,
      skyboxState.skyboxProps.mieCoefficient,
      skyboxState.skyboxProps.mieDirectionalG,
      skyboxState.skyboxProps.rayleigh,
      skyboxState.skyboxProps.turbidity,
      skyboxState.skyboxProps.luminance
    ])

    return null
  },

  errors: ['FILE_ERROR']
})
