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

import React, { useEffect } from 'react'

import {
  defineSystem,
  Entity,
  getOptionalMutableComponent,
  haveCommonAncestor,
  PresentationSystemGroup,
  QueryReactor,
  removeComponent,
  setComponent,
  UndefinedEntity,
  useChildrenWithComponents,
  useComponent,
  useEntityContext,
  useOptionalComponent,
  useQuery,
  UUIDComponent
} from '@ir-engine/ecs'

import { Identifiable, State } from '@ir-engine/hyperflux'
import { BackgroundComponent } from '@ir-engine/spatial/src/renderer/components/SceneComponents'
import { MaterialStateComponent } from '@ir-engine/spatial/src/renderer/materials/MaterialComponent'
import {
  Color,
  CubeReflectionMapping,
  CubeTexture,
  DataTexture,
  EquirectangularReflectionMapping,
  MeshStandardMaterial,
  RGBAFormat,
  SRGBColorSpace,
  Uniform
} from 'three'
import { useTexture } from '../../assets/functions/resourceLoaderHooks'
import { EnvMapBakeComponent } from '../components/EnvMapBakeComponent'
import { BoxProjectionPlugin, EnvMapComponent } from '../components/EnvmapComponent'
import { ReflectionProbeComponent } from '../components/ReflectionProbeComponent'
import { getRGBArray, loadCubeMapTexture } from '../constants/Util'
import { addError, removeError } from '../functions/ErrorFunctions'
import { createReflectionProbeRenderTarget } from '../functions/reflectionProbeFunctions'

const EnvMapReactor = () => {
  const entity = useEntityContext()
  const envMapComponent = useComponent(entity, EnvMapComponent).type.value
  const materialComponentEntities = useChildrenWithComponents(entity, [MaterialStateComponent])
  return (
    <>
      {materialComponentEntities.map((materialComponentEntity, index) => {
        switch (envMapComponent) {
          case 'Skybox':
            return (
              <EnvironmentSystemReactors.EnvMapSkyboxReactor
                key={envMapComponent + '-' + materialComponentEntity + '-' + index}
                entity={materialComponentEntity}
                rootEntity={entity}
              />
            )
          case 'Cubemap':
            return (
              <EnvironmentSystemReactors.EnvMapCubemapReactor
                key={envMapComponent + '-' + materialComponentEntity + '-' + index}
                entity={materialComponentEntity}
                rootEntity={entity}
              />
            )
          case 'Equirectangular':
            return (
              <EnvironmentSystemReactors.EnvMapEquirectangularReactor
                key={envMapComponent + '-' + materialComponentEntity + '-' + index}
                entity={materialComponentEntity}
                rootEntity={entity}
              />
            )
          case 'Color':
            return (
              <EnvironmentSystemReactors.EnvMapColorReactor
                key={envMapComponent + '-' + materialComponentEntity + '-' + index}
                entity={materialComponentEntity}
                rootEntity={entity}
              />
            )
          case 'Bake':
            return (
              <EnvironmentSystemReactors.EnvMapBakeReactor
                key={envMapComponent + '-' + materialComponentEntity + '-' + index}
                entity={materialComponentEntity}
                rootEntity={entity}
              />
            )
          case 'Probes':
            return (
              <EnvironmentSystemReactors.EnvmapProbesReactor
                key={envMapComponent + '-' + materialComponentEntity + '-' + index}
                entity={materialComponentEntity}
                rootEntity={entity}
              />
            )
        }
      })}
    </>
  )
}

const IntensityReactor = (props: { rootEntity: Entity; entity: Entity }) => {
  const { rootEntity, entity } = props
  const envMapComponent = useComponent(rootEntity, EnvMapComponent)
  const material = useOptionalComponent(entity, MaterialStateComponent)?.material as
    | State<MeshStandardMaterial>
    | undefined
  useEffect(() => {
    if (!material) return
    material.envMapIntensity.set(envMapComponent.envMapIntensity.value)
  }, [envMapComponent.envMapIntensity?.value, material?.uuid.value])
  return null
}

// circumvent threejs bug with envmap uniforms
const disallowedMaterials = new Set(['MeshMatcapMaterial', 'MeshToonMaterial'])

const clearMaterialEnvMap = (entity: Entity): void => {
  const materialState = getOptionalMutableComponent(entity, MaterialStateComponent)
  if (materialState === undefined) return
  const material = materialState!.material as State<MeshStandardMaterial, Identifiable>
  if (material?.envMap?.value) material.envMap.set(null)
}

