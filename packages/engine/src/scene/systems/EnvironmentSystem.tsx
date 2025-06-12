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
  useOptionalComponent,
  useQuery,
  UUIDComponent
} from '@ir-engine/ecs'

import { Identifiable, State } from '@ir-engine/hyperflux'
import { BackgroundComponent } from '@ir-engine/spatial/src/renderer/components/SceneComponents'
import { MaterialStateComponent } from '@ir-engine/spatial/src/renderer/materials/MaterialComponent'
import { ResourceState } from '@ir-engine/spatial/src/resources/ResourceState'
import { TransformComponent } from '@ir-engine/spatial/src/transform/components/TransformComponent'
import {
  Color,
  CubeReflectionMapping,
  CubeTexture,
  DataTexture,
  EquirectangularReflectionMapping,
  MeshStandardMaterial,
  RGBAFormat,
  SRGBColorSpace,
  Vector3
} from 'three'
import { useTexture } from '../../assets/functions/resourceLoaderHooks'
import { EnvMapBakeComponent } from '../components/EnvMapBakeComponent'
import { BoxProjectionPlugin, EnvMapComponent } from '../components/EnvmapComponent'
import { getRGBArray, loadCubeMapTexture } from '../constants/Util'
import { addError, removeError } from '../functions/ErrorFunctions'

