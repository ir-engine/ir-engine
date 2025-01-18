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
  defineSystem,
  Entity,
  getAncestorWithComponents,
  getComponent,
  getMutableComponent,
  getOptionalComponent,
  hasComponent,
  haveCommonAncestor,
  PresentationSystemGroup,
  setComponent,
  useComponent,
  useQuery,
  UUIDComponent
} from '@ir-engine/ecs'

import { State } from '@ir-engine/hyperflux'
import { BackgroundComponent } from '@ir-engine/spatial/src/renderer/components/SceneComponents'
import { MaterialStateComponent } from '@ir-engine/spatial/src/renderer/materials/MaterialComponent'
import { EquirectangularReflectionMapping, MeshStandardMaterial } from 'three'
import { useTexture } from '../../assets/functions/resourceLoaderHooks'
import { EnvMapBakeComponent } from '../components/EnvMapBakeComponent'
import { EnvmapComponent, EnvmapSpecificationComponent } from '../components/EnvmapComponent'
import { EnvMapSourceType } from '../constants/EnvMapEnum'
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

const EnvMapReactor = (props: { entity: Entity }) => {
  const entity = props.entity
  const envMap = useComponent(entity, EnvmapComponent)
  switch (envMap.type.value) {
    case 'Skybox':
      return <EnvMapSkyboxReactor entity={entity} />
    case 'Bake':
      return <EnvMapBakeReactor entity={entity} />
  }

  return null
}

const EnvMapSkyboxReactor = (props: { entity: Entity }) => {
  const entity = props.entity
  const backgroundQuery = useQuery([BackgroundComponent])
  const materialComponent = useComponent(props.entity, MaterialStateComponent)
  useEffect(() => {
    let i = 0
    for (i; i < backgroundQuery.length; i++) if (haveCommonAncestor(entity, backgroundQuery[i])) break
    const backgroundComponent = getOptionalComponent(backgroundQuery[i], BackgroundComponent)
    if (!backgroundComponent) return
    const material = materialComponent.material.value as MeshStandardMaterial
    material.envMap = backgroundComponent as any
    const hasSpec = getAncestorWithComponents(entity, [EnvmapSpecificationComponent])
    if (hasSpec) setComponent(entity, EnvmapComponent, getComponent(hasSpec, EnvmapSpecificationComponent))
  }, [backgroundQuery])

  return null
}

const EnvMapBakeReactor = (props: { entity: Entity }) => {
  const entity = props.entity
  const envMap = useComponent(entity, EnvmapComponent)
  const bakeEntity = UUIDComponent.useEntityByUUID(envMap.envMapSourceEntityUUID.value)
  const bakeComponent = useComponent(bakeEntity, EnvMapBakeComponent)

  const [envMaptexture, error] = useTexture(bakeComponent.envMapOrigin.value, entity)

  useEffect(() => {
    const texture = envMaptexture
    if (!texture) return
    texture.mapping = EquirectangularReflectionMapping
    ;(getMutableComponent(entity, MaterialStateComponent).material as State<MeshStandardMaterial>).envMap.set(texture)
    if (bakeComponent.boxProjection.value) {
      //set the box projection plugin
    }
  }, [envMaptexture])

  useEffect(() => {
    if (!error) return
    addError(entity, EnvmapComponent, 'MISSING_FILE', 'EnvMap bake texture not found!')
  }, [error])

  return null
}

const MaterialStateReactor = (props: { entity: Entity }) => {
  const entity = props.entity
  const materialComponent = useComponent(entity, MaterialStateComponent)
  useEffect(() => {
    if (!hasComponent(entity, EnvmapComponent)) setComponent(entity, EnvmapComponent, { type: EnvMapSourceType.Skybox })
  }, [materialComponent])

  return null
}

export const EnvironmentSystem = defineSystem({
  uuid: 'ee.engine.EnvironmentSystem',
  insert: { after: PresentationSystemGroup },
  reactor: () => {
    const envMapQuery = useQuery([MaterialStateComponent, EnvmapComponent])
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
