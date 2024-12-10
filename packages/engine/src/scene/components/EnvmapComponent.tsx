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

import React, { useEffect } from 'react'
import {
  Color,
  CubeReflectionMapping,
  CubeTexture,
  DataTexture,
  EquirectangularReflectionMapping,
  Material,
  Mesh,
  MeshMatcapMaterial,
  MeshStandardMaterial,
  RGBAFormat,
  SRGBColorSpace,
  Texture,
  Uniform,
  Vector3
} from 'three'

import { EntityUUID, UUIDComponent, useQuery } from '@ir-engine/ecs'
import {
  defineComponent,
  getComponent,
  getMutableComponent,
  setComponent,
  useComponent,
  useOptionalComponent
} from '@ir-engine/ecs/src/ComponentFunctions'
import { Entity } from '@ir-engine/ecs/src/Entity'
import { entityExists, useEntityContext } from '@ir-engine/ecs/src/EntityFunctions'
import { isClient } from '@ir-engine/hyperflux'
import { MeshComponent } from '@ir-engine/spatial/src/renderer/components/MeshComponent'
import { useResource } from '@ir-engine/spatial/src/resources/resourceHooks'

import { S } from '@ir-engine/ecs/src/schemas/JSONSchemas'
import { VisibleComponent } from '@ir-engine/spatial/src/renderer/components/VisibleComponent'
import { MaterialStateComponent } from '@ir-engine/spatial/src/renderer/materials/MaterialComponent'
import { setPlugin } from '@ir-engine/spatial/src/renderer/materials/materialFunctions'
import { T } from '@ir-engine/spatial/src/schema/schemaFunctions'
import { useChildrenWithComponents } from '@ir-engine/spatial/src/transform/components/EntityTree'
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
import { SourceComponent } from './SourceComponent'

const tempColor = new Color()

const EnvmapCubemapReactor = () => {
  const entity = useEntityContext()
  const component = useComponent(entity, EnvmapComponent)

  useEffect(() => {
    return () => {
      if (entityExists(entity)) component.envmap.set(null)
    }
  }, [])

  useEffect(() => {
    loadCubeMapTexture(
      component.envMapCubemapURL.value,
      (texture: CubeTexture | undefined) => {
        if (texture) {
          texture.mapping = CubeReflectionMapping
          texture.colorSpace = SRGBColorSpace
          component.envmap.set(texture)
          removeError(entity, EnvmapComponent, 'MISSING_FILE')
        }
      },
      undefined,
      (_) => {
        component.envmap.set(null)
        addError(entity, EnvmapComponent, 'MISSING_FILE', 'Skybox texture could not be found!')
      }
    )
  }, [component.envMapCubemapURL])

  return null
}

const EnvmapEquirectangularReactor = () => {
  const entity = useEntityContext()
  const component = useComponent(entity, EnvmapComponent)
  const [envMapTexture, error] = useTexture(component.envMapSourceURL.value, entity)

  useEffect(() => {
    return () => {
      if (entityExists(entity)) component.envmap.set(null)
    }
  }, [])

  useEffect(() => {
    if (!envMapTexture || !envMapTexture.isTexture) return
    envMapTexture.mapping = EquirectangularReflectionMapping
    component.envmap.set(envMapTexture)
  }, [envMapTexture])

  useEffect(() => {
    if (!error) return
    component.envmap.set(null)
    addError(entity, EnvmapComponent, 'MISSING_FILE', 'Skybox texture could not be found!')
  }, [error])

  return null
}

const EnvmapColorReactor = () => {
  const entity = useEntityContext()
  const component = useComponent(entity, EnvmapComponent)
  const [textureState] = useResource(() => null! as DataTexture, entity)

  useEffect(() => {
    return () => {
      if (entityExists(entity)) component.envmap.set(null)
    }
  }, [])

  useEffect(() => {
    const color = component.envMapSourceColor.value ?? tempColor
    const resolution = 64 // Min value required
    const texture = new DataTexture(getRGBArray(new Color(color)), resolution, resolution, RGBAFormat)
    texture.needsUpdate = true
    texture.colorSpace = SRGBColorSpace
    texture.mapping = EquirectangularReflectionMapping
    textureState.set(texture)
    component.envmap.set(texture)
  }, [component.envMapSourceColor])

  return null
}

const EnvmapProbesReactor = () => {
  const entity = useEntityContext()
  const component = useComponent(entity, EnvmapComponent)
  const probeQuery = useQuery([ReflectionProbeComponent])

  useEffect(() => {
    return () => {
      if (entityExists(entity)) component.envmap.set(null)
    }
  }, [])

  useEffect(() => {
    const [renderTexture, unload] = createReflectionProbeRenderTarget(entity, probeQuery)
    component.envmap.set(renderTexture)
    return () => {
      unload()
    }
  }, [probeQuery])

  return null
}

