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

import {
  Entity,
  UndefinedEntity,
  createEngine,
  createEntity,
  destroyEngine,
  getComponent,
  getMutableComponent,
  removeEntity,
  setComponent
} from '@ir-engine/ecs'
import { getState } from '@ir-engine/hyperflux'
import assert from 'assert'
import { Matrix4, Quaternion, Vector3 } from 'three'
import { afterEach, beforeEach, describe, it } from 'vitest'
import { assertArray, assertVec } from '../../tests/util/assert'
import { mockSpatialEngine } from '../../tests/util/mockSpatialEngine'
import { EngineState } from '../EngineState'
import { TransformComponent } from '../SpatialModule'
import { Vector3_One } from '../common/constants/MathConstants'
import { ReferenceSpace, XRState } from '../xr/XRState'
import { EntityTreeComponent } from './components/EntityTree'
import {
  computeAndUpdateWorldOrigin,
  updateWorldOrigin,
  updateWorldOriginFromScenePlacement
} from './updateWorldOrigin'

describe('updateWorldOriginFromScenePlacement', () => {
  let localFloorEntity = UndefinedEntity
  const childrenCount = 4
  const children: Entity[] = [UndefinedEntity, UndefinedEntity, UndefinedEntity, UndefinedEntity]

  beforeEach(async () => {
    createEngine()
    mockSpatialEngine()
    localFloorEntity = getState(EngineState).localFloorEntity

    for (let id = 0; id < childrenCount; ++id) {
      children[id] = createEntity()
      setComponent(children[id], TransformComponent)
    }
    getMutableComponent(localFloorEntity, EntityTreeComponent).children.set(children)
  })

  afterEach(() => {
    for (let id = 0; id < childrenCount; ++id) removeEntity(children[id])
    return destroyEngine()
  })

  it('should set the value of XRState.worldScale into all components of TransformComponent.scale for all children of EngineState.originEntity', () => {
    const scale = 42
    const Initial = new Vector3().setScalar(scale)
    const children = getComponent(getState(EngineState).originEntity, EntityTreeComponent).children
    for (const child of children) {
      // Set the data as expected
      setComponent(child, TransformComponent, { scale: Initial })
      // Sanity check before running
      const before = getComponent(child, TransformComponent).scale
      assertVec.approxEq(before, Initial, 3)
      assertVec.allApproxNotEq(before, Vector3_One, 3)
    }
    // Run and Check the result
    updateWorldOriginFromScenePlacement()
    for (const child of children) {
      const result = getComponent(child, TransformComponent).scale
      assertVec.approxEq(result, Vector3_One, 3)
    }
  })

  it('should compose and invert EngineState.localFloorEntity.TransformComponent.matrix from EngineState.localFloorEntity.TransformComponent.(position,rotation), and a scale of (1,1,1)', () => {
    const position = new Vector3(2, 3, 4)
    const rotation = new Quaternion(5, 6, 7, 8).normalize()
    const scale = Vector3_One.clone()
    const Expected = new Matrix4().compose(position, rotation, scale).invert()
    // Set the data as expected
    getState(XRState).scenePosition.set(position.x, position.y, position.z)
    getState(XRState).sceneRotation.set(rotation.x, rotation.y, rotation.z, rotation.w)
    // Run and Check the result
    updateWorldOriginFromScenePlacement()
    const result = getComponent(localFloorEntity, TransformComponent).matrix
    assertArray.eq(result.elements, Expected.elements)
  })

  /** @todo How to setup this test so that the sanity check doesn't fail ?? */
  it.skip('should copy EngineState.localFloorEntity.TransformComponent.matrix into its .matrixWorld', () => {
    const position = new Vector3(2, 3, 4)
    const rotation = new Quaternion(5, 6, 7, 8).normalize()
    const scale = Vector3_One.clone()
    const Initial = new Matrix4().compose(position, rotation, scale).invert()
    // Set the data as expected
    getMutableComponent(localFloorEntity, TransformComponent).matrixWorld.set(Initial)
    // Sanity check before running
    const before = getComponent(localFloorEntity, TransformComponent)
    assertArray.allNotEq(before.matrix.elements, before.matrixWorld.elements)
    // Run and Check the result
    updateWorldOriginFromScenePlacement()
    const result = getComponent(localFloorEntity, TransformComponent)
    assertArray.eq(result.matrix.elements, result.matrixWorld.elements)
  })

  it('should change the value of EngineState.localFloorEntity.TransformComponent.position', () => {
    const Initial = new Vector3(2, 3, 4)
    // Set the data as expected
    setComponent(localFloorEntity, TransformComponent, { position: Initial })
    // Sanity check before running
    const before = getComponent(localFloorEntity, TransformComponent).position.clone()
    assertVec.approxEq(before, Initial, 3)
    // Run and Check the result
    updateWorldOriginFromScenePlacement()
    const result = getComponent(localFloorEntity, TransformComponent).position
    assertVec.anyApproxNotEq(result, before, 3)
  })

  it('should change the value of EngineState.localFloorEntity.TransformComponent.rotation', () => {
    const Initial = new Quaternion(2, 3, 4, 5).normalize()
    // Set the data as expected
    setComponent(localFloorEntity, TransformComponent, { rotation: Initial })
    // Sanity check before running
    const before = getComponent(localFloorEntity, TransformComponent).rotation.clone()
    assertVec.approxEq(before, Initial, 3)
    // Run and Check the result
    updateWorldOriginFromScenePlacement()
    const result = getComponent(localFloorEntity, TransformComponent).rotation
    assertVec.anyApproxNotEq(result, before, 3)
  })

  /** @todo XRRigidTransform type is not defined. Needs the webxr-emulator */
  it.skip('should set ReferenceSpace.origin to be the inverse of XRState.(scenePosition,sceneRotation)', async () => {
    // Set the data as expected
    ReferenceSpace.localFloor = {} as XRReferenceSpace
    console.log('.......................')
    console.log(ReferenceSpace.origin)
    console.log(ReferenceSpace.localFloor)
    // Sanity check before running
    assert.equal(Boolean(ReferenceSpace.localFloor), true)
    assert.equal(Boolean(ReferenceSpace.origin), false)
    // Run and Check the result
    updateWorldOriginFromScenePlacement()
    console.log('.......................')
    console.log(ReferenceSpace.origin)
    assert.equal(Boolean(ReferenceSpace.origin), true)
  })
}) //:: updateWorldOriginFromScenePlacement

