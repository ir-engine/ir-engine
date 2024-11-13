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
  hasComponent,
  removeComponent,
  removeEntity,
  setComponent
} from '@ir-engine/ecs'
import { getMutableState } from '@ir-engine/hyperflux'
import assert from 'assert'
import { Raycaster } from 'three'
import { afterEach, beforeEach, describe, it } from 'vitest'
import { assertArrayEqual } from '../../../tests/util/mathAssertions'
import { XRHandComponent, XRSpaceComponent } from '../../xr/XRComponents'
import { XRState } from '../../xr/XRState'
import { ButtonStateMap } from '../state/ButtonState'
import { InputState } from '../state/InputState'
import { DefaultButtonAlias } from './InputComponent'
import { InputSourceComponent } from './InputSourceComponent'

/** @note Intersection types used, but not exported or declared, by InputSourceComponent */
type Intersection = { entity: Entity; distance: number }
type IntersectionList = Array<Intersection>
/** @note ButtonStateMap, aliased to its required type for ergonomics */
type ButtonStateMapAlias = Readonly<ButtonStateMap<typeof DefaultButtonAlias>>

describe.skip('InputSourceComponent', () => {
  // beforeEach(() => {
  //   createEngine()
  // })
  // it('should able to be set as a component', () => {
  //   const mockXRInputSource = new MockXRInputSource({
  //     handedness: 'left',
  //     targetRayMode: 'screen',
  //     targetRaySpace: new MockXRSpace() as XRSpace,
  //     gripSpace: undefined,
  //     gamepad: undefined,
  //     profiles: ['test'],
  //     hand: undefined
  //   }) as XRInputSource
  //   const entity = Engine.instance.localFloorEntity
  //   setComponent(entity, InputSourceComponent, { source: mockXRInputSource })
  //   assert(hasComponent(entity, InputSourceComponent))
  //   const inputSourceComponent = getComponent(entity, InputSourceComponent)
  //   let isAssignedButtons = InputSourceComponent.isAssignedButtons(entity)
  //   let isAssignedAxes = InputSourceComponent.isAssignedAxes(entity)
  //   assert(!isAssignedButtons)
  //   assert(!isAssignedAxes)
  //   inputSourceComponent.assignedAxesEntity = entity
  //   inputSourceComponent.assignedButtonEntity = entity
  //   setComponent(entity, InputComponent)
  //   const inputComponent = getComponent(entity, InputComponent)
  //   inputComponent.inputSources.push(entity)
  //   isAssignedButtons = InputSourceComponent.isAssignedButtons(entity)
  //   isAssignedAxes = InputSourceComponent.isAssignedAxes(entity)
  //   assert(isAssignedButtons)
  //   assert(isAssignedAxes)
  // })
  // it('should capture and release buttons and axes', () => {
  //   const mockXRInputSource = new MockXRInputSource({
  //     handedness: 'left',
  //     targetRayMode: 'screen',
  //     targetRaySpace: new MockXRSpace() as XRSpace,
  //     gripSpace: undefined,
  //     gamepad: undefined,
  //     profiles: ['test'],
  //     hand: undefined
  //   }) as XRInputSource
  //   const entity = Engine.instance.localFloorEntity
  //   setComponent(entity, InputSourceComponent, { source: mockXRInputSource })
  //   const hands = ['left', 'right', 'none']
  //   const state = getMutableState(InputSourceCaptureState)
  //   InputSourceComponent.captureButtons(entity)
  //   hands.forEach((hand) => {
  //     assert(state.buttons[hand].get() === entity)
  //   })
  //   InputSourceComponent.releaseButtons()
  //   hands.forEach((hand) => {
  //     assert(state.buttons[hand].get() === 0)
  //   })
  //   InputSourceComponent.captureAxes(entity)
  //   hands.forEach((hand) => {
  //     assert(state.axes[hand].get() === entity)
  //   })
  //   InputSourceComponent.releaseAxes()
  //   hands.forEach((hand) => {
  //     assert(state.axes[hand].get() === 0)
  //   })
  //   InputSourceComponent.capture(entity)
  //   hands.forEach((hand) => {
  //     assert(state.buttons[hand].get() === entity)
  //     assert(state.axes[hand].get() === entity)
  //   })
  //   InputSourceComponent.release()
  //   hands.forEach((hand) => {
  //     assert(state.buttons[hand].get() === 0)
  //     assert(state.axes[hand].get() === 0)
  //   })
  // })
  // it('assigns input source button entity reactively', async () => {
  //   const mockXRInputSource = new MockXRInputSource({
  //     handedness: 'left',
  //     targetRayMode: 'screen',
  //     targetRaySpace: new MockXRSpace() as XRSpace,
  //     gripSpace: undefined,
  //     gamepad: undefined,
  //     profiles: ['test'],
  //     hand: undefined
  //   }) as XRInputSource
  //   const entity = createEntity()
  //   getMutableState(InputSourceCaptureState).buttons.set({
  //     left: entity
  //   } as any)
  //   setComponent(entity, InputSourceComponent, { source: mockXRInputSource })
  //   const Reactor = InputSourceComponent.reactor
  //   const tag = <Reactor />
  //   const { rerender, unmount } = render(tag)
  //   await act(() => rerender(tag))
  //   const inputSource = getComponent(entity, InputSourceComponent)
  //   assert(inputSource.assignedButtonEntity === entity)
  //   assert(hasComponent(entity, InputSourceButtonsCapturedComponent))
  //   unmount()
  // })
  // it('assigns input source axes entity reactively', async () => {
  //   const mockXRInputSource = new MockXRInputSource({
  //     handedness: 'left',
  //     targetRayMode: 'screen',
  //     targetRaySpace: new MockXRSpace() as XRSpace,
  //     gripSpace: undefined,
  //     gamepad: undefined,
  //     profiles: ['test'],
  //     hand: undefined
  //   }) as XRInputSource
  //   const entity = createEntity()
  //   getMutableState(InputSourceCaptureState).axes.set({
  //     left: entity
  //   } as any)
  //   setComponent(entity, InputSourceComponent, { source: mockXRInputSource })
  //   const Reactor = InputSourceComponent.reactor
  //   const tag = <Reactor />
  //   const { rerender, unmount } = render(tag)
  //   await act(() => rerender(tag))
  //   const inputSource = getComponent(entity, InputSourceComponent)
  //   assert(inputSource.assignedAxesEntity === entity)
  //   assert(hasComponent(entity, InputSourceAxesCapturedComponent))
  //   unmount()
  // })
  // afterEach(() => {
  //   return destroyEngine()
  // })
})

