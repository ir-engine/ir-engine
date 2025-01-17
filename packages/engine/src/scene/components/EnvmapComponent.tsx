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

import { useEffect } from 'react'
import {
  Color,
  CubeReflectionMapping,
  CubeTexture,
  DataTexture,
  EquirectangularReflectionMapping,
  Material,
  Mesh,
  MeshStandardMaterial,
  RGBAFormat,
  SRGBColorSpace,
  Uniform,
  Vector3
} from 'three'

import { EntityUUID, UUIDComponent, entityExists, useEntityContext, useQuery } from '@ir-engine/ecs'
import {
  defineComponent,
  getComponent,
  getMutableComponent,
  setComponent,
  useComponent
} from '@ir-engine/ecs/src/ComponentFunctions'
import { Entity } from '@ir-engine/ecs/src/Entity'
import { State } from '@ir-engine/hyperflux'

import { S } from '@ir-engine/ecs/src/schemas/JSONSchemas'
import { MaterialStateComponent } from '@ir-engine/spatial/src/renderer/materials/MaterialComponent'
import { setPlugin } from '@ir-engine/spatial/src/renderer/materials/materialFunctions'
import { T } from '@ir-engine/spatial/src/schema/schemaFunctions'
import { useTexture } from '../../assets/functions/resourceLoaderHooks'
import {
  envmapParsReplaceLambert,
  envmapPhysicalParsReplace,
  envmapReplaceLambert,
  worldposReplace
} from '../classes/BPCEMShader'
import { EnvMapSourceType } from '../constants/EnvMapEnum'
import { getRGBArray, loadCubeMapTexture } from '../constants/Util'
import { addError, removeError } from '../functions/ErrorFunctions'
import { createReflectionProbeRenderTarget } from '../functions/reflectionProbeFunctions'
import { EnvMapBakeComponent } from './EnvMapBakeComponent'
import { ReflectionProbeComponent } from './ReflectionProbeComponent'

const tempColor = new Color()

const EnvmapCubemapReactor = () => {
  const entity = useEntityContext()
  const component = useComponent(entity, EnvmapComponent)
  const materialComponent = useComponent(entity, MaterialStateComponent)

  useEffect(() => {
    return () => {
      if (entityExists(entity)) (materialComponent.material as State<MeshStandardMaterial>).envMap.set(null)
    }
  }, [])

  useEffect(() => {
    loadCubeMapTexture(
      component.envMapCubemapURL.value,
      (texture: CubeTexture | undefined) => {
        if (texture) {
          texture.mapping = CubeReflectionMapping
          texture.colorSpace = SRGBColorSpace
          ;(materialComponent.material as State<MeshStandardMaterial>).envMap.set(texture)
          removeError(entity, EnvmapComponent, 'MISSING_FILE')
        }
      },
      undefined,
      (_) => {
        ;(materialComponent.material as State<MeshStandardMaterial>).envMap.set(null)
        addError(entity, EnvmapComponent, 'MISSING_FILE', 'Skybox texture could not be found!')
      }
    )
  }, [component.envMapCubemapURL])

  return null
}

const EnvmapEquirectangularReactor = () => {
  const entity = useEntityContext()
  const component = useComponent(entity, EnvmapComponent)
  const materialComponent = useComponent(entity, MaterialStateComponent)
  const [envMapTexture, error] = useTexture(component.envMapSourceURL.value, entity)

  useEffect(() => {
    return () => {
      if (entityExists(entity)) (materialComponent.material as State<MeshStandardMaterial>).envMap.set(null)
    }
  }, [])

  useEffect(() => {
    if (!envMapTexture || !envMapTexture.isTexture) return
    envMapTexture.mapping = EquirectangularReflectionMapping
    ;(materialComponent.material as State<MeshStandardMaterial>).envMap.set(envMapTexture)
  }, [envMapTexture])

  useEffect(() => {
    if (!error) return
    ;(materialComponent.material as State<MeshStandardMaterial>).envMap.set(null)
    addError(entity, EnvmapComponent, 'MISSING_FILE', 'Skybox texture could not be found!')
  }, [error])

  return null
}

const EnvmapColorReactor = () => {
  const entity = useEntityContext()
  const component = useComponent(entity, EnvmapComponent)
  const materialComponent = useComponent(entity, MaterialStateComponent)

  useEffect(() => {
    return () => {
      if (entityExists(entity)) (materialComponent.material as State<MeshStandardMaterial>).envMap.set(null)
    }
  }, [])

  useEffect(() => {
    const color = component.envMapSourceColor.value ?? tempColor
    const resolution = 64 // Min value required
    /** @todo track in resource manager */
    const texture = new DataTexture(getRGBArray(new Color(color)), resolution, resolution, RGBAFormat)
    texture.needsUpdate = true
    texture.colorSpace = SRGBColorSpace
    texture.mapping = EquirectangularReflectionMapping
    ;(materialComponent.material as State<MeshStandardMaterial>).envMap.set(texture)
    return () => {
      texture.dispose()
    }
  }, [component.envMapSourceColor])

  return null
}

const EnvmapProbesReactor = () => {
  const entity = useEntityContext()
  const materialComponent = useComponent(entity, MaterialStateComponent)

  const probeQuery = useQuery([ReflectionProbeComponent])

  useEffect(() => {
    return () => {
      const component = getMutableComponent(entity, EnvmapComponent)
      if (entityExists(entity)) (materialComponent.material as State<MeshStandardMaterial>).envMap.set(null)
    }
  }, [])

  useEffect(() => {
    const [renderTexture, unload] = createReflectionProbeRenderTarget(entity, probeQuery)
    ;(materialComponent.material as State<MeshStandardMaterial>).envMap.set(renderTexture)
    return () => {
      unload()
    }
  }, [probeQuery])

  return null
}

