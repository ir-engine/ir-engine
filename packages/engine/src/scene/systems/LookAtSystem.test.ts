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

import assert from 'assert'
import { afterEach, beforeEach, describe, it } from 'vitest'

import {
  EntityTreeComponent,
  SystemDefinitions,
  SystemUUID,
  UndefinedEntity,
  createEngine,
  createEntity,
  destroyEngine,
  getComponent,
  removeEntity,
  setComponent
} from '@ir-engine/ecs'
import { TransformComponent } from '@ir-engine/spatial/src/transform/components/TransformComponent'
import {
  TransformDirtyCleanupSystem,
  TransformDirtyUpdateSystem
} from '@ir-engine/spatial/src/transform/systems/TransformSystem'
import { assertVec } from '@ir-engine/spatial/tests/util/assert'
import { mockSpatialEngine } from '@ir-engine/spatial/tests/util/mockSpatialEngine'
import { act, render } from '@testing-library/react'
import { Matrix4, Quaternion, Vector3 } from 'three'
import { NodeID, NodeIDComponent } from '../../gltf/NodeIDComponent'
import { LookAtComponent } from '../components/LookAtComponent'
import { SourceID } from '../components/SourceComponent'
import { LookAtSystem } from './LookAtSystem'

const sourceID = 'sourceID' as SourceID
const facerNodeID = 'facerNodeID' as NodeID
const testNodeID = 'testNodeID' as NodeID

describe('LookAtSystem', () => {
  const System = SystemDefinitions.get(LookAtSystem)!
  const CleanupSystem = SystemDefinitions.get(TransformDirtyCleanupSystem)!

  describe('Fields', () => {
    it('should initialize the *System.uuid field with the expected value', () => {
      assert.equal(System.uuid, 'ir.spatial.LookAtSystem')
    })

    it('should initialize the *System with the expected SystemUUID value', () => {
      assert.equal(LookAtSystem, 'ir.spatial.LookAtSystem' as SystemUUID)
    })

    it('should initialize the ClientInputSystem.insert field with the expected value', () => {
      assert.notEqual(System.insert, undefined)
      assert.notEqual(System.insert!.before, undefined)
      assert.equal(System.insert!.before!, TransformDirtyUpdateSystem)
    })
  }) //:: Fields

  describe('execute', () => {
    describe('when EngineState.viewerEntity is falsy', () => {
      let testEntity = UndefinedEntity
      let facerEntity = UndefinedEntity

      beforeEach(async () => {
        createEngine()
        // mockSpatialEngine()   // Do not set EngineState.viewerEntity
        facerEntity = NodeIDComponent.create(sourceID, facerNodeID)
        testEntity = NodeIDComponent.create(sourceID, testNodeID)
        await act(() => render(null))
      })

      afterEach(() => {
        removeEntity(testEntity)
        removeEntity(facerEntity)
        return destroyEngine()
      })

      it('should not do anything', () => {
        const Initial = new Quaternion(2, 3, 4, 5).normalize()

        setComponent(facerEntity, TransformComponent, { position: new Vector3().setScalar(42) })
        setComponent(testEntity, TransformComponent, { position: new Vector3().setScalar(22), rotation: Initial })
        setComponent(testEntity, LookAtComponent, { target: getComponent(facerEntity, NodeIDComponent) })

        System.execute()
        const result = getComponent(testEntity, TransformComponent).rotation.clone()
        assertVec.approxEq(result, Initial, 4)
      })
    })

    describe('when EngineState.viewerEntity is truthy', () => {
      describe('for every entity that has the components [LookAtComponent, TransformComponent] ...', () => {
        let testEntity = UndefinedEntity
        let facerEntity = UndefinedEntity

        beforeEach(async () => {
          createEngine()
          mockSpatialEngine() // Set EngineState.viewerEntity
          facerEntity = NodeIDComponent.create(sourceID, facerNodeID)
          testEntity = NodeIDComponent.create(sourceID, testNodeID)
          await act(() => render(null))
        })

        afterEach(() => {
          removeEntity(testEntity)
          removeEntity(facerEntity)
          return destroyEngine()
        })

        it('should not do anything for that entity if its LookAtComponent.target nodeID is truthy but it does not point to a valid entity', () => {
          const Initial = new Quaternion(2, 3, 4, 5).normalize()

          setComponent(facerEntity, TransformComponent, { position: new Vector3().setScalar(42), rotation: Initial })
          setComponent(testEntity, TransformComponent, { position: new Vector3().setScalar(22) })
          setComponent(testEntity, LookAtComponent, { target: 'invalidTestNodeID' as NodeID })

          System.execute()
          const result = getComponent(facerEntity, TransformComponent).rotation.clone()
          assertVec.approxEq(result, Initial, 4)
        })

        it('should not do anything for that entity if its LookAtComponent.target UUID is falsy', () => {
          const Initial = new Quaternion(2, 3, 4, 5).normalize()

          setComponent(facerEntity, TransformComponent, { position: new Vector3().setScalar(42), rotation: Initial })
          setComponent(testEntity, TransformComponent, { position: new Vector3().setScalar(22) })
          setComponent(testEntity, LookAtComponent, { target: '' as NodeID })

          System.execute()
          const result = getComponent(facerEntity, TransformComponent).rotation.clone()
          assertVec.approxEq(result, Initial, 4)
        })

        it('should set the entity.TransformComponent.rotation to the resulting lookAt rotation looking from (0,0,0) towards the difference of targetEntity.TransformComponent.position and entity.TransformComponent.position', () => {
          const Expected = new Quaternion(0.2721655269759087, 0.408248290463863, 0.5443310539518174, 0.6804138174397717)
          const Initial = new Quaternion(2, 3, 4, 5).normalize()

          setComponent(facerEntity, TransformComponent, { position: new Vector3().setScalar(42), rotation: Initial })
          setComponent(testEntity, TransformComponent, { position: new Vector3().setScalar(22) })
          setComponent(testEntity, LookAtComponent, { target: '' as NodeID })

          System.execute()
          const result = getComponent(facerEntity, TransformComponent).rotation.clone()
          assertVec.approxEq(result, Expected, 4)
        })

        it('should call TransformComponent.updateFromWorldMatrix for the entity', () => {
          const position = new Vector3(42, 43, 44)
          const rotation = new Quaternion(45, 46, 47, 48).normalize()
          const scale = new Vector3().setScalar(49)
          const Initial = new Matrix4().compose(position, rotation, scale)

          const parentEntity = createEntity()
          setComponent(parentEntity, TransformComponent, { position: new Vector3().setScalar(123) })
          setComponent(facerEntity, EntityTreeComponent, { parentEntity: parentEntity })
          setComponent(facerEntity, TransformComponent, { matrixWorld: Initial })
          setComponent(testEntity, TransformComponent, { position: new Vector3().setScalar(22) })
          setComponent(testEntity, LookAtComponent, { target: getComponent(facerEntity, NodeIDComponent) })
          CleanupSystem.execute()

          System.execute()
          const result = TransformComponent.dirty[testEntity]
          assert.equal(result, 1)
        })
      })
    })
  }) //:: execute
}) //:: LookAtSystem