export const EnvmapComponent = defineComponent({
  name: 'EnvmapComponent',
  jsonID: 'EE_envmap',

  schema: S.Object({
    type: S.LiteralUnion(Object.values(EnvMapSourceType), EnvMapSourceType.Skybox),
    envMapSourceColor: T.Color(0xfff),
    envMapSourceURL: S.String(''),
    envMapCubemapURL: S.String(''),
    envMapSourceEntityUUID: S.EntityUUID(),
    envMapIntensity: S.Number(1),

    // internal
    envmap: S.NonSerialized(S.Nullable(S.Type<Texture>()))
  }),

  reactor: function () {
    if (!isClient) return null
    const entity = useEntityContext()
    const component = useComponent(entity, EnvmapComponent)

    const hasRootMesh = !!useOptionalComponent(entity, MeshComponent)
    const childrenMesh = useChildrenWithComponents(
      entity,
      [MeshComponent, VisibleComponent, SourceComponent],
      [EnvmapComponent]
    )
    const bakeEntity = UUIDComponent.useEntityByUUID(component.envMapSourceEntityUUID.value)

    const getMeshes = () => {
      const meshEntities = [...childrenMesh]
      if (hasRootMesh) meshEntities.push(entity)

      return meshEntities.map((meshEntity) => getComponent(meshEntity, MeshComponent))
    }

    useEffect(() => {
      const meshes = getMeshes()

      if (!component.envmap.value) {
        for (const mesh of meshes) {
          updateEnvMap(mesh, null)
        }
      } else {
        for (const mesh of meshes) {
          updateEnvMap(mesh, component.envmap.value as Texture)
        }
      }
    }, [childrenMesh, component.envmap, hasRootMesh])

    useEffect(() => {
      const meshes = getMeshes()

      for (const mesh of meshes) {
        updateEnvMapIntensity(mesh, component.envMapIntensity.value)
      }
    }, [childrenMesh, component.envMapIntensity, component.envmap, hasRootMesh])

    const getEnvmapChildReactor = () => {
      switch (component.type.value) {
        case 'Bake': {
          if (bakeEntity) {
            return (
              <EnvBakeComponentReactor
                key={bakeEntity}
                envmapEntity={entity}
                bakeEntity={bakeEntity}
                childrenMesh={childrenMesh}
              />
            )
          }
          break
        }
        case 'Cubemap':
          return <EnvmapCubemapReactor />
        case 'Equirectangular':
          return <EnvmapEquirectangularReactor />
        case 'Color':
          return <EnvmapColorReactor />
        case 'Probes':
          return <EnvmapProbesReactor />
        case 'Skybox':
        /** Setting the value from the skybox can be found in EnvironmentSystem */
        default:
          break
      }

      return null
    }

    return <>{getEnvmapChildReactor()}</>
  },

  errors: ['MISSING_FILE']
})

const EnvBakeComponentReactor = (props: { envmapEntity: Entity; bakeEntity: Entity; childrenMesh: Entity[] }) => {
  const { envmapEntity, bakeEntity } = props
  const bakeComponent = useComponent(bakeEntity, EnvMapBakeComponent)

  const [envMaptexture, error] = useTexture(bakeComponent.envMapOrigin.value, envmapEntity)

  useEffect(() => {
    const texture = envMaptexture
    if (!texture) return
    texture.mapping = EquirectangularReflectionMapping
    getMutableComponent(envmapEntity, EnvmapComponent).envmap.set(texture)
    if (bakeComponent.boxProjection.value) {
      for (const childEntity of props.childrenMesh) {
        const childMesh = getComponent(childEntity, MeshComponent) as Mesh<any, MeshStandardMaterial>
        applyBoxProjection(bakeEntity, childMesh)
      }
    }
  }, [envMaptexture])

  useEffect(() => {
    if (!error) return
    addError(envmapEntity, EnvmapComponent, 'MISSING_FILE', 'Skybox texture could not be found!')
  }, [error])

  return null
}

export function updateEnvMap(obj: Mesh<any, any> | null, envmap: Texture | null) {
  if (!obj) return
  if (!obj.material) return
  if (Array.isArray(obj.material)) {
    obj.material.forEach((mat: MeshStandardMaterial) => {
      if (mat instanceof MeshMatcapMaterial) return
      mat.envMap = envmap
      mat.needsUpdate = true
    })
  } else {
    if (obj.material instanceof MeshMatcapMaterial) return
    const material = obj.material as MeshStandardMaterial
    material.envMap = envmap
    material.needsUpdate = true
  }
}

export const updateEnvMapIntensity = (obj: Mesh<any, any> | null, intensity: number) => {
  if (!obj) return
  if (!obj.material) return
  if (Array.isArray(obj.material)) {
    obj.material.forEach((m: MeshStandardMaterial) => {
      m.envMapIntensity = intensity
      m.needsUpdate = true
    })
  } else {
    ;(obj.material as MeshStandardMaterial).envMapIntensity = intensity
    ;(obj.material as MeshStandardMaterial).needsUpdate = true
  }
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