const EnvMapSkyboxReactor = (props: { entity: Entity; rootEntity: Entity }) => {
  const { entity, rootEntity } = props
  const backgroundQuery = useQuery([BackgroundComponent])
  const materialComponent = useOptionalComponent(entity, MaterialStateComponent)?.material as State<
    MeshStandardMaterial,
    Identifiable
  >
  const backgroundEntity = backgroundQuery.find((curr) => haveCommonAncestor(entity, curr))
  const backgroundComponent = useOptionalComponent(backgroundEntity!, BackgroundComponent)

  useEffect(() => {
    return () => {
      EnvironmentSystemFunctions.clearMaterialEnvMap(entity)
    }
  }, [])

  useEffect(() => {
    if (!materialComponent || !backgroundComponent) return

    // threejs freaks out if matcap materials are passed in envmap related values
    if (disallowedMaterials.has(materialComponent.type.value)) return

    materialComponent.envMap.set(backgroundComponent.value as any)
  }, [backgroundComponent?.value, materialComponent?.uuid.value])

  return <EnvironmentSystemReactors.IntensityReactor entity={entity} rootEntity={rootEntity} />
}

const EnvMapCubemapReactor = (props: { entity: Entity; rootEntity: Entity }) => {
  const { entity, rootEntity } = props
  const materialComponent = useOptionalComponent(entity, MaterialStateComponent)?.material as State<
    MeshStandardMaterial,
    Identifiable
  >
  const envMapComponent = useComponent(rootEntity, EnvMapComponent)

  useEffect(() => {
    return () => {
      EnvironmentSystemFunctions.clearMaterialEnvMap(entity)
    }
  }, [])

  useEffect(() => {
    if (!materialComponent || disallowedMaterials.has(materialComponent.type.value)) return
    loadCubeMapTexture(
      envMapComponent.envMapCubemapURL.value,
      (texture: CubeTexture | undefined) => {
        if (texture) {
          texture.mapping = CubeReflectionMapping
          texture.colorSpace = SRGBColorSpace
          materialComponent.envMap.set(texture)
          removeError(entity, EnvMapComponent, 'MISSING_FILE')
        }
      },
      undefined,
      (_) => {
        materialComponent.envMap.set(null)
        addError(entity, EnvMapComponent, 'MISSING_FILE', 'Skybox texture could not be found!')
      }
    )
  }, [envMapComponent.envMapCubemapURL])

  return <EnvironmentSystemReactors.IntensityReactor entity={entity} rootEntity={rootEntity} />
}

const EnvmapProbesReactor = (props: { entity: Entity; rootEntity: Entity }) => {
  const { entity, rootEntity } = props
  const materialComponent = useOptionalComponent(entity, MaterialStateComponent)?.material as State<
    MeshStandardMaterial,
    Identifiable
  >

  const probeQuery = useQuery([ReflectionProbeComponent])

  useEffect(() => {
    return () => {
      EnvironmentSystemFunctions.clearMaterialEnvMap(entity)
    }
  }, [])

  useEffect(() => {
    if (!materialComponent || disallowedMaterials.has(materialComponent.type.value)) return

    const [renderTexture, unload] = createReflectionProbeRenderTarget(entity, probeQuery)
    materialComponent.envMap.set(renderTexture)
    return () => {
      unload()
    }
  }, [probeQuery])

  return <EnvironmentSystemReactors.IntensityReactor entity={entity} rootEntity={rootEntity} />
}

const EnvMapEquirectangularReactor = (props: { entity: Entity; rootEntity: Entity }) => {
  const { entity, rootEntity } = props
  const envMapComponent = useComponent(rootEntity, EnvMapComponent)
  const materialComponent = useOptionalComponent(entity, MaterialStateComponent)?.material as State<
    MeshStandardMaterial,
    Identifiable
  >
  const [envMapTexture, error] = useTexture(envMapComponent.envMapSourceURL.value, entity)

  useEffect(() => {
    return () => {
      EnvironmentSystemFunctions.clearMaterialEnvMap(entity)
    }
  }, [])

  useEffect(() => {
    if (disallowedMaterials.has(materialComponent.type.value)) return

    if (!envMapTexture || !envMapTexture.isTexture) return
    envMapTexture.mapping = EquirectangularReflectionMapping
    materialComponent.envMap.set(envMapTexture)
  }, [envMapTexture])

  useEffect(() => {
    if (!error) return
    materialComponent.envMap.set(null)
    addError(entity, EnvMapComponent, 'MISSING_FILE', 'Skybox texture could not be found!')
  }, [error])

  return <EnvironmentSystemReactors.IntensityReactor entity={entity} rootEntity={rootEntity} />
}

