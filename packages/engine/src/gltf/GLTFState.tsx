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
import { Group, MathUtils } from 'three'

import {
  Entity,
  EntityID,
  EntityTreeComponent,
  LayerComponent,
  LayerComponents,
  LayerID,
  Layers,
  PresentationSystemGroup,
  QuerySubReactor,
  SourceID,
  UUIDComponent,
  UndefinedEntity,
  createEntity,
  defineSystem,
  getComponent,
  getMutableComponent,
  hasComponent,
  removeEntity,
  setComponent,
  useOptionalComponent,
  useQuery
} from '@ir-engine/ecs'
import { defineState, getMutableState, none, startReactor } from '@ir-engine/hyperflux'
import { NameComponent } from '@ir-engine/spatial/src/common/NameComponent'
import { ObjectComponent } from '@ir-engine/spatial/src/renderer/components/ObjectComponent'
import { SceneComponent } from '@ir-engine/spatial/src/renderer/components/SceneComponents'
import { VisibleComponent } from '@ir-engine/spatial/src/renderer/components/VisibleComponent'
import { RendererComponent } from '@ir-engine/spatial/src/renderer/WebGLRendererSystem'
import { TransformComponent } from '@ir-engine/spatial/src/transform/components/TransformComponent'
import { GLTFComponent, GLTFComponentReactor } from './GLTFComponent'
import './MeshExtensionComponents'

/**
 * Load an asset file as a scene
 */
export const SceneState = defineState({
  name: 'ee.engine.gltf.SceneState',
  initial: {} as Record<string, Entity>,

  loadScene: (sceneURL: string, uuid: string, viewerEntity?: Entity, layer?: LayerID) => {
    const gltfEntity = AssetState.load(sceneURL, uuid as string as EntityID, UndefinedEntity, layer)
    getMutableState(SceneState)[sceneURL].set(gltfEntity)
    setComponent(gltfEntity, SceneComponent)

    let simulationEntity = gltfEntity
    if (viewerEntity) {
      simulationEntity =
        layer === Layers.Authoring
          ? getComponent(gltfEntity, LayerComponents[layer]).relations[Layers.Simulation]
          : gltfEntity

      getMutableComponent(viewerEntity, RendererComponent).scenes.merge([simulationEntity])
    }

    return () => {
      if (viewerEntity && hasComponent(viewerEntity, RendererComponent)) {
        getMutableComponent(viewerEntity, RendererComponent).scenes.set((current) =>
          current.filter((scene) => scene !== simulationEntity)
        )
      }
      AssetState.unload(gltfEntity)
      getMutableState(SceneState)[sceneURL].set(none)
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
  load: (
    source: string,
    uuid = MathUtils.generateUUID() as EntityID,
    parentEntity = UndefinedEntity,
    layer = Layers.Simulation as LayerID
  ) => {
    const entity = createEntity(layer)
    setComponent(entity, UUIDComponent, { entityID: uuid, entitySourceID: 'root' as SourceID })
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
  },

  loadAsync: async (
    source: string,
    unloadOnComplete = true,
    uuid = UUIDComponent.generateUUID(),
    parentEntity = UndefinedEntity,
    layer = Layers.Simulation as LayerID
  ) => {
    return new Promise<Entity>((resolve) => {
      const assetEntity = AssetState.load(source, uuid, parentEntity, layer)

      const reactor = startReactor(() => {
        const progress = useOptionalComponent(assetEntity, GLTFComponent)?.progress?.value

        useEffect(() => {
          return () => {
            if (unloadOnComplete) AssetState.unload(assetEntity)
            resolve(assetEntity)
          }
        }, [])

        useEffect(() => {
          if (progress === 100) reactor.stop()
        }, [progress])
        return null
      })
    })
  }
})

export const GLTFLoadSystem = defineSystem({
  uuid: 'ee.engine.gltf.GLTFLoadSystem',
  insert: { after: PresentationSystemGroup },
  reactor: () => {
    const gltfSimulationEntities = useQuery([GLTFComponent]).filter((e) => !LayerComponent.hasUpstreamEntity(e))
    const gltfAuthoringEntities = useQuery([GLTFComponent], Layers.Authoring)
    const gltfEntities = [...gltfSimulationEntities, ...gltfAuthoringEntities]
    return (
      <>
        {gltfEntities.map((entity) => (
          <QuerySubReactor ChildEntityReactor={GLTFComponentReactor} key={entity} entity={entity} />
        ))}
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