describe('updateWorldOrigin', () => {
  let localFloorEntity = UndefinedEntity

  beforeEach(async () => {
    createEngine()
    mockSpatialEngine()
    localFloorEntity = getState(EngineState).localFloorEntity
  })

  afterEach(() => {
    return destroyEngine()
  })

  /** @todo XRRigidTransform type is not defined. Needs the webxr-emulator */
  it.skip('should set ReferenceSpace.origin to be the inverse of XRState.(scenePosition,sceneRotation)', async () => {
    // Set the data as expected
    // Sanity check before running
    assert.equal(Boolean(ReferenceSpace.localFloor), true)
    assert.equal(Boolean(ReferenceSpace.origin), false)
    // Run and Check the result
    updateWorldOrigin()
    assert.equal(Boolean(ReferenceSpace.origin), true)
  })

  /** @todo XRRigidTransform type is not defined. Needs the webxr-emulator */
  it.skip('should not do anything if ReferenceSpace.localFloor is falsy', () => {
    // Set the data as expected
    // Sanity check before running
    assert.equal(Boolean(ReferenceSpace.localFloor), true)
    assert.equal(Boolean(ReferenceSpace.origin), false)
    // Run and Check the result
    updateWorldOrigin()
    assert.equal(Boolean(ReferenceSpace.origin), false)
  })
}) //:: updateWorldOrigin

/** @todo XRRigidTransform type is not defined. Needs the webxr-emulator */
describe.skip('computeAndUpdateWorldOrigin', () => {
  let localFloorEntity = UndefinedEntity

  beforeEach(async () => {
    createEngine()
    mockSpatialEngine()
    localFloorEntity = getState(EngineState).localFloorEntity
  })

  afterEach(() => {
    return destroyEngine()
  })

  /** @todo */
  it('should call computeTransformMatrix for the localFloorEntity', async () => {
    const Expected = false
    // Set the data as expected
    // Sanity check before running
    // Run and Check the result
    computeAndUpdateWorldOrigin()
    const result = true
    assert.equal(result, Expected)
  })

  it('should call updateWorldOrigin', async () => {
    // Sanity check before running
    assert.equal(Boolean(ReferenceSpace.localFloor), true)
    assert.equal(Boolean(ReferenceSpace.origin), false)
    // Run and Check the result
    computeAndUpdateWorldOrigin()
    assert.equal(Boolean(ReferenceSpace.origin), true)
  })
}) //:: computeAndUpdateWorldOrigin