const InputSourceComponentReliableDefaults = {
  source: {
    gamepad: {
      axes: [0, 0, 0, 0],
      buttons: [],
      connected: true,
      hapticActuators: [],
      // id: 'emulated-gamepad-1',  // @note The attached number is unreliable on tests. Requires the entity number
      index: 0,
      mapping: '' as GamepadMappingType,
      // timestamp: performance.now(),  // @note Unreliable on tests
      vibrationActuator: null
    },
    gripSpace: undefined,
    hand: undefined,
    handedness: 'none',
    profiles: [],
    targetRayMode: 'screen',
    targetRaySpace: {}
  } as unknown as XRInputSource,
  buttons: {} as ButtonStateMapAlias,
  raycaster: new Raycaster(),
  intersections: [] as Array<{ entity: Entity; distance: number }>
}

function assertXRInputSourceEq(A: XRInputSource, B: XRInputSource) {
  assert.equal(A.gamepad?.axes.length, B.gamepad?.axes.length)
  assert.equal(A.gamepad?.axes[0], B.gamepad?.axes[0])
  assert.equal(A.gamepad?.axes[1], B.gamepad?.axes[1])
  assert.equal(A.gamepad?.axes[2], B.gamepad?.axes[2])
  assert.equal(A.gamepad?.axes[3], B.gamepad?.axes[3])
  assert.equal(A.gamepad?.buttons.length, B.gamepad?.buttons.length)
  assert.equal(A.gamepad?.connected, B.gamepad?.connected)
  // assert.equal(A.gamepad?.id, B.gamepad?.id) // @see ReliableDefaults for why this is disabled
  assert.equal(A.gamepad?.index, B.gamepad?.index)
  assert.equal(A.gamepad?.mapping, B.gamepad?.mapping)
  assert.equal(A.gamepad?.vibrationActuator, B.gamepad?.vibrationActuator)
  assert.equal(A.gripSpace, B.gripSpace)
  assert.equal(A.hand, B.hand)
  assert.equal(A.handedness, B.handedness)
  assert.equal(A.profiles.length, B.profiles.length)
  assert.equal(A.targetRayMode, B.targetRayMode)
  assert.deepEqual(A.targetRaySpace, B.targetRaySpace)
}

