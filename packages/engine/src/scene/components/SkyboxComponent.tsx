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

import { useEffect, useLayoutEffect } from 'react'
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

import { Engine, Entity, entityExists, useEntityContext } from '@ir-engine/ecs'
import {
  defineComponent,
  getComponent,
  hasComponent,
  removeComponent,
  setComponent,
  useComponent
} from '@ir-engine/ecs/src/ComponentFunctions'
import { RendererComponent } from '@ir-engine/spatial/src/renderer/components/RendererComponent'
import { BackgroundComponent } from '@ir-engine/spatial/src/renderer/components/SceneComponents'

import { S } from '@ir-engine/ecs/src/schemas/JSONSchemas'
import { T } from '@ir-engine/spatial/src/schema/schemaFunctions'
import React from 'react'
import { useTexture } from '../../assets/functions/resourceLoaderHooks'
import { Sky } from '../classes/Sky'
import { SkyTypeEnum } from '../constants/SkyTypeEnum'
import { getRGBArray, loadCubeMapTexture } from '../constants/Util'
import { addError, removeError } from '../functions/ErrorFunctions'

const tempColor = new Color()

const SkyboxEquirectangular = (props: { entity: Entity }) => {
  const entity = props.entity
  const skyboxState = useComponent(entity, SkyboxComponent)
  const [texture, error] = useTexture(skyboxState.equirectangularPath.value, entity)

  useEffect(() => {
    if (!texture) return
    texture.colorSpace = SRGBColorSpace
    texture.mapping = EquirectangularReflectionMapping
    texture.minFilter = LinearFilter
    setComponent(entity, BackgroundComponent, texture)
  }, [texture])

  useEffect(() => {
    if (!error) return
    addError(entity, SkyboxComponent, 'FILE_ERROR', error.message)
    return () => {
      removeError(entity, SkyboxComponent, 'FILE_ERROR')
    }
  }, [error])

  return null
}

const SkyboxColor = (props: { entity: Entity }) => {
  const entity = props.entity
  const skyboxState = useComponent(entity, SkyboxComponent)

  useEffect(() => {
    const col = skyboxState.backgroundColor.value ?? tempColor
    const resolution = 64 // Min value required
    /** @todo track this in resource manager */
    const texture = new DataTexture(getRGBArray(new Color(col)), resolution, resolution, RGBAFormat)
    // ResourceState.addResource(texture, texture.uuid, entity)
    texture.needsUpdate = true
    texture.colorSpace = SRGBColorSpace
    texture.mapping = EquirectangularReflectionMapping
    setComponent(entity, BackgroundComponent, texture)

    return () => {
      // ResourceState.unload(texture.uuid, entity)
      texture.dispose()
      removeComponent(entity, BackgroundComponent)
    }
  }, [skyboxState.backgroundColor])

  return null
}

const SkyboxCubemap = (props: { entity: Entity }) => {
  const entity = props.entity
  const skyboxState = useComponent(entity, SkyboxComponent)

  useEffect(() => {
    let aborted = false
    let cubemap = undefined as CubeTexture | undefined

    const onLoad = (texture: CubeTexture) => {
      if (aborted) {
        texture.dispose()
        return
      }
      texture.colorSpace = SRGBColorSpace
      texture.mapping = CubeReflectionMapping
      cubemap = texture
      setComponent(entity, BackgroundComponent, texture)
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
      aborted = true
      cubemap?.dispose()
    }
  }, [skyboxState.cubemapPath])

  return null
}

const SkyboxSkybox = (props: { entity: Entity }) => {
  const entity = props.entity
  const skyboxState = useComponent(entity, SkyboxComponent)

  useEffect(() => {
    const sky = new Sky()

    const props = skyboxState.skyboxProps.value

    sky.azimuth = props.azimuth
    sky.inclination = props.inclination
    sky.mieCoefficient = props.mieCoefficient
    sky.mieDirectionalG = props.mieDirectionalG
    sky.rayleigh = props.rayleigh
    sky.turbidity = props.turbidity
    sky.luminance = props.luminance

    const renderer = getComponent(Engine.instance.viewerEntity, RendererComponent)
    const texture = sky.generateSkyboxTextureCube(renderer.renderer!)
    texture.mapping = CubeReflectionMapping
    texture.needsUpdate = true

    setComponent(entity, BackgroundComponent, texture)
    sky.dispose()

    return () => {
      texture.dispose()
    }
  }, [
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
}

export const SkyboxComponent = defineComponent({
  name: 'SkyboxComponent',
  jsonID: 'EE_skybox',

  schema: S.Object({
    backgroundColor: T.Color(0x000000),
    equirectangularPath: S.String({ default: '' }),
    cubemapPath: S.String({ default: '' }),
    backgroundType: S.Number({ default: 1 }),
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

    const getSkyboxTypeComponent = (): React.ComponentType<{ entity: Entity }> | null => {
      switch (skyboxState.backgroundType.value) {
        case SkyTypeEnum.equirectangular:
          return SkyboxEquirectangular
        case SkyTypeEnum.color:
          return SkyboxColor
        case SkyTypeEnum.cubemap:
          return SkyboxCubemap
        case SkyTypeEnum.skybox:
          return SkyboxSkybox
        default:
          return null
      }
    }

    useLayoutEffect(() => {
      return () => {
        if (entityExists(entity) && hasComponent(entity, BackgroundComponent))
          removeComponent(entity, BackgroundComponent)
      }
    }, [skyboxState.backgroundType.value])

    const SkyboxTypeComponent = getSkyboxTypeComponent()
    if (!SkyboxTypeComponent) return null
    return <SkyboxTypeComponent entity={entity} />
  },

  errors: ['FILE_ERROR']
})
