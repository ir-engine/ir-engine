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

import React from 'react'
import { Group, MathUtils } from 'three'

import {
  Entity,
  EntityTreeComponent,
  EntityUUID,
  LayerComponent,
  Layers,
  PresentationSystemGroup,
  UUIDComponent,
  UndefinedEntity,
  createEntity,
  defineSystem,
  removeEntity,
  setComponent,
  useQuery
} from '@ir-engine/ecs'
import { EngineState } from '@ir-engine/ecs/src/EngineState'
import { defineState, getMutableState, getState } from '@ir-engine/hyperflux'
import { ReferenceSpaceState } from '@ir-engine/spatial'
import { NameComponent } from '@ir-engine/spatial/src/common/NameComponent'
import { ObjectComponent } from '@ir-engine/spatial/src/renderer/components/ObjectComponent'
import { SceneComponent } from '@ir-engine/spatial/src/renderer/components/SceneComponents'
import { VisibleComponent } from '@ir-engine/spatial/src/renderer/components/VisibleComponent'
import { TransformComponent } from '@ir-engine/spatial/src/transform/components/TransformComponent'
import { GLTFComponent, GLTFComponentReactor } from './GLTFComponent'
import './MeshExtensionComponents'

/**
 * Load an asset file as a scene
 */
export const SceneState = defineState({
  name: 'ee.engine.gltf.SceneState',
  initial: {} as Record<string, Entity>,

  loadScene: (sceneURL: string, uuid: string) => {
    const gltfEntity = AssetState.load(sceneURL, uuid as EntityUUID, getState(ReferenceSpaceState).originEntity)
    getMutableState(SceneState)[sceneURL].set(gltfEntity)
    setComponent(gltfEntity, SceneComponent)

    return () => {
      AssetState.unload(gltfEntity)
      getMutableState(SceneState)[sceneURL].set(gltfEntity)
    }
  }
})

export const AssetState = defineState({
  name: 'ee.engine.gltf.GLTFSourceState',
  initial: {} as Record<string, Entity>,

  /**
   * @param source The asset URL for the GLTF file
   * @param uuid Identitifies this GLTF uniquely, either as a location instance or loaded as an asset referenced in another GLTF file
   * @param parentEntity The parent entity to attach the GLTF to
   * @returns
   */
  load: (source: string, uuid = MathUtils.generateUUID() as EntityUUID, parentEntity = UndefinedEntity) => {
    // getState(EngineState).isEditing is a hack, we will pass this down as needed
    const entity = createEntity(getState(EngineState).isEditing ? Layers.Authoring : Layers.Simulation)
    setComponent(entity, UUIDComponent, uuid)
    setComponent(entity, NameComponent, source.split('/').pop()!)
    setComponent(entity, VisibleComponent, true)
    setComponent(entity, TransformComponent)
    setComponent(entity, EntityTreeComponent, { parentEntity })
    setComponent(entity, GLTFComponent, { src: source })
    const obj3d = new Group()
    setComponent(entity, ObjectComponent, obj3d)
    return entity
  },

  unload: (entity: Entity) => {
    removeEntity(entity)
  }
})

export const GLTFLoadSystem = defineSystem({
  uuid: 'ee.engine.gltf.GLTFLoadSystem',
  insert: { after: PresentationSystemGroup },
  reactor: () => {
    const gltfSimulationEntities = useQuery([GLTFComponent])
    const gltfAuthoringEntities = useQuery([GLTFComponent], Layers.Authoring)
    const gltfEntities = [...gltfSimulationEntities, ...gltfAuthoringEntities]
    return (
      <>
        {gltfEntities.map((entity) => {
          if (LayerComponent.hasUpstreamEntity(entity)) return null
          return <GLTFComponentReactor key={entity} entity={entity} />
        })}
      </>
    )
  }
})

/**
 * @todo will be replaced with ECS history system
 */
export const AssetModifiedState = defineState({
  name: 'ee.engine.gltf.AssetModifiedState',
  initial: {} as Record<string, boolean>
})
