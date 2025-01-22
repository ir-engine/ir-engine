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
  ComponentType,
  defineSystem,
  Entity,
  getOptionalComponent,
  hasComponent,
  haveCommonAncestor,
  PresentationSystemGroup,
  setComponent,
  useAncestorWithComponents,
  useComponent,
  useQuery,
  UUIDComponent
} from '@ir-engine/ecs'

import { NO_PROXY, State } from '@ir-engine/hyperflux'
import { BackgroundComponent } from '@ir-engine/spatial/src/renderer/components/SceneComponents'
import { MaterialStateComponent } from '@ir-engine/spatial/src/renderer/materials/MaterialComponent'
import {
  Color,
  DataTexture,
  EquirectangularReflectionMapping,
  MeshStandardMaterial,
  RGBAFormat,
  SRGBColorSpace
} from 'three'
import { useTexture } from '../../assets/functions/resourceLoaderHooks'
import { EnvMapBakeComponent } from '../components/EnvMapBakeComponent'
import { EnvMapComponent, EnvMapSpecificationComponent } from '../components/EnvmapComponent'
import { EnvMapSourceType } from '../constants/EnvMapEnum'
import { getRGBArray } from '../constants/Util'
import { addError } from '../functions/ErrorFunctions'

// const EnvmapReactor = (props: { backgroundEntity: Entity }) => {
//   const entity = useEntityContext()
//   const envmapComponent = useComponent(entity, EnvmapComponent)
//   const backgroundComponent = useComponent(props.backgroundEntity, BackgroundComponent)
//   const hasRootMesh = !!useOptionalComponent(entity, MeshComponent)
//   const childrenMesh = useChildrenWithComponents(
//     entity,
//     [MeshComponent, VisibleComponent, SourceComponent],
//     [EnvmapComponent]
//   )

//   const getMeshes = () => {
//     const meshEntities = [...childrenMesh]
//     if (hasRootMesh) meshEntities.push(entity)

//     return meshEntities.map((meshEntity) => getComponent(meshEntity, MeshComponent))
//   }

//   useEffect(() => {
//     if (!haveCommonAncestor(entity, props.backgroundEntity)) return
//     if (envmapComponent.type.value !== EnvMapSourceType.Skybox) return
//     const meshes = getMeshes()

//     for (const mesh of meshes) {
//       // updateEnvMap(mesh, backgroundComponent.value as any)
//     }
//     return () => {
//       for (const mesh of meshes) {
//         // updateEnvMap(mesh, null)
//       }
//     }
//   }, [childrenMesh, envmapComponent.type, backgroundComponent])

//   return null
// }

// const BackgroundReactor = () => {
//   const backgroundEntity = useEntityContext()
//   return <QueryReactor Components={[EnvmapComponent]} ChildEntityReactor={EnvmapReactor} props={{ backgroundEntity }} />
// }
type MaterialState = State<ComponentType<typeof MaterialStateComponent>>
type EnvMapState = State<ComponentType<typeof EnvMapComponent>>
const EnvMapReactor = (props: { entity: Entity }) => {
  const entity = props.entity
  const envMapComponent = useComponent(entity, EnvMapComponent)
  const envMapSpecEntity = useAncestorWithComponents(entity, [EnvMapSpecificationComponent])
  const envMapSpecification = useComponent(envMapSpecEntity, EnvMapSpecificationComponent)
  useEffect(() => {
    setComponent(entity, EnvMapComponent, envMapSpecification.get(NO_PROXY))
  }, [envMapSpecification])

  const materialComponent = useComponent(entity, MaterialStateComponent)
  useEffect(() => {
    const material = materialComponent.material.value as MeshStandardMaterial
    material.envMapIntensity = envMapComponent.envMapIntensity.value
  }, [envMapComponent.envMapIntensity, materialComponent.material])

  switch (envMapComponent.type.value) {
    case 'Skybox':
      return <EnvMapSkyboxReactor entity={entity} materialComponent={materialComponent} />
    case 'Bake':
      return <EnvMapBakeReactor envMapComponent={envMapComponent} materialComponent={materialComponent} />
    case 'Color':
      return <EnvMapColorReactor envMapComponent={envMapComponent} materialComponent={materialComponent} />
  }

  return null
}

const EnvMapSkyboxReactor = (props: { materialComponent: MaterialState; entity: Entity }) => {
  const { entity, materialComponent } = props
  const backgroundQuery = useQuery([BackgroundComponent])
  useEffect(() => {
    let i = 0
    for (i; i < backgroundQuery.length; i++) if (haveCommonAncestor(entity, backgroundQuery[i])) break
    const backgroundComponent = getOptionalComponent(backgroundQuery[i], BackgroundComponent)
    if (!backgroundComponent) return
    const material = materialComponent.material.value as MeshStandardMaterial
    material.envMap = backgroundComponent as any
  }, [backgroundQuery])

  return null
}

const EnvMapBakeReactor = (props: { materialComponent: MaterialState; envMapComponent: EnvMapState }) => {
  const { materialComponent, envMapComponent } = props
  const bakeEntity = UUIDComponent.useEntityByUUID(envMapComponent.envMapSourceEntityUUID.value)
  const bakeComponent = useComponent(bakeEntity, EnvMapBakeComponent)

  const [envMaptexture, error] = useTexture(bakeComponent.envMapOrigin.value, bakeEntity)

  useEffect(() => {
    const texture = envMaptexture
    if (!texture) return
    texture.mapping = EquirectangularReflectionMapping
    ;(materialComponent.material as State<MeshStandardMaterial>).envMap.set(texture)
    if (bakeComponent.boxProjection.value) {
      //set the box projection plugin
    }
  }, [envMaptexture])

  useEffect(() => {
    if (!error) return
    addError(bakeEntity, EnvMapComponent, 'MISSING_FILE', 'EnvMap bake texture not found!')
  }, [error])

  return null
}

const tempColor = new Color(0, 0, 1)
const EnvMapColorReactor = (props: { materialComponent: MaterialState; envMapComponent: EnvMapState }) => {
  const { materialComponent, envMapComponent } = props

  useEffect(() => {
    return () => {
      ;(materialComponent.material as State<MeshStandardMaterial>).envMap.set(null)
    }
  }, [])

  useEffect(() => {
    const color = envMapComponent.envMapSourceColor.value ?? tempColor
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
  }, [envMapComponent.envMapSourceColor])

  return null
}

const MaterialStateReactor = (props: { entity: Entity }) => {
  const entity = props.entity
  const materialComponent = useComponent(entity, MaterialStateComponent)
  useEffect(() => {
    if (!hasComponent(entity, EnvMapComponent)) setComponent(entity, EnvMapComponent, { type: EnvMapSourceType.Skybox })
  }, [materialComponent])

  return null
}

export const EnvironmentSystem = defineSystem({
  uuid: 'ee.engine.EnvironmentSystem',
  insert: { after: PresentationSystemGroup },
  reactor: () => {
    const envMapQuery = useQuery([MaterialStateComponent, EnvMapComponent])
    const materialQuery = useQuery([MaterialStateComponent])

    return (
      <>
        {materialQuery.map((entity) => {
          ;<MaterialStateReactor entity={entity} key={entity} />
        })}
        {envMapQuery.map((entity) => (
          <EnvMapReactor entity={entity} key={entity} />
        ))}
      </>
    )
  }
})