function assertInputSourceComponentEq(A, B) {
  assert.equal(typeof A, typeof B)
  assertXRInputSourceEq(A.source, B.source)
  assert.deepEqual(A.buttons, B.buttons)
  assert.deepEqual(A.raycaster, B.raycaster)
  assert.deepEqual(A.intersections, B.intersections)
}

describe('InputSourceComponent', () => {
  describe('IDs', () => {
    it('should initialize the InputSourceComponent.name field with the expected value', () => {
      assert.equal(InputSourceComponent.name, 'InputSourceComponent')
    })
  })

  describe('onInit', () => {
    let testEntity = UndefinedEntity

    beforeEach(async () => {
      createEngine()
      testEntity = createEntity()
      setComponent(testEntity, InputSourceComponent)
    })

    afterEach(() => {
      removeEntity(testEntity)
      return destroyEngine()
    })

    it('should initialize the component with the expected default values', () => {
      const data = getComponent(testEntity, InputSourceComponent)
      assertInputSourceComponentEq(data, InputSourceComponentReliableDefaults)
    })
  }) // << onInit

  describe('onSet', () => {
    let testEntity = UndefinedEntity

    beforeEach(async () => {
      createEngine()
      testEntity = createEntity()
      setComponent(testEntity, InputSourceComponent)
    })

    afterEach(() => {
      removeEntity(testEntity)
      return destroyEngine()
    })

    it("should set the component's data to the given values", () => {
      const data = getComponent(testEntity, InputSourceComponent)
      assertInputSourceComponentEq(data, InputSourceComponentReliableDefaults)
      const Expected = {
        source: {
          gamepad: {
            axes: [-1, 1, -1, 1],
            buttons: [],
            connected: false,
            hapticActuators: [],
            index: 42,
            mapping: 'xr-standard' as GamepadMappingType,
            vibrationActuator: {} as GamepadHapticActuator
          },
          gripSpace: undefined,
          hand: undefined,
          handedness: 'none',
          profiles: [],
          targetRayMode: 'screen',
          targetRaySpace: null // @note Setting this to a value crashes this test with an error
        } as unknown as XRInputSource,
        buttons: {} as ButtonStateMapAlias,
        raycaster: new Raycaster(),
        intersections: [] as Array<{ entity: Entity; distance: number }>
      }
      setComponent(testEntity, InputSourceComponent, Expected)
      const after = getComponent(testEntity, InputSourceComponent)
      assertInputSourceComponentEq(after, Expected)
    })

    it('should not add an XRSpaceComponent to the entity when setting the component without a `targetRaySpace` value', () => {
      const data = getComponent(testEntity, InputSourceComponent)
      assertInputSourceComponentEq(data, InputSourceComponentReliableDefaults)
      const Expected = {
        source: {
          gamepad: {
            axes: [-1, 1, -1, 1],
            buttons: [],
            connected: false,
            hapticActuators: [],
            index: 42,
            mapping: 'xr-standard' as GamepadMappingType,
            vibrationActuator: {} as GamepadHapticActuator
          },
          gripSpace: undefined,
          hand: undefined,
          handedness: 'none',
          profiles: [],
          targetRayMode: 'screen',
          targetRaySpace: null // @note Setting this to a value crashes this test with an error
        } as unknown as XRInputSource,
        buttons: {} as ButtonStateMapAlias,
        raycaster: new Raycaster(),
        intersections: [] as Array<{ entity: Entity; distance: number }>
      }
      setComponent(testEntity, InputSourceComponent, Expected)
      const after = getComponent(testEntity, InputSourceComponent)
      assertInputSourceComponentEq(after, Expected)
      assert.ok(!hasComponent(testEntity, XRSpaceComponent))
    })

    /**
    // @todo After the onSet simplification PR is merged in
    it("should add an XRSpaceComponent to the entity when setting the component with a valid `targetRaySpace` value", () => {
      const data = getComponent(testEntity, InputSourceComponent)
      assertInputSourceComponentEq(data, InputSourceComponentReliableDefaults)
      const Expected = {
        source: {
          gamepad: {
            axes: [-1, 1, -1, 1],
            buttons: [],
            connected: false,
            hapticActuators: [],
            index: 42,
            mapping: 'xr-standard' as GamepadMappingType,
            vibrationActuator: {} as GamepadHapticActuator,
          },
          gripSpace: undefined,
          hand: undefined,
          handedness: 'none',
          profiles: [],
          targetRayMode: 'tracked-pointer',
          targetRaySpace: {} as XRSpace, // @note Setting this to an invalid value will throw an error
        } as unknown as XRInputSource,
        buttons: {} as ButtonStateMapAlias,
        raycaster: new Raycaster(),
        intersections: [] as Array<{ entity: Entity; distance: number }>
      }
      setComponent(testEntity, InputSourceComponent, Expected)
      const after = getComponent(testEntity, InputSourceComponent)
      assertInputSourceComponentEq(after, Expected)
      assert.ok(hasComponent(testEntity, XRSpaceComponent))
    })
    */

    it('should throw an error when setting the component with an invalid source.targetRaySpace value', () => {
      const data = getComponent(testEntity, InputSourceComponent)
      assertInputSourceComponentEq(data, InputSourceComponentReliableDefaults)
      const Expected = {
        source: {
          gamepad: {
            axes: [-1, 1, -1, 1],
            buttons: [],
            connected: false,
            hapticActuators: [],
            index: 42,
            mapping: 'xr-standard' as GamepadMappingType,
            vibrationActuator: {} as GamepadHapticActuator
          },
          gripSpace: undefined,
          hand: undefined,
          handedness: 'none',
          profiles: [],
          targetRayMode: 'screen',
          targetRaySpace: {} // @note This empty object triggers the error
        } as unknown as XRInputSource,
        buttons: {} as ButtonStateMapAlias,
        raycaster: new Raycaster(),
        intersections: [] as Array<{ entity: Entity; distance: number }>
      }
      assert.throws(() => {
        setComponent(testEntity, InputSourceComponent, Expected)
      })
    })

    it('should add an XRHandComponent when we pass a valid source.hand value', () => {
      const data = getComponent(testEntity, InputSourceComponent)
      assertInputSourceComponentEq(data, InputSourceComponentReliableDefaults)
      const Expected = {
        source: {
          gamepad: {
            axes: [-1, 1, -1, 1],
            buttons: [],
            connected: false,
            hapticActuators: [],
            index: 42,
            mapping: 'xr-standard' as GamepadMappingType,
            vibrationActuator: {} as GamepadHapticActuator
          },
          gripSpace: undefined,
          hand: { WRIST: 42 } as XRHand,
          handedness: 'none',
          profiles: [],
          targetRayMode: 'screen',
          targetRaySpace: null // @note Setting this to a value crashes this test with an error
        } as unknown as XRInputSource,
        buttons: {} as ButtonStateMapAlias,
        raycaster: new Raycaster(),
        intersections: [] as Array<{ entity: Entity; distance: number }>
      }
      setComponent(testEntity, InputSourceComponent, Expected)
      const after = getComponent(testEntity, InputSourceComponent)
      assertInputSourceComponentEq(after, Expected)
      assert.ok(hasComponent(testEntity, XRHandComponent))
    })

    it('should not add an XRHandComponent when we pass an invalid source.hand value', () => {
      const data = getComponent(testEntity, InputSourceComponent)
      assertInputSourceComponentEq(data, InputSourceComponentReliableDefaults)
      const Expected = {
        source: {
          gamepad: {
            axes: [-1, 1, -1, 1],
            buttons: [],
            connected: false,
            hapticActuators: [],
            index: 42,
            mapping: 'xr-standard' as GamepadMappingType,
            vibrationActuator: {} as GamepadHapticActuator
          },
          gripSpace: undefined,
          hand: undefined,
          handedness: 'none',
          profiles: [],
          targetRayMode: 'screen',
          targetRaySpace: null // @note Setting this to a value crashes this test with an error
        } as unknown as XRInputSource,
        buttons: {} as ButtonStateMapAlias,
        raycaster: new Raycaster(),
        intersections: [] as Array<{ entity: Entity; distance: number }>
      }
      setComponent(testEntity, InputSourceComponent, Expected)
      const after = getComponent(testEntity, InputSourceComponent)
      assertInputSourceComponentEq(after, Expected)
      assert.ok(!hasComponent(testEntity, XRHandComponent))
    })
  }) // << onSet

  describe('nonCapturedInputSources', () => {
    let testEntity = UndefinedEntity

    beforeEach(async () => {
      createEngine()
      testEntity = createEntity()
      setComponent(testEntity, InputSourceComponent)
    })

    afterEach(() => {
      removeEntity(testEntity)
      return destroyEngine()
    })

    describe('when explicitly specifying an input ...', () => {
      it('... should return an empty array when given an empty list of source input entities', () => {
        const Expected = [] as Entity[]
        const result = InputSourceComponent.nonCapturedInputSources(Expected)
        assert.equal(result.length, Expected.length)
      })
      it('... should filter the entity set as the InputState.capturingEntity out of the input list', () => {
        const capturingEntity = createEntity()
        getMutableState(InputState).capturingEntity.set(capturingEntity)
        const result = InputSourceComponent.nonCapturedInputSources([testEntity, capturingEntity])
        const Expected = [testEntity] as Entity[]
        assertArrayEqual(result, Expected)
      })
    })

    describe('when not specifying an input ...', () => {
      it('... should return an array with all entities that have an InputSourceComponent and are not set as capturingEntity in InputState', () => {
        const capturingEntity = createEntity()
        setComponent(capturingEntity, InputSourceComponent) // Set capturingEntity as an InputSourceComponent
        getMutableState(InputState).capturingEntity.set(capturingEntity) // Set it as the capturing entity of InputState
        const Expected = [testEntity] as Entity[] // capturingEntity should NOT be returned back from the `inputSourceQuery()`
        const result = InputSourceComponent.nonCapturedInputSources()
        assertArrayEqual(result, Expected)
      })
    })
  }) // << nonCapturedInputSources

  describe('getPreferredInputSource', () => {
    let testEntity = UndefinedEntity

    beforeEach(async () => {
      createEngine()
      testEntity = createEntity()
      setComponent(testEntity, InputSourceComponent)
    })

    afterEach(() => {
      removeEntity(testEntity)
      return destroyEngine()
    })

    it('should return null if XRState.sessionActive is false', () => {
      getMutableState(XRState).sessionActive.set(false)
      const one = InputSourceComponent.getPreferredInputSource(true)
      assert.equal(one, null)
      const two = InputSourceComponent.getPreferredInputSource(false)
      assert.equal(two, null)
      const three = InputSourceComponent.getPreferredInputSource()
      assert.equal(three, null)
    })

    it('should return null if no entity with an InputSourceComponent was found', () => {
      removeComponent(testEntity, InputSourceComponent)
      const Handness = 'left'
      getMutableState(XRState).sessionActive.set(true)
      getMutableState(InputState).preferredHand.set(Handness)
      const one = InputSourceComponent.getPreferredInputSource(true)
      assert.equal(one, null)
      const two = InputSourceComponent.getPreferredInputSource(false)
      assert.equal(two, null)
      const three = InputSourceComponent.getPreferredInputSource()
      assert.equal(three, null)
    })

    it("should skip entities that have an InputSourceComponent, but its .source.handedness is set to 'none'", () => {
      // @note The default value for InputSourceComponent.source.handedness is 'none'
      const Handness = 'left'
      getMutableState(InputState).preferredHand.set(Handness)
      // getMutableComponent(testEntity, InputSourceComponent).source.handedness.set(Handness as XRHandedness)
      getMutableState(XRState).sessionActive.set(true)
      const result = InputSourceComponent.getPreferredInputSource()
      assert.equal(result, null)
    })

    describe('when offhand is passed as false ...', () => {
      it('... should return the source that has the same source.handedness as the one set in InputState.preferredHand', () => {
        const Handness = 'left'
        getMutableState(InputState).preferredHand.set(Handness)
        getMutableComponent(testEntity, InputSourceComponent).source.handedness.set(Handness as XRHandedness)
        getMutableState(XRState).sessionActive.set(true)
        const OtherHandness = 'right'
        const otherEntity = createEntity()
        setComponent(otherEntity, InputSourceComponent)
        getMutableComponent(otherEntity, InputSourceComponent).source.handedness.set(OtherHandness as XRHandedness)
        // Run and Check the result
        const result = InputSourceComponent.getPreferredInputSource()
        assert.ok(result)
        assert.equal(result.gamepad?.id, 'emulated-gamepad-' + testEntity)
        assert.notEqual(result.gamepad?.id, 'emulated-gamepad-' + otherEntity)
      })
    })
    describe('when offhand is omitted ...', () => {
      it('... should return the source that has the same source.handedness as the one set in InputState.preferredHand', () => {
        const Handness = 'left'
        getMutableState(InputState).preferredHand.set(Handness)
        getMutableComponent(testEntity, InputSourceComponent).source.handedness.set(Handness as XRHandedness)
        getMutableState(XRState).sessionActive.set(true)
        const OtherHandness = 'right'
        const otherEntity = createEntity()
        setComponent(otherEntity, InputSourceComponent)
        getMutableComponent(otherEntity, InputSourceComponent).source.handedness.set(OtherHandness as XRHandedness)
        // Run and Check the result
        const result = InputSourceComponent.getPreferredInputSource()
        assert.ok(result)
        assert.equal(result.gamepad?.id, 'emulated-gamepad-' + testEntity)
        assert.notEqual(result.gamepad?.id, 'emulated-gamepad-' + otherEntity)
      })
    })

    describe('when offhand is passed as true ...', () => {
      it('... should return the first source that does not have the same source.handedness as the one set in InputState.preferredHand', () => {
        const Handness = 'left'
        getMutableState(InputState).preferredHand.set(Handness)
        getMutableComponent(testEntity, InputSourceComponent).source.handedness.set(Handness as XRHandedness)
        getMutableState(XRState).sessionActive.set(true)
        const OneHandness = 'right'
        const TwoHandness = 'none'
        const oneEntity = createEntity()
        setComponent(oneEntity, InputSourceComponent)
        getMutableComponent(oneEntity, InputSourceComponent).source.handedness.set(OneHandness as XRHandedness)
        const twoEntity = createEntity()
        setComponent(twoEntity, InputSourceComponent)
        getMutableComponent(twoEntity, InputSourceComponent).source.handedness.set(TwoHandness as XRHandedness)
        // Run and Check the result
        const result = InputSourceComponent.getPreferredInputSource()
        assert.ok(result)
        assert.equal(result.gamepad?.id, 'emulated-gamepad-' + testEntity)
        assert.notEqual(result.gamepad?.id, 'emulated-gamepad-' + oneEntity)
        assert.notEqual(result.gamepad?.id, 'emulated-gamepad-' + twoEntity)
      })
    })
  }) // << getPreferredInputSource

  describe('getClosestIntersectedEntity', () => {
    let testEntity = UndefinedEntity

    beforeEach(async () => {
      createEngine()
      testEntity = createEntity()
      setComponent(testEntity, InputSourceComponent)
    })

    afterEach(() => {
      removeEntity(testEntity)
      return destroyEngine()
    })

    it('should return the entity stored at slot 0 of the InputSourceComponent.intersections list', () => {
      const Expected = [
        { entity: createEntity(), distance: 10_000 },
        { entity: createEntity(), distance: 46 & 2 }
      ] as IntersectionList
      getMutableComponent(testEntity, InputSourceComponent).intersections.set(Expected)
      const result = InputSourceComponent.getClosestIntersectedEntity(testEntity)
      assert.equal(result, Expected[0].entity)
    })
  }) // << getClosestIntersectedEntity

  describe('getClosestIntersection', () => {
    let testEntity = UndefinedEntity

    beforeEach(async () => {
      createEngine()
      testEntity = createEntity()
      setComponent(testEntity, InputSourceComponent)
    })

    afterEach(() => {
      removeEntity(testEntity)
      return destroyEngine()
    })

    it('should return the intersection stored at slot 0 of the InputSourceComponent.intersections list', () => {
      const Expected = [
        { entity: createEntity(), distance: 10_000 },
        { entity: createEntity(), distance: 46 & 2 }
      ] as IntersectionList
      getMutableComponent(testEntity, InputSourceComponent).intersections.set(Expected)
      const result = InputSourceComponent.getClosestIntersection(testEntity)
      assert.deepEqual(result, Expected[0])
    })
  })
})
