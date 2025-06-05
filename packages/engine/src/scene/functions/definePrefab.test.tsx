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

import { Quaternion, Vector3 } from 'three'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import {
  createEngine,
  createEntity,
  destroyEngine,
  Engine,
  Entity,
  EntityID,
  EntityTreeComponent,
  EntityUUIDPair,
  getComponent,
  Layers,
  NetworkObjectComponent,
  setComponent,
  SourceID,
  UUIDComponent
} from '@ir-engine/ecs'
import { S } from '@ir-engine/ecs/src/schemas/JSONSchemas'
import { initializeSpatialEngine, initializeSpatialViewer } from '@ir-engine/spatial/src/initializeEngine'
import { SceneComponent } from '@ir-engine/spatial/src/renderer/components/SceneComponents'
import { loadEmptyScene } from '../../../tests/util/loadEmptyScene'

import { GLTF } from '@gltf-transform/core'
import { applyIncomingActions, NetworkTopics } from '@ir-engine/hyperflux'
import { createMockNetwork } from '@ir-engine/hyperflux/tests/createMockNetwork'
import { TransformComponent } from '@ir-engine/spatial'
import { Physics } from '@ir-engine/spatial/src/physics/classes/Physics'
import { Cache } from 'three'
import { startEngineReactor } from '../../../tests/startEngineReactor'
import { GLTFComponent } from '../../gltf/GLTFComponent'
import { AssetState } from '../../gltf/GLTFState'
import { definePrefab } from './definePrefab'

const waitForScene = (entity: Entity) => vi.waitUntil(() => GLTFComponent.isSceneLoaded(entity), { timeout: 5000 })

/**
 * Specification:
 * 1. definePrefab should create a component with the specified name, jsonID, and schema
 * 2. definePrefab should create a component with a reactor function
 * 3. definePrefab should return a Component with a functional spawn method
 */

