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

import { Quaternion, Vector3 } from 'three'
import { v4 as uuidv4 } from 'uuid'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import {
  Engine,
  Entity,
  EntityUUID,
  UUIDComponent,
  createEngine,
  createEntity,
  destroyEngine,
  getComponent,
  setComponent
} from '@ir-engine/ecs'
import { S } from '@ir-engine/ecs/src/schemas/JSONSchemas'
import { NetworkObjectComponent, NetworkTopics } from '@ir-engine/network'
import { createMockNetwork } from '@ir-engine/network/tests/createMockNetwork'
import { initializeSpatialEngine, initializeSpatialViewer } from '@ir-engine/spatial/src/initializeEngine'
import { SceneComponent } from '@ir-engine/spatial/src/renderer/components/SceneComponents'
import { loadEmptyScene } from '../../../tests/util/loadEmptyScene'

import { applyIncomingActions } from '@ir-engine/hyperflux'
import { TransformComponent } from '@ir-engine/spatial'
import { definePrefab } from './definePrefab'

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
        health: S.Number(100),
        name: S.String('Default'),
        isActive: S.Bool(true)
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
        health: S.Number(100),
        name: S.String('Default')
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
        health: S.Number(100),
        name: S.String('Default')
      }),
      reactor: () => null
    })

    expect(TestPrefabComponent.spawn).toBeDefined()
    expect(typeof TestPrefabComponent.spawn).toBe('function')

    const entityUUID = uuidv4() as EntityUUID
    const parentUUID = getComponent(sceneEntity, UUIDComponent)

    expect(() => {
      TestPrefabComponent.spawn({
        entityUUID,
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
})