const EnvMapReactor = (props: { entity: Entity }) => {
  const { entity } = props
  const envMapComponent = useComponent(entity, EnvMapComponent).type.value
  const materialComponentEntities = useChildrenWithComponents(entity, [MaterialStateComponent])
  return (
    <>
      {materialComponentEntities.map((materialComponentEntity, index) => {
        switch (envMapComponent) {
          case 'Skybox':
            return (
              <EnvMapSkyboxReactor
                key={envMapComponent + '-' + materialComponentEntity + '-' + index}
                entity={materialComponentEntity}
                rootEntity={entity}
              />
            )
          case 'Cubemap':
            return (
              <EnvMapCubemapReactor
                key={envMapComponent + '-' + materialComponentEntity + '-' + index}
                entity={materialComponentEntity}
                rootEntity={entity}
              />
            )
          case 'Equirectangular':
            return (
              <EnvMapEquirectangularReactor
                key={envMapComponent + '-' + materialComponentEntity + '-' + index}
                entity={materialComponentEntity}
                rootEntity={entity}
              />
            )
          case 'Color':
            return (
              <EnvMapColorReactor
                key={envMapComponent + '-' + materialComponentEntity + '-' + index}
                entity={materialComponentEntity}
                rootEntity={entity}
              />
            )
          case 'Bake':
            return (
              <EnvMapBakeReactor
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
  const materialState = useOptionalComponent(entity, MaterialStateComponent)?.material as
    | State<MeshStandardMaterial>
    | undefined
  useEffect(() => {
    if (!materialState) return
    const material = materialState.value as MeshStandardMaterial
    material.envMapIntensity = envMapComponent.envMapIntensity.value
  }, [envMapComponent.envMapIntensity?.value, materialState])
  return null
}

// circumvent threejs bug with envmap uniforms
const disallowedMaterials = new Set(['MeshMatcapMaterial', 'MeshToonMaterial'])

const EnvMapSkyboxReactor = (props: { entity: Entity; rootEntity: Entity }) => {
  const { entity, rootEntity } = props
  const backgroundQuery = useQuery([BackgroundComponent])
  const materialState = useOptionalComponent(entity, MaterialStateComponent)?.material as State<
    MeshStandardMaterial,
    Identifiable
  >
  useEffect(() => {
    return () => {
      const materialComponent = getOptionalMutableComponent(entity, MaterialStateComponent) as
        | State<MeshStandardMaterial>
        | undefined
      if (materialComponent?.envMap?.value) {
        const material = materialComponent.value as MeshStandardMaterial
        material.envMap = null
      }
    }
  }, [])
  let i = 0
  for (i; i < backgroundQuery.length; i++) if (haveCommonAncestor(entity, backgroundQuery[i])) break
  const backgroundComponent = useOptionalComponent(backgroundQuery[i], BackgroundComponent)
  useEffect(() => {
    if (!materialState || !backgroundComponent) return

    // threejs freaks out if matcap materials are passed in envmap related values
    if (disallowedMaterials.has(materialState.type.value)) return

    const material = materialState.value as MeshStandardMaterial
    material.envMap = backgroundComponent.value.clone() as any
    ResourceState.addEntityResource(entity, material.envMap!)
  }, [backgroundComponent?.value, materialState.value])

  return <IntensityReactor entity={entity} rootEntity={rootEntity} />
}

const EnvMapCubemapReactor = (props: { entity: Entity; rootEntity: Entity }) => {
  const { entity, rootEntity } = props
  const materialState = useOptionalComponent(entity, MaterialStateComponent)?.material as State<
    MeshStandardMaterial,
    Identifiable
  >
  const envMapComponent = useComponent(rootEntity, EnvMapComponent)
  useEffect(() => {
    return () => {
      const materialComponent = getOptionalMutableComponent(entity, MaterialStateComponent) as
        | State<MeshStandardMaterial>
        | undefined
      if (materialComponent?.envMap?.value) {
        const material = materialComponent.value as MeshStandardMaterial
        material.envMap = null
      }
    }
  }, [])
  useEffect(() => {
    if (!materialState || disallowedMaterials.has(materialState.type.value)) return
    loadCubeMapTexture(
      envMapComponent.envMapCubemapURL.value,
      (texture: CubeTexture | undefined) => {
        if (texture) {
          texture.mapping = CubeReflectionMapping
          texture.colorSpace = SRGBColorSpace
          const material = materialState.value as MeshStandardMaterial
          material.envMap = texture
          removeError(entity, EnvMapComponent, 'MISSING_FILE')
        }
      },
      undefined,
      (_) => {
        const material = materialState.value as MeshStandardMaterial
        material.envMap = null
        addError(entity, EnvMapComponent, 'MISSING_FILE', 'Skybox texture could not be found!')
      }
    )
  }, [envMapComponent.envMapCubemapURL, materialState.value])

  return <IntensityReactor entity={entity} rootEntity={rootEntity} />
}

const EnvMapEquirectangularReactor = (props: { entity: Entity; rootEntity: Entity }) => {
  const { entity, rootEntity } = props
  const envMapComponent = useComponent(rootEntity, EnvMapComponent)
  const materialState = useOptionalComponent(entity, MaterialStateComponent)?.material as State<
    MeshStandardMaterial,
    Identifiable
  >
  const [envMapTexture, error] = useTexture(envMapComponent.envMapSourceURL.value, entity)

  useEffect(() => {
    return () => {
      const materialComponent = getOptionalMutableComponent(entity, MaterialStateComponent) as
        | State<MeshStandardMaterial>
        | undefined
      if (materialComponent?.envMap?.value) {
        const material = materialComponent.value as MeshStandardMaterial
        material.envMap = null
      }
    }
  }, [])

  useEffect(() => {
    if (disallowedMaterials.has(materialState.type.value)) return

    if (!envMapTexture || !envMapTexture.isTexture) return
    envMapTexture.mapping = EquirectangularReflectionMapping
    const material = materialState.value as MeshStandardMaterial
    material.envMap = envMapTexture
  }, [envMapTexture, materialState.value])

  useEffect(() => {
    if (!error) return
    const material = materialState.value as MeshStandardMaterial
    material.envMap = null
    addError(entity, EnvMapComponent, 'MISSING_FILE', 'Skybox texture could not be found!')
  }, [error])

  return <IntensityReactor entity={entity} rootEntity={rootEntity} />
}

const EnvMapBakeReactor = (props: { entity: Entity; rootEntity: Entity }) => {
  const { entity, rootEntity } = props
  const materialState = useOptionalComponent(entity, MaterialStateComponent)?.material as State<
    MeshStandardMaterial,
    Identifiable
  >
  const envMapComponent = useComponent(rootEntity, EnvMapComponent)
  const bakeEntity =
    UUIDComponent.useEntityFromSameSourceByID(props.rootEntity, envMapComponent.envMapSourceEntityUUID.value) ??
    UndefinedEntity
  const bakeComponent = useOptionalComponent(bakeEntity, EnvMapBakeComponent)
  const transformComponent = useOptionalComponent(bakeEntity, TransformComponent)

  const [envMaptexture, error] = useTexture(bakeComponent?.envMapOrigin.value ?? '', bakeEntity)

  useEffect(() => {
    return () => {
      const materialComponent = getOptionalMutableComponent(entity, MaterialStateComponent) as
        | State<MeshStandardMaterial>
        | undefined
      if (materialComponent?.envMap?.value) {
        const material = materialComponent.value as MeshStandardMaterial
        material.envMap = null
      }
      removeComponent(entity, BoxProjectionPlugin)
    }
  }, [])

  useEffect(() => {
    if (!materialState || disallowedMaterials.has(materialState.type.value)) return

    const texture = envMaptexture
    if (!texture) return
    texture.mapping = EquirectangularReflectionMapping
    const material = materialState.value as MeshStandardMaterial
    material.envMap = texture
  }, [envMaptexture, envMapComponent.type, materialState.value])

  useEffect(() => {
    if (!bakeComponent) return

    if (!bakeComponent.boxProjection.value) {
      removeComponent(entity, BoxProjectionPlugin)
      return
    }

    const entityPosition = transformComponent?.position.value.clone() || new Vector3(0, 0, 0)
    const cubeMapPos = entityPosition.clone().add(bakeComponent.bakePositionOffset.value)
    const boxProjectionPlugin = getOptionalMutableComponent(entity, BoxProjectionPlugin)

    if (boxProjectionPlugin) {
      boxProjectionPlugin.cubeMapPos.set(cubeMapPos)
      boxProjectionPlugin.cubeMapSize.set(bakeComponent.bakeScale.value)
    } else {
      setComponent(entity, BoxProjectionPlugin, {
        cubeMapPos: cubeMapPos,
        cubeMapSize: bakeComponent.bakeScale.value
      })
    }
  }, [
    bakeComponent?.boxProjection,
    bakeComponent?.envMapOrigin,
    bakeComponent?.bakePositionOffset,
    bakeComponent?.bakeScale,
    transformComponent?.position
  ])

  useEffect(() => {
    if (!error) return
    addError(bakeEntity, EnvMapComponent, 'MISSING_FILE', 'EnvMap bake texture not found!')
  }, [error])

  return <IntensityReactor entity={entity} rootEntity={rootEntity} />
}

const tempColor = new Color(0, 0, 1)
const EnvMapColorReactor = (props: { entity: Entity; rootEntity: Entity }) => {
  const { entity, rootEntity } = props
  const materialState = useOptionalComponent(entity, MaterialStateComponent)?.material as State<
    MeshStandardMaterial,
    Identifiable
  >
  const envMapComponent = useComponent(rootEntity, EnvMapComponent)

  useEffect(() => {
    return () => {
      const materialComponent = getOptionalMutableComponent(entity, MaterialStateComponent) as
        | State<MeshStandardMaterial>
        | undefined
      if (materialComponent?.envMap?.value) {
        const material = materialComponent.value as MeshStandardMaterial
        material.envMap = null
      }
    }
  }, [])

  useEffect(() => {
    if (!materialState || disallowedMaterials.has(materialState.type.value)) return

    const color = envMapComponent.envMapSourceColor.value ?? tempColor
    const resolution = 64 // Min value required
    /** @todo track in resource manager */
    const texture = new DataTexture(getRGBArray(new Color(color)), resolution, resolution, RGBAFormat)
    texture.needsUpdate = true
    texture.colorSpace = SRGBColorSpace
    texture.mapping = EquirectangularReflectionMapping
    const material = materialState.value as MeshStandardMaterial
    material.envMap = texture
    return () => {
      texture.dispose()
    }
  }, [envMapComponent.envMapSourceColor, materialState.value, envMapComponent.type])

  return <IntensityReactor entity={entity} rootEntity={rootEntity} />
}

export const EnvironmentSystem = defineSystem({
  uuid: 'ee.engine.EnvironmentSystem',
  insert: { after: PresentationSystemGroup },
  reactor: () => <QueryReactor Components={[EnvMapComponent]} ChildEntityReactor={EnvMapReactor} />
})