const EnvMapBakeReactor = (props: { entity: Entity; rootEntity: Entity }) => {
  const { entity, rootEntity } = props
  const materialComponent = useOptionalComponent(entity, MaterialStateComponent)?.material as State<
    MeshStandardMaterial,
    Identifiable
  >
  const envMapComponent = useComponent(rootEntity, EnvMapComponent)
  const bakeEntity =
    UUIDComponent.useEntityFromSameSourceByID(props.rootEntity, envMapComponent.envMapSourceEntityUUID.value) ??
    UndefinedEntity
  const bakeComponent = useOptionalComponent(bakeEntity, EnvMapBakeComponent)

  const [envMaptexture, error] = useTexture(bakeComponent?.envMapOrigin.value ?? '', bakeEntity)

  useEffect(() => {
    return () => {
      EnvironmentSystemFunctions.clearMaterialEnvMap(entity)
    }
  }, [])

  useEffect(() => {
    if (!materialComponent || disallowedMaterials.has(materialComponent.type.value)) return

    const texture = envMaptexture
    if (!texture) return
    texture.mapping = EquirectangularReflectionMapping
    materialComponent.envMap.set(texture)
  }, [envMaptexture, envMapComponent.type])

  useEffect(() => {
    if (!bakeComponent || !bakeComponent.boxProjection.value) return
    setComponent(entity, BoxProjectionPlugin, {
      cubeMapPos: new Uniform(bakeComponent.bakePositionOffset.value),
      cubeMapSize: new Uniform(bakeComponent.bakeScale.value)
    })

    return () => {
      removeComponent(entity, BoxProjectionPlugin)
    }
  }, [bakeComponent?.boxProjection])

  useEffect(() => {
    if (!error) return
    addError(bakeEntity, EnvMapComponent, 'MISSING_FILE', 'EnvMap bake texture not found!')
  }, [error])

  return <EnvironmentSystemReactors.IntensityReactor entity={entity} rootEntity={rootEntity} />
}

const tempColor = new Color(0, 0, 1)
const EnvMapColorReactor = (props: { entity: Entity; rootEntity: Entity }) => {
  const { entity, rootEntity } = props
  const materialComponent = useOptionalComponent(entity, MaterialStateComponent)?.material as State<
    MeshStandardMaterial,
    Identifiable
  >
  const envMapComponent = useComponent(rootEntity, EnvMapComponent)

  useEffect(() => {
    return () => {
      EnvironmentSystemFunctions.clearMaterialEnvMap(entity)
    }
  }, [])

  useEffect(() => {
    if (!materialComponent || disallowedMaterials.has(materialComponent.type.value)) return

    const color = envMapComponent.envMapSourceColor.value ?? tempColor
    const resolution = 64 // Min value required
    /** @todo track in resource manager */
    const texture = new DataTexture(getRGBArray(new Color(color)), resolution, resolution, RGBAFormat)
    texture.needsUpdate = true
    texture.colorSpace = SRGBColorSpace
    texture.mapping = EquirectangularReflectionMapping
    materialComponent.envMap.set(texture)
    return () => {
      texture.dispose()
    }
  }, [envMapComponent.envMapSourceColor, materialComponent?.uuid.value, envMapComponent.type])

  return <EnvironmentSystemReactors.IntensityReactor entity={entity} rootEntity={rootEntity} />
}

export const EnvironmentSystem = defineSystem({
  uuid: 'ee.engine.EnvironmentSystem',
  insert: { after: PresentationSystemGroup },
  reactor: () => (
    <QueryReactor Components={[EnvMapComponent]} ChildEntityReactor={EnvironmentSystemReactors.EnvMapReactor} />
  )
})

/** @private Exported for Unit Tests usage only */
export const EnvironmentSystemReactors = {
  EnvmapProbesReactor,
  EnvMapBakeReactor,
  EnvMapColorReactor,
  EnvMapEquirectangularReactor,
  EnvMapCubemapReactor,
  EnvMapSkyboxReactor,
  EnvMapReactor,
  IntensityReactor
}
/** @private Exported for Unit Tests usage only */
export const EnvironmentSystemFunctions = {
  clearMaterialEnvMap
}