export const EnvmapComponent = defineComponent({
  name: 'EnvmapComponent',
  // jsonID: 'EE_envmap',

  schema: S.Object({
    type: S.LiteralUnion(Object.values(EnvMapSourceType), EnvMapSourceType.Skybox),
    envMapSourceColor: T.Color(0xfff),
    envMapSourceURL: S.String(''),
    envMapCubemapURL: S.String(''),
    envMapSourceEntityUUID: S.EntityUUID(),
    envMapIntensity: S.Number(1)
  }),

  // reactor: function () {
  //   if (!isClient) return null
  //   const entity = useEntityContext()
  //   const component = useComponent(entity, EnvmapComponent)

  //   const bakeEntity = UUIDComponent.useEntityByUUID(component.envMapSourceEntityUUID.value)

  //   switch (component.type.value) {
  //     case 'Bake': {
  //       if (bakeEntity) {
  //         return <EnvBakeComponentReactor key={bakeEntity} envmapEntity={entity} bakeEntity={bakeEntity} />
  //       }
  //       break
  //     }
  //     case 'Cubemap':
  //       return <EnvmapCubemapReactor key={'EnvmapCubemapReactor'} />
  //     case 'Equirectangular':
  //       return <EnvmapEquirectangularReactor key={'EnvmapEquirectangularReactor'} />
  //     case 'Color':
  //       return <EnvmapColorReactor key={'EnvmapColorReactor'} />
  //     case 'Probes':
  //       return <EnvmapProbesReactor key={'EnvmapProbesReactor'} />
  //     case 'Skybox':
  //     /** Setting the value from the skybox can be found in EnvironmentSystem */
  //     default:
  //       break
  //   }
  //   return null
  // },

  errors: ['MISSING_FILE']
})

const EnvBakeComponentReactor = (props: { envmapEntity: Entity; bakeEntity: Entity }) => {
  const { envmapEntity, bakeEntity } = props
  const bakeComponent = useComponent(bakeEntity, EnvMapBakeComponent)

  const [envMaptexture, error] = useTexture(bakeComponent.envMapOrigin.value, envmapEntity)

  useEffect(() => {
    const texture = envMaptexture
    if (!texture) return
    texture.mapping = EquirectangularReflectionMapping
    ;(getMutableComponent(envmapEntity, MaterialStateComponent).material as State<MeshStandardMaterial>).envMap.set(
      texture
    )
    if (bakeComponent.boxProjection.value) {
      //set the box projection plugin
    }
  }, [envMaptexture])

  useEffect(() => {
    if (!error) return
    addError(envmapEntity, EnvmapComponent, 'MISSING_FILE', 'Skybox texture could not be found!')
  }, [error])

  return null
}

export const BoxProjectionPlugin = defineComponent({
  name: 'BoxProjectionPlugin',

  schema: S.Object({
    cubeMapSize: S.Class(() => new Uniform(new Vector3())),
    cubeMapPos: S.Class(() => new Uniform(new Vector3()))
  }),

  reactor: () => {
    const entity = useEntityContext()

    useEffect(() => {
      const materialComponent = getComponent(entity, MaterialStateComponent)

      const callback = (shader, renderer) => {
        const plugin = getComponent(entity, BoxProjectionPlugin)

        shader.uniforms.cubeMapSize = plugin.cubeMapSize
        shader.uniforms.cubeMapPos = plugin.cubeMapPos

        const shaderType = (shader as any).shaderType
        const isPhysical = shaderType === 'MeshStandardMaterial' || shaderType === 'MeshPhysicalMaterial'
        const isSupported = isPhysical || shaderType === 'MeshLambertMaterial' || shaderType === 'MeshPhongMaterial'
        if (!isSupported) return

        if (isPhysical) {
          if (!shader.vertexShader.startsWith('varying vec3 vWorldPosition'))
            shader.vertexShader = 'varying vec3 vWorldPosition;\n' + shader.vertexShader
          shader.vertexShader = shader.vertexShader.replace('#include <worldpos_vertex>', worldposReplace)
          shader.fragmentShader = shader.fragmentShader.replace(
            '#include <envmap_physical_pars_fragment>',
            envmapPhysicalParsReplace
          )
        } else {
          shader.fragmentShader = shader.fragmentShader.replace(
            '#include <envmap_pars_fragment>',
            envmapParsReplaceLambert
          )
          shader.fragmentShader = shader.fragmentShader.replace('#include <envmap_fragment>', envmapReplaceLambert)
        }
      }

      setPlugin(materialComponent.material as Material, callback)
    })
  }
})

const applyBoxProjection = (entity: Entity, child: Mesh<any, MeshStandardMaterial>) => {
  const bakeComponent = getComponent(entity, EnvMapBakeComponent)
  if (!child.material || child.type == 'VFXBatch') return

  const materials = Array.isArray(child.material) ? child.material : [child.material]

  materials.forEach((material) => {
    setComponent(UUIDComponent.getEntityByUUID(material.uuid as EntityUUID), BoxProjectionPlugin, {
      cubeMapPos: new Uniform(bakeComponent.bakePositionOffset),
      cubeMapSize: new Uniform(bakeComponent.bakeScale)
    })
  })
}