describe('definePrefab', () => {
  let sceneEntity: Entity

  beforeEach(async () => {
    createEngine()
    initializeSpatialEngine()
    initializeSpatialViewer()
    sceneEntity = loadEmptyScene()
    setComponent(sceneEntity, SceneComponent)

    // Create a mock network for testing
    createMockNetwork(NetworkTopics.world)
  })

  afterEach(() => {
    return destroyEngine()
  })

  /**
   * Specification 1: definePrefab should create a component with the specified name, jsonID, and schema
   */
  it('should create a component with the specified name, jsonID, and schema', () => {
    const TestPrefabComponent = definePrefab({
      name: 'TestPrefab',
      jsonID: 'test-prefab',
      schema: S.Object({
        health: S.Number({ default: 100 }),
        name: S.String({ default: 'Default' }),
        isActive: S.Bool({ default: true })
      }),
      reactor: () => null
    })

    expect(TestPrefabComponent.name).toBe('TestPrefab')
    expect(TestPrefabComponent.jsonID).toBe('test-prefab')
    expect(TestPrefabComponent.schema).toBeDefined()

    const entity = createEntity()
    setComponent(entity, TestPrefabComponent)
    const defaultData = getComponent(entity, TestPrefabComponent)
    expect(defaultData.health).toBe(100)
    expect(defaultData.name).toBe('Default')
    expect(defaultData.isActive).toBe(true)

    const customEntity = createEntity()
    setComponent(customEntity, TestPrefabComponent, { health: 200, name: 'Custom Entity', isActive: false })
    const customData = getComponent(customEntity, TestPrefabComponent)
    expect(customData.health).toBe(200)
    expect(customData.name).toBe('Custom Entity')
    expect(customData.isActive).toBe(false)
  })

  /**
   * Specification 2: definePrefab should create a component with a reactor function
   */
  it('should create a component with a reactor function', () => {
    const TestPrefabComponent = definePrefab({
      name: 'TestPrefabReactor',
      jsonID: 'test-prefab-reactor',
      schema: S.Object({
        health: S.Number({ default: 100 }),
        name: S.String({ default: 'Default' })
      }),
      reactor: () => null
    })

    expect(TestPrefabComponent.reactor).toBeDefined()
    expect(typeof TestPrefabComponent.reactor).toBe('function')
  })

  /**
   * Specification 3: definePrefab should return a Component with a functional spawn method
   */
  it('should return a Component with a functional spawn method', async () => {
    const TestPrefabComponent = definePrefab({
      name: 'TestPrefabSpawn',
      jsonID: 'test-prefab-spawn',
      schema: S.Object({
        health: S.Number({ default: 100 }),
        name: S.String({ default: 'Default' })
      }),
      reactor: () => null
    })

    expect(TestPrefabComponent.spawn).toBeDefined()
    expect(typeof TestPrefabComponent.spawn).toBe('function')

    const entityUUIDPair = {
      entitySourceID: 'spawned-source' as SourceID,
      entityID: 'spawned-entity' as EntityID
    } as EntityUUIDPair
    const entityUUID = UUIDComponent.join(entityUUIDPair)
    const parentUUID = UUIDComponent.get(sceneEntity)

    expect(() => {
      TestPrefabComponent.spawn({
        entityID: entityUUIDPair.entityID,
        entitySourceID: entityUUIDPair.entitySourceID,
        parentUUID,
        position: new Vector3(1, 2, 3),
        rotation: new Quaternion(0, 0, 0, 1),
        data: { health: 150, name: 'Spawned Entity' }
      })
    }).not.toThrow()

    applyIncomingActions()

    const actions = Engine.instance.store.actions.history
    expect(actions.length).toBe(2)
    expect(actions[0].type).toBe('ir.engine.prefab_TestPrefabSpawn')
    expect(actions[1].type).toStrictEqual(['ee.engine.world.SPAWN_OBJECT', 'ee.network.SPAWN_ENTITY'])

    await vi.waitFor(() => {
      const entity = UUIDComponent.getEntityByUUID(entityUUID)
      expect(entity).toBeDefined()
      expect(getComponent(entity, NetworkObjectComponent)).toBeDefined()
      expect(getComponent(entity, TestPrefabComponent)).toBeDefined()
      expect(getComponent(entity, TransformComponent)).toBeDefined()
    })
  })

  it('should not dispatch a spawn action if loaded as part of a scene', async () => {
    startEngineReactor()

    const TestPrefabComponent = definePrefab({
      name: 'TestPrefabSpawn2',
      jsonID: 'test-prefab-spawn-2',
      schema: S.Object({
        health: S.Number({ default: 100 }),
        name: S.String({ default: 'Default' })
      }),
      reactor: () => null
    })

    const gltf: GLTF.IGLTF = {
      asset: {
        version: '2.0'
      },
      scenes: [{ nodes: [0] }],
      scene: 0,
      nodes: [
        {
          name: 'node',
          extensions: {
            [TestPrefabComponent.jsonID]: {
              health: 5,
              name: 'Not Default'
            }
          }
        }
      ]
    }

    await Physics.load()
    const physicsWorldEntity = createEntity()

    setComponent(physicsWorldEntity, UUIDComponent, {
      entityID: 'physicsWorld' as EntityID,
      entitySourceID: 'source' as SourceID
    })
    setComponent(physicsWorldEntity, SceneComponent)
    setComponent(physicsWorldEntity, TransformComponent)
    setComponent(physicsWorldEntity, EntityTreeComponent)
    const physicsWorld = Physics.createWorld(physicsWorldEntity)
    physicsWorld.timestep = 1 / 60
    Cache.add('/test.gltf', gltf)

    const rootEntity = AssetState.load('/test.gltf', undefined, physicsWorldEntity, Layers.Authoring)

    await waitForScene(rootEntity)

    const entity = createEntity()
    setComponent(entity, TestPrefabComponent, { health: 150, name: 'Spawned Entity' })

    applyIncomingActions()

    const actions = Engine.instance.store.actions.history
    expect(actions.length).toBe(0)
  })
})
