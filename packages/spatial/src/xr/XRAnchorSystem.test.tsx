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

import { afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { destroyEmulatedXREngine, mockEmulatedXREngine } from '../../tests/util/mockEmulatedXREngine'
import { CustomWebXRPolyfill } from '../../tests/webxr/emulator'

import {
  SystemDefinitions,
  SystemUUID,
  UndefinedEntity,
  createEngine,
  createEntity,
  destroyEngine,
  getComponent,
  getOptionalComponent,
  hasComponents,
  removeEntity,
  setComponent
} from '@ir-engine/ecs'
import { getMutableState, getState } from '@ir-engine/hyperflux'
import { Quaternion, Vector3 } from 'three'
import { MockXRAnchor } from '../../tests/util/MockXR'
import { assertVec } from '../../tests/util/assert'
import { EngineState } from '../EngineState'
import { TransformComponent, XRAnchorComponent } from '../SpatialModule'
import { Q_IDENTITY, Vector3_Zero } from '../common/constants/MathConstants'
import { EntityTreeComponent } from '../transform/components/EntityTree'
import { XRRigidTransform } from './8thwall/XR8WebXRProxy'
import { XRAnchorSystemState, updateAnchor, updateHitTest, updateScenePlacement } from './XRAnchorSystem'
import { XRHitTestComponent } from './XRComponents'
import { XRAnchorSystem, XRCameraUpdateSystem } from './XRModule'
import { ReferenceSpace, XRState } from './XRState'

/** @note Runs once on the `describe` implied by vitest for this file */
beforeAll(() => {
  new CustomWebXRPolyfill()
})

describe('updateAnchor', () => {
  let testEntity = UndefinedEntity

  beforeEach(async () => {
    createEngine()
    await mockEmulatedXREngine()
    testEntity = createEntity()
  })

  afterEach(() => {
    removeEntity(testEntity)
    destroyEmulatedXREngine()
    destroyEngine()
  })

  it('should copy the XRPose position into the `@param entity`.TransformComponent.position', () => {
    const Expected = new Vector3(40, 41, 42)
    const Initial = new Vector3(20, 21, 22)
    // Set the data as expected
    const position = Expected as unknown as DOMPointReadOnly
    const rotation = new Quaternion(1, 2, 3, 4).normalize() as unknown as DOMPointReadOnly
    function getPoseMock(_: XRSpace, __: XRSpace): XRPose | undefined {
      return {
        transform: {
          position: position,
          orientation: rotation
        }
      } as XRPose
    }
    getMutableState(XRState).xrFrame.merge({ getPose: getPoseMock })
    setComponent(testEntity, XRAnchorComponent, { anchor: new MockXRAnchor() })
    setComponent(testEntity, TransformComponent, { position: Initial })
    // Sanity check before running
    expect(ReferenceSpace.localFloor).toBeTruthy()
    expect(getOptionalComponent(testEntity, XRAnchorComponent)).toBeTruthy()
    expect(getOptionalComponent(testEntity, XRAnchorComponent)?.anchor).toBeTruthy()
    const before = getComponent(testEntity, TransformComponent).position
    expect(before).not.toEqual(Expected)
    expect(before).toEqual(Initial)
    // Run and Check the result
    updateAnchor(testEntity)
    const result = getComponent(testEntity, TransformComponent).position
    expect(result).not.toEqual(Initial)
    expect(result).toEqual(Expected)
  })

  it('should copy the XRPose rotation into the `@param entity`.TransformComponent.rotation', () => {
    const Expected = new Quaternion(41, 42, 43, 44).normalize()
    const Initial = new Quaternion(5, 6, 7, 8).normalize()
    // Set the data as expected
    const position = new Vector3(20, 21, 22) as unknown as DOMPointReadOnly
    const rotation = Expected as unknown as DOMPointReadOnly
    function getPoseMock(_: XRSpace, __: XRSpace): XRPose | undefined {
      return {
        transform: {
          position: position,
          orientation: rotation
        }
      } as XRPose
    }
    getMutableState(XRState).xrFrame.merge({ getPose: getPoseMock })
    setComponent(testEntity, XRAnchorComponent, { anchor: new MockXRAnchor() })
    setComponent(testEntity, TransformComponent, { rotation: Initial })
    // Sanity check before running
    expect(ReferenceSpace.localFloor).toBeTruthy()
    expect(getOptionalComponent(testEntity, XRAnchorComponent)).toBeTruthy()
    expect(getOptionalComponent(testEntity, XRAnchorComponent)?.anchor).toBeTruthy()
    const before = getComponent(testEntity, TransformComponent).rotation
    expect(before).not.toEqual(Expected)
    expect(before).toEqual(Initial)
    // Run and Check the result
    updateAnchor(testEntity)
    const result = getComponent(testEntity, TransformComponent).rotation
    expect(result).not.toEqual(Initial)
    expect(result).toEqual(Expected)
  })

  it('should not do anything if the `@param entity` does not have an XRAnchorComponent', () => {
    const Incorrect = new Quaternion(41, 42, 43, 44).normalize()
    const Initial = new Quaternion(5, 6, 7, 8).normalize()
    // Set the data as expected
    const position = new Vector3(20, 21, 22) as unknown as DOMPointReadOnly
    const rotation = Incorrect as unknown as DOMPointReadOnly
    function getPoseMock(_: XRSpace, __: XRSpace): XRPose | undefined {
      return {
        transform: {
          position: position,
          orientation: rotation
        }
      } as XRPose
    }
    getMutableState(XRState).xrFrame.merge({ getPose: getPoseMock })
    // setComponent(testEntity, XRAnchorComponent, { anchor: new MockXRAnchor() })
    setComponent(testEntity, TransformComponent, { rotation: Initial })
    // Sanity check before running
    expect(ReferenceSpace.localFloor).toBeTruthy()
    expect(getOptionalComponent(testEntity, XRAnchorComponent)).toBeFalsy()
    expect(getOptionalComponent(testEntity, XRAnchorComponent)?.anchor).toBeFalsy()
    const before = getComponent(testEntity, TransformComponent).rotation
    expect(before).toEqual(Initial)
    expect(before).not.toEqual(Incorrect)
    // Run and Check the result
    updateAnchor(testEntity)
    const result = getComponent(testEntity, TransformComponent).rotation
    expect(result).toEqual(Initial)
    expect(result).not.toEqual(Incorrect)
  })

  it('should not do anything if ReferenceSpace.localFloor is falsy', () => {
    const Incorrect = new Quaternion(41, 42, 43, 44).normalize()
    const Initial = new Quaternion(5, 6, 7, 8).normalize()
    // Set the data as expected
    const position = new Vector3(20, 21, 22) as unknown as DOMPointReadOnly
    const rotation = Incorrect as unknown as DOMPointReadOnly
    function getPoseMock(_: XRSpace, __: XRSpace): XRPose | undefined {
      return {
        transform: {
          position: position,
          orientation: rotation
        }
      } as XRPose
    }
    getMutableState(XRState).xrFrame.merge({ getPose: getPoseMock })
    setComponent(testEntity, XRAnchorComponent, { anchor: new MockXRAnchor() })
    setComponent(testEntity, TransformComponent, { rotation: Initial })
    ReferenceSpace.localFloor = null
    // Sanity check before running
    expect(ReferenceSpace.localFloor).toBeFalsy()
    expect(getOptionalComponent(testEntity, XRAnchorComponent)).toBeTruthy()
    expect(getOptionalComponent(testEntity, XRAnchorComponent)?.anchor).toBeTruthy()
    const before = getComponent(testEntity, TransformComponent).rotation
    expect(before).toEqual(Initial)
    expect(before).not.toEqual(Incorrect)
    // Run and Check the result
    updateAnchor(testEntity)
    const result = getComponent(testEntity, TransformComponent).rotation
    expect(result).toEqual(Initial)
    expect(result).not.toEqual(Incorrect)
  })

  it('should not do anything if ReferenceSpace.localFloor is truthy but `XRFrame.getPose` returns a falsy value', () => {
    const Incorrect = new Quaternion(41, 42, 43, 44).normalize()
    const Initial = new Quaternion(5, 6, 7, 8).normalize()
    // Set the data as expected
    function getPoseMock(_: XRSpace, __: XRSpace): XRPose | undefined {
      return undefined
    }
    getMutableState(XRState).xrFrame.merge({ getPose: getPoseMock })
    setComponent(testEntity, XRAnchorComponent, { anchor: new MockXRAnchor() })
    setComponent(testEntity, TransformComponent, { rotation: Initial })
    // Sanity check before running
    expect(ReferenceSpace.localFloor).toBeTruthy()
    expect(getPoseMock({} as XRSpace, {} as XRSpace)).toBeFalsy()
    expect(getOptionalComponent(testEntity, XRAnchorComponent)).toBeTruthy()
    expect(getOptionalComponent(testEntity, XRAnchorComponent)?.anchor).toBeTruthy()
    const before = getComponent(testEntity, TransformComponent).rotation
    expect(before).toEqual(Initial)
    expect(before).not.toEqual(Incorrect)
    // Run and Check the result
    updateAnchor(testEntity)
    const result = getComponent(testEntity, TransformComponent).rotation
    expect(result).toEqual(Initial)
    expect(result).not.toEqual(Incorrect)
  })
}) //:: updateAnchor

describe('updateScenePlacement', () => {
  let testEntity = UndefinedEntity

  beforeEach(async () => {
    createEngine()
    await mockEmulatedXREngine()
    testEntity = createEntity()
  })

  afterEach(() => {
    removeEntity(testEntity)
    destroyEmulatedXREngine()
    destroyEngine()
  })

  it('should set XRState.sceneScaleTarget to getTargetWorldSize(`@param scenePlacementEntity`.TransformComponent) when XRState.sceneScaleAutoMode is true', () => {
    const Expected = 1
    const Initial = 42
    // Set the data as expected
    getMutableState(XRState).sceneScaleTarget.set(Initial)
    setComponent(testEntity, TransformComponent)
    // Sanity check before running
    expect(getOptionalComponent(testEntity, TransformComponent)).toBeTruthy()
    expect(getState(XRState)).toBeTruthy()
    expect(getState(XRState).xrFrame).toBeTruthy()
    expect(getState(XRState).session).toBeTruthy()
    expect(hasComponents(testEntity, [TransformComponent])).toBe(true)
    expect(getState(XRState).sceneScaleAutoMode).toBe(true)
    const before = getState(XRState).sceneScaleTarget
    expect(before).toBe(Initial)
    expect(before).not.toBe(Expected)
    // Run and Check the result
    updateScenePlacement(testEntity)
    const result = getState(XRState).sceneScaleTarget
    expect(result).not.toBe(Initial)
    expect(result).toBe(Expected)
  })

  it('should set the value of XRState.sceneScale when XRState.sceneScale is not equal to XRState.sceneScaleTarget', () => {
    const Expected = 1
    const Initial = 42
    // Set the data as expected
    getMutableState(XRState).sceneScaleTarget.set(Initial)
    setComponent(testEntity, TransformComponent)
    // Sanity check before running
    expect(getOptionalComponent(testEntity, TransformComponent)).toBeTruthy()
    expect(getState(XRState)).toBeTruthy()
    expect(getState(XRState).xrFrame).toBeTruthy()
    expect(getState(XRState).session).toBeTruthy()
    expect(hasComponents(testEntity, [TransformComponent])).toBe(true)
    expect(getState(XRState).sceneScaleAutoMode).toBe(true)
    expect(getState(XRState).sceneScale).not.toEqual(getState(XRState).sceneScaleTarget)
    const before = getState(XRState).sceneScaleTarget
    expect(before).toBe(Initial)
    expect(before).not.toBe(Expected)
    // Run and Check the result
    updateScenePlacement(testEntity)
    const result = getState(XRState).sceneScale
    expect(result).not.toBe(Initial)
    expect(result).toBe(Expected)
  })

  it('should copy `@param scenePlacementEntity`.TransformComponent.position into XRState.scenePosition', () => {
    const Expected = new Vector3(40, 41, 42)
    const Initial = Vector3_Zero.clone()
    // Set the data as expected
    setComponent(testEntity, TransformComponent, { position: Expected })
    // Sanity check before running
    expect(getOptionalComponent(testEntity, TransformComponent)).toBeTruthy()
    expect(getState(XRState)).toBeTruthy()
    expect(getState(XRState).xrFrame).toBeTruthy()
    expect(getState(XRState).session).toBeTruthy()
    expect(hasComponents(testEntity, [TransformComponent])).toBe(true)
    expect(getState(XRState).sceneScaleAutoMode).toBe(true)
    expect(getState(XRState).sceneScale).toEqual(getState(XRState).sceneScaleTarget)
    const before = getState(XRState).scenePosition.clone()
    assertVec.approxEq(before, Initial, 3)
    assertVec.anyApproxNotEq(before, Expected, 3)
    // Run and Check the result
    updateScenePlacement(testEntity)
    const result = getState(XRState).scenePosition.clone()
    assertVec.anyApproxNotEq(result, Initial, 3)
    assertVec.approxEq(result, Expected, 3)
  })

  it('should set XRState.sceneRotation to the multiplication of `@param scenePlacementEntity`.TransformComponent.position and setFromAxisAngle(Vector3_Up, XRState.sceneRotationOffset)', () => {
    const Expected = new Quaternion(40, 41, 42, 43).normalize()
    const Initial = Q_IDENTITY
    // Set the data as expected
    setComponent(testEntity, TransformComponent, { rotation: Expected })
    // Sanity check before running
    expect(getOptionalComponent(testEntity, TransformComponent)).toBeTruthy()
    expect(getState(XRState)).toBeTruthy()
    expect(getState(XRState).xrFrame).toBeTruthy()
    expect(getState(XRState).session).toBeTruthy()
    expect(hasComponents(testEntity, [TransformComponent])).toBe(true)
    expect(getState(XRState).sceneScaleAutoMode).toBe(true)
    expect(getState(XRState).sceneScale).toEqual(getState(XRState).sceneScaleTarget)
    const before = getState(XRState).sceneRotation.clone()
    assertVec.approxEq(before, Initial, 4)
    assertVec.anyApproxNotEq(before, Expected, 4)
    // Run and Check the result
    updateScenePlacement(testEntity)
    const result = getState(XRState).sceneRotation.clone()
    assertVec.anyApproxNotEq(result, Initial, 4)
    assertVec.approxEq(result, Expected, 4)
  })

  it('should not do anything if `@param scenePlacementEntity`.TransformComponent is falsy', () => {
    const Expected = 42
    const Initial = 21
    // Set the data as expected
    getMutableState(XRState).sceneScaleTarget.set(Initial)
    // setComponent(testEntity, TransformComponent)
    // Sanity check before running
    expect(getOptionalComponent(testEntity, TransformComponent)).toBeFalsy()
    expect(getState(XRState)).toBeTruthy()
    expect(getState(XRState).xrFrame).toBeTruthy()
    expect(getState(XRState).session).toBeTruthy()
    // expect(hasComponents(testEntity, [TransformComponent])).toBe(true)
    expect(getState(XRState).sceneScaleAutoMode).toBe(true)
    const before = getState(XRState).sceneScaleTarget
    expect(before).toBe(Initial)
    expect(before).not.toBe(Expected)
    // Run and Check the result
    updateScenePlacement(testEntity)
    const result = getState(XRState).sceneScaleTarget
    expect(result).toBe(Initial)
    expect(result).not.toBe(Expected)
  })

  it('should not do anything if XRState.xrFrame is falsy', () => {
    const Expected = 42
    const Initial = 21
    // Set the data as expected
    getMutableState(XRState).sceneScaleTarget.set(Initial)
    setComponent(testEntity, TransformComponent)
    getMutableState(XRState).xrFrame.set(null)
    // Sanity check before running
    expect(getOptionalComponent(testEntity, TransformComponent)).toBeTruthy()
    expect(getState(XRState)).toBeTruthy()
    expect(getState(XRState).xrFrame).toBeFalsy()
    expect(getState(XRState).session).toBeTruthy()
    expect(hasComponents(testEntity, [TransformComponent])).toBe(true)
    expect(getState(XRState).sceneScaleAutoMode).toBe(true)
    const before = getState(XRState).sceneScaleTarget
    expect(before).toBe(Initial)
    expect(before).not.toBe(Expected)
    // Run and Check the result
    updateScenePlacement(testEntity)
    const result = getState(XRState).sceneScaleTarget
    expect(result).toBe(Initial)
    expect(result).not.toBe(Expected)
  })

  it('should not do anything if XRState.session is falsy', () => {
    const Expected = 42
    const Initial = 21
    // Set the data as expected
    getMutableState(XRState).sceneScaleTarget.set(Initial)
    setComponent(testEntity, TransformComponent)
    getMutableState(XRState).session.set(null)
    // Sanity check before running
    expect(getOptionalComponent(testEntity, TransformComponent)).toBeTruthy()
    expect(getState(XRState)).toBeTruthy()
    expect(getState(XRState).xrFrame).toBeTruthy()
    expect(getState(XRState).session).toBeFalsy()
    expect(hasComponents(testEntity, [TransformComponent])).toBe(true)
    expect(getState(XRState).sceneScaleAutoMode).toBe(true)
    const before = getState(XRState).sceneScaleTarget
    expect(before).toBe(Initial)
    expect(before).not.toBe(Expected)
    // Run and Check the result
    updateScenePlacement(testEntity)
    const result = getState(XRState).sceneScaleTarget
    expect(result).toBe(Initial)
    expect(result).not.toBe(Expected)
  })
}) //:: updateScenePlacement

describe('updateHitTest', () => {
  let testEntity = UndefinedEntity

  beforeEach(async () => {
    createEngine()
    await mockEmulatedXREngine()
    testEntity = createEntity()
  })

  afterEach(() => {
    removeEntity(testEntity)
    destroyEmulatedXREngine()
    destroyEngine()
  })

  function getPoseDummy() {}
  function getPoseFalsy(_: XRSpace): XRPose | undefined {
    return undefined
  }
  function getPoseTruthy(_: XRSpace): XRPose | undefined {
    return {
      transform: {
        position: Vector3_Zero.clone(),
        orientation: Q_IDENTITY.clone()
      } as unknown as XRRigidTransform
    } as unknown as XRPose
  }

  it('should set `@param entity`.XRHitTestComponent.results to the output of XRFrame.getHitTestResults', () => {
    const Expected = [{ getPose: getPoseDummy }, { getPose: getPoseDummy }] as XRHitTestResult[]
    const Initial = [{ getPose: getPoseDummy }] as XRHitTestResult[]
    // Set the data as expected
    const source = {} as XRHitTestSource
    setComponent(testEntity, XRHitTestComponent, { results: Initial, source: source })
    getMutableState(XRState).xrFrame.merge({ getHitTestResults: (_: XRHitTestSource) => Expected })
    // Sanity check before running
    expect(hasComponents(testEntity, [XRHitTestComponent])).toBe(true)
    expect(getComponent(testEntity, XRHitTestComponent).source).toBeTruthy()
    const before = getComponent(testEntity, XRHitTestComponent).results
    expect(before).toEqual(Initial)
    expect(before).not.toEqual(Expected)
    // Run and Check the result
    updateHitTest(testEntity)
    const result = getComponent(testEntity, XRHitTestComponent).results
    expect(result).not.toEqual(Initial)
    expect(result).toEqual(Expected)
  })

  it('should set `@param entity`.EntityTreeComponent.parentEntity to EngineState.localFloorEntity', () => {
    const Expected = getState(EngineState).localFloorEntity
    const Initial = undefined
    // Set the data as expected
    const source = {} as XRHitTestSource
    setComponent(testEntity, XRHitTestComponent, { results: [] as XRHitTestResult[], source: source })
    setComponent(testEntity, TransformComponent)
    const hitTestResults = [{ getPose: getPoseTruthy }] as XRHitTestResult[]
    getMutableState(XRState).xrFrame.merge({ getHitTestResults: (_: XRHitTestSource) => hitTestResults })
    // Sanity check before running
    expect(hasComponents(testEntity, [XRHitTestComponent, TransformComponent])).toBe(true)
    expect(hasComponents(testEntity, [EntityTreeComponent])).toBe(false)
    expect(getComponent(testEntity, XRHitTestComponent).source).toBeTruthy()
    expect(getState(XRState).xrFrame?.getHitTestResults(source).length).not.toBe(0)
    expect(
      getState(XRState)
        .xrFrame?.getHitTestResults(source)[0]
        .getPose({} as XRSpace)
    ).toBeTruthy()
    const before = getOptionalComponent(testEntity, EntityTreeComponent)?.parentEntity
    expect(before).toEqual(Initial)
    expect(before).not.toEqual(Expected)
    // Run and Check the result
    updateHitTest(testEntity)
    const result = getOptionalComponent(testEntity, EntityTreeComponent)?.parentEntity
    expect(result).not.toEqual(Initial)
    expect(result).toEqual(Expected)
  })

  it('should set `@param entity`.TransformComponent.position to the value of hitTestResults[0].getPose(ReferenceSpace.localFloor).transform.position', () => {
    const Expected = new Vector3(40, 41, 42)
    const Initial = new Vector3(20, 21, 22)
    // Set the data as expected
    const position = Expected
    const rotation = Q_IDENTITY.clone()
    function getPoseExpected(_: XRSpace): XRPose | undefined {
      return {
        transform: {
          position: position,
          orientation: rotation
        } as unknown as XRRigidTransform
      } as unknown as XRPose
    }
    const source = {} as XRHitTestSource
    setComponent(testEntity, XRHitTestComponent, { results: [] as XRHitTestResult[], source: source })
    setComponent(testEntity, TransformComponent, { position: Initial })
    const hitTestResults = [{ getPose: getPoseExpected }] as XRHitTestResult[]
    getMutableState(XRState).xrFrame.merge({ getHitTestResults: (_: XRHitTestSource) => hitTestResults })
    // Sanity check before running
    expect(hasComponents(testEntity, [XRHitTestComponent, TransformComponent])).toBe(true)
    expect(hasComponents(testEntity, [EntityTreeComponent])).toBe(false)
    expect(getComponent(testEntity, XRHitTestComponent).source).toBeTruthy()
    expect(getState(XRState).xrFrame?.getHitTestResults(source).length).not.toBe(0)
    expect(
      getState(XRState)
        .xrFrame?.getHitTestResults(source)[0]
        .getPose({} as XRSpace)
    ).toBeTruthy()
    const before = getOptionalComponent(testEntity, TransformComponent)?.position
    assertVec.approxEq(before, Initial, 3)
    assertVec.anyApproxNotEq(before, Expected, 3)
    // Run and Check the result
    updateHitTest(testEntity)
    const result = getOptionalComponent(testEntity, TransformComponent)?.position
    assertVec.anyApproxNotEq(result, Initial, 3)
    assertVec.approxEq(result, Expected, 3)
  })

  it('should set `@param entity`.TransformComponent.rotation to the value of hitTestResults[0].getPose(ReferenceSpace.localFloor).transform.orientation', () => {
    const Expected = new Quaternion(40, 41, 42, 43).normalize()
    const Initial = new Quaternion(20, 21, 22, 23).normalize()
    // Set the data as expected
    const position = Vector3_Zero.clone()
    const rotation = Expected
    function getPoseExpected(_: XRSpace): XRPose | undefined {
      return {
        transform: {
          position: position,
          orientation: rotation
        } as unknown as XRRigidTransform
      } as unknown as XRPose
    }
    const source = {} as XRHitTestSource
    setComponent(testEntity, XRHitTestComponent, { results: [] as XRHitTestResult[], source: source })
    setComponent(testEntity, TransformComponent, { rotation: Initial })
    const hitTestResults = [{ getPose: getPoseExpected }] as XRHitTestResult[]
    getMutableState(XRState).xrFrame.merge({ getHitTestResults: (_: XRHitTestSource) => hitTestResults })
    // Sanity check before running
    expect(hasComponents(testEntity, [XRHitTestComponent, TransformComponent])).toBe(true)
    expect(hasComponents(testEntity, [EntityTreeComponent])).toBe(false)
    expect(getComponent(testEntity, XRHitTestComponent).source).toBeTruthy()
    expect(getState(XRState).xrFrame?.getHitTestResults(source).length).not.toBe(0)
    expect(
      getState(XRState)
        .xrFrame?.getHitTestResults(source)[0]
        .getPose({} as XRSpace)
    ).toBeTruthy()
    const before = getOptionalComponent(testEntity, TransformComponent)?.rotation
    assertVec.approxEq(before, Initial, 3)
    assertVec.anyApproxNotEq(before, Expected, 3)
    // Run and Check the result
    updateHitTest(testEntity)
    const result = getOptionalComponent(testEntity, TransformComponent)?.rotation
    assertVec.anyApproxNotEq(result, Initial, 3)
    assertVec.approxEq(result, Expected, 3)
  })

  it('should not do anything if `@param entity`.XRHitTestComponent.source.value is falsy', () => {
    const Expected = [{ getPose: getPoseDummy }, { getPose: getPoseDummy }] as XRHitTestResult[]
    const Initial = [{ getPose: getPoseDummy }] as XRHitTestResult[]
    // Set the data as expected
    const source = undefined as XRHitTestSource | undefined
    setComponent(testEntity, XRHitTestComponent, { results: Initial, source: source })
    getMutableState(XRState).xrFrame.merge({ getHitTestResults: (_: XRHitTestSource) => Expected })
    // Sanity check before running
    expect(hasComponents(testEntity, [XRHitTestComponent])).toBe(true)
    expect(getComponent(testEntity, XRHitTestComponent).source).toBeFalsy()
    const before = getComponent(testEntity, XRHitTestComponent).results
    expect(before).toEqual(Initial)
    expect(before).not.toEqual(Expected)
    // Run and Check the result
    updateHitTest(testEntity)
    const result = getComponent(testEntity, XRHitTestComponent).results
    expect(result).toEqual(Initial)
    expect(result).not.toEqual(Expected)
  })

  it('should return early if XRFrame.getHitTestResults returns an array with length 0', () => {
    const Expected = getState(EngineState).localFloorEntity
    const Initial = undefined
    // Set the data as expected
    const source = {} as XRHitTestSource
    setComponent(testEntity, XRHitTestComponent, { results: [] as XRHitTestResult[], source: source })
    setComponent(testEntity, TransformComponent)
    const hitTestResults = [] as XRHitTestResult[]
    getMutableState(XRState).xrFrame.merge({ getHitTestResults: (_: XRHitTestSource) => hitTestResults })
    // Sanity check before running
    expect(hasComponents(testEntity, [XRHitTestComponent, TransformComponent])).toBe(true)
    expect(hasComponents(testEntity, [EntityTreeComponent])).toBe(false)
    expect(getComponent(testEntity, XRHitTestComponent).source).toBeTruthy()
    expect(getState(XRState).xrFrame?.getHitTestResults(source).length).toBe(0)
    // expect(getState(XRState).xrFrame?.getHitTestResults(source)[0].getPose({} as XRSpace)).toBeTruthy()
    const before = getOptionalComponent(testEntity, EntityTreeComponent)?.parentEntity
    expect(before).toEqual(Initial)
    expect(before).not.toEqual(Expected)
    // Run and Check the result
    updateHitTest(testEntity)
    const result = getOptionalComponent(testEntity, EntityTreeComponent)?.parentEntity
    expect(result).toEqual(Initial)
    expect(result).not.toEqual(Expected)
  })

  it('should return early if hitTestResults[0].getPose(ReferenceSpace.localFloor) is falsy', () => {
    const Expected = getState(EngineState).localFloorEntity
    const Initial = undefined
    // Set the data as expected
    const source = {} as XRHitTestSource
    setComponent(testEntity, XRHitTestComponent, { results: [] as XRHitTestResult[], source: source })
    setComponent(testEntity, TransformComponent)
    const hitTestResults = [{ getPose: getPoseFalsy }] as XRHitTestResult[]
    getMutableState(XRState).xrFrame.merge({ getHitTestResults: (_: XRHitTestSource) => hitTestResults })
    // Sanity check before running
    expect(hasComponents(testEntity, [XRHitTestComponent, TransformComponent])).toBe(true)
    expect(hasComponents(testEntity, [EntityTreeComponent])).toBe(false)
    expect(getComponent(testEntity, XRHitTestComponent).source).toBeTruthy()
    expect(getState(XRState).xrFrame?.getHitTestResults(source).length).not.toBe(0)
    expect(
      getState(XRState)
        .xrFrame?.getHitTestResults(source)[0]
        .getPose({} as XRSpace)
    ).toBeFalsy()
    const before = getOptionalComponent(testEntity, EntityTreeComponent)?.parentEntity
    expect(before).toEqual(Initial)
    expect(before).not.toEqual(Expected)
    // Run and Check the result
    updateHitTest(testEntity)
    const result = getOptionalComponent(testEntity, EntityTreeComponent)?.parentEntity
    expect(result).toEqual(Initial)
    expect(result).not.toEqual(Expected)
  })
}) //:: updateHitTest

describe('XRAnchorSystemState', () => {
  it('should initialize the *State.name field with the expected value', () => {
    expect(XRAnchorSystemState.name).toBe('XRAnchorSystemState')
  })

  it('should initialize the *State.initial field with the expected value', () => {
    expect(XRAnchorSystemState.initial).toEqual({
      scenePlacementEntity: UndefinedEntity,
      originAnchorEntity: UndefinedEntity
    })
  })
}) //:: XRAnchorSystemState

describe('XRAnchorSystem', () => {
  const System = SystemDefinitions.get(XRAnchorSystem)!

  beforeEach(async () => {
    createEngine()
    await mockEmulatedXREngine()
  })

  afterEach(() => {
    destroyEmulatedXREngine()
    destroyEngine()
  })

  describe('Fields', () => {
    it('should initialize the *System.uuid field with the expected value', () => {
      expect(System.uuid).toBe('ee.engine.XRAnchorSystem')
    })

    it('should initialize the *System with the expected SystemUUID value', () => {
      expect(XRAnchorSystem).toBe('ee.engine.XRAnchorSystem' as SystemUUID)
    })

    it('should initialize the *System.insert field with the expected value', () => {
      expect(System.insert).not.toBe(undefined)
      expect(System.insert!.after).not.toBe(undefined)
      expect(System.insert!.after!).toBe(XRCameraUpdateSystem)
    })
  }) //:: Fields

  /** @todo */
  describe('execute', () => {}) //:: execute
  describe('reactor', () => {}) //:: reactor
}) //:: XRAnchorSystem
