/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License") you may not use this file except in compliance
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

/**
 * MixerComponent.test.tsx
 *
 * Test suite for the MixerComponent, which provides property interpolation functionality.
 * These tests verify that the MixerComponent correctly:
 * - Tracks properties from target entities/components
 * - Stores and manages entries (keyframes) at specific coordinates
 * - Interpolates between entries based on the current coordinate
 * - Applies the interpolated values to the target properties
 * - Handles nested properties and various value types
 * - Properly serializes and deserializes its state
 */

import {
  createEngine,
  createEntity,
  defineComponent,
  deserializeComponent,
  destroyEngine,
  EngineState,
  Entity,
  getComponent,
  getMutableComponent,
  hasComponent,
  removeComponent,
  removeEntity,
  S,
  serializeComponent,
  setComponent,
  UUIDComponent
} from '@ir-engine/ecs'
import { getMutableState, UserID } from '@ir-engine/hyperflux'
import { T } from '@ir-engine/spatial/src/schema/schemaFunctions'
import { Vector3 } from 'three'
import { afterEach, assert, beforeEach, describe, it, vi } from 'vitest'
import { MixerComponent } from './MixerComponent'

const createEntityWithUUID = () => {
  const entity = createEntity()
  setComponent(entity, UUIDComponent, UUIDComponent.generateUUID())
  return entity
}

/**
 * Test component definition with various property types for testing the MixerComponent
 * Includes simple properties, nested objects, and vector types
 */
const testComponent = defineComponent({
  name: 'TestComponent',
  jsonID: 'EE_test',
  schema: S.Object({
    // Simple number properties
    x: S.Number(0),
    y: S.Number(0),
    z: S.Number(0),

    // Single property for simple tests
    simple: S.Number(0),

    // First-level nested object
    nested: S.Object({
      x: S.Number(0),
      y: S.Number(0)
    }),

    // Deeply nested object with vector and rotation
    deepNested: S.Object({
      position: T.Vec3(new Vector3(0, 0, 0)),
      rotation: S.Object({
        angle: S.Number(0)
      })
    })
  })
})

describe('MixerComponent.ts', async () => {
  describe('MixerComponent', () => {
    describe('Component', () => {
      beforeEach(async () => {
        createEngine()
        getMutableState(EngineState).userID.set('userId' as UserID)
      })

      afterEach(() => {
        return destroyEngine()
      })

      it('should set the MixerComponent name to MountPointComponent', () => {
        assert.equal(MixerComponent.name, 'MixerComponent')
      })

      it('should set the MixerComponent jsonID to IR_mixer', () => {
        assert.equal(MixerComponent.jsonID, 'IR_mixer')
      })

      it('should set the mixer component initial data', async () => {
        const mixerEntity = createEntityWithUUID()
        const customData = {
          coord: 0,
          properties: [],
          entries: [[0, {}] as [number, any]]
        }

        // Set component with custom data
        setComponent(mixerEntity, MixerComponent, customData)

        // Wait for reactor to initialize state
        await vi.waitUntil(() => getComponent(mixerEntity, MixerComponent).state != null)

        // Verify serialized data matches what we set
        const { state, ...componentData } = getComponent(mixerEntity, MixerComponent)
        assert.deepEqual(componentData, customData)

        // Verify internal state was properly initialized
        // The "state" property isn't serialized, so we check it separately
        assert.equal(state.properties.size, customData.properties.length)
        assert.equal(state.entriesByCoord.size, customData.entries.length)
        assert.equal(state.sortedEntries.length, customData.entries.length)
      })
    })

    describe('Properties', () => {
      let targetEntity: Entity
      let mixerEntity: Entity
      let mixerComp: any

      beforeEach(async () => {
        createEngine()
        getMutableState(EngineState).userID.set('userId' as UserID)

        mixerEntity = createEntityWithUUID()
        targetEntity = createEntityWithUUID()
        setComponent(targetEntity, testComponent)
        setComponent(mixerEntity, MixerComponent)
        await vi.waitUntil(() => getComponent(mixerEntity, MixerComponent).state != null)
        mixerComp = getComponent(mixerEntity, MixerComponent)
      })

      afterEach(() => {
        removeEntity(mixerEntity)
        removeEntity(targetEntity)
        return destroyEngine()
      })

      describe('addProperty', () => {
        it('should add a property to the mixer component, if it is found in the target entity', () => {
          const lastSize = mixerComp.properties.length
          MixerComponent.addProperty(mixerEntity, targetEntity, testComponent, 'x')
          assert.equal(mixerComp.properties.length, lastSize + 1)
          assert.equal(mixerComp.state.properties.size, lastSize + 1)
          assert.isTrue(mixerComp.state.properties.keys().next().value.endsWith('x'))
        })
        it('should not add a property to the mixer component if it already exists', () => {
          const lastSize = mixerComp.properties.length
          assert.isNotNull(MixerComponent.addProperty(mixerEntity, targetEntity, testComponent, 'x'))
          assert.equal(mixerComp.properties.length, lastSize + 1)
          assert.equal(mixerComp.state.properties.size, lastSize + 1)
        })
        it('should not add a property to the mixer component if it is not found in the target entity', () => {
          const lastSize = mixerComp.properties.length
          assert.isNull(MixerComponent.addProperty(mixerEntity, targetEntity, testComponent, 'fake'))
          assert.equal(mixerComp.properties.length, lastSize)
          assert.equal(mixerComp.state.properties.size, lastSize)
        })
      })

      describe('propertySetter', () => {
        it('should return a function that creates an entry partial for the property', () => {
          const x1Setter = MixerComponent.addProperty(mixerEntity, targetEntity, testComponent, 'x')!
          const x2Setter = MixerComponent.propertySetter(mixerEntity, targetEntity, testComponent, 'x')
          const xProperty = mixerComp.properties.find((prop: string) => prop.endsWith('x'))
          assert.isNotNull(x2Setter)

          // Test first setter
          const x1 = 0
          const x1Partial = x1Setter(x1)
          assert.deepEqual(x1Partial[xProperty][0], x1)

          // Test second setter (should be equivalent)
          const x2 = 1
          const x2Partial = x2Setter!(x2)
          assert.deepEqual(x2Partial[xProperty][0], x2)
        })
        it('should return null if the property was not added to the mixer', () => {
          assert.isNull(MixerComponent.propertySetter(mixerEntity, targetEntity, testComponent, 'fake'))
        })
      })

      describe('removeProperty', () => {
        it('should remove a property from the mixer component, if it is present', () => {
          MixerComponent.addProperty(mixerEntity, targetEntity, testComponent, 'x')
          MixerComponent.addProperty(mixerEntity, targetEntity, testComponent, 'y')
          const lastSize = mixerComp.properties.length

          // Removing one property shouldn't affect the other properties
          MixerComponent.removeProperty(mixerEntity, targetEntity, testComponent, 'x')
          assert.equal(mixerComp.properties.length, lastSize - 1)
          assert.equal(mixerComp.state.properties.size, lastSize - 1)
        })
      })
    })
    describe('Entries', () => {
      let targetEntity: Entity
      let mixerEntity: Entity
      let mixerComp: any

      beforeEach(async () => {
        createEngine()
        getMutableState(EngineState).userID.set('userId' as UserID)

        mixerEntity = createEntityWithUUID()
        targetEntity = createEntityWithUUID()
        setComponent(targetEntity, testComponent)
        setComponent(mixerEntity, MixerComponent)
        await vi.waitUntil(
          () =>
            getComponent(targetEntity, testComponent) != null && getComponent(mixerEntity, MixerComponent).state != null
        )
        mixerComp = getComponent(mixerEntity, MixerComponent)
      })

      afterEach(() => {
        removeEntity(mixerEntity)
        removeEntity(targetEntity)
        return destroyEngine()
      })

      describe('getDefaultEntry', () => {
        it('should return an entry with default values for all properties', () => {
          MixerComponent.addProperty(mixerEntity, targetEntity, testComponent, 'x')!
          const xProperty = mixerComp.properties.find((prop: string) => prop.endsWith('x'))
          const defaultValue = 0
          const defaultEntry = MixerComponent.getDefaultEntry(mixerEntity)
          assert.equal(defaultEntry[xProperty][0], defaultValue)
        })
      })

      describe('setEntry', () => {
        it('should set an entry at the given coord, overwriting any existing entry at that coord', () => {
          const xSetter = MixerComponent.addProperty(mixerEntity, targetEntity, testComponent, 'x')!
          const xProperty = mixerComp.properties.find((prop: string) => prop.endsWith('x'))
          const ySetter = MixerComponent.addProperty(mixerEntity, targetEntity, testComponent, 'y')!
          const yProperty = mixerComp.properties.find((prop: string) => prop.endsWith('y'))

          const coord = 3
          const value1 = 1
          const value2 = 2
          const defaultValue = 0
          const lastSize = mixerComp.entries.length

          // Test 1: Set entry with only x value
          const entry1 = MixerComponent.setEntry(mixerEntity, coord, { ...xSetter(value1) })
          // There should be one more entry than before
          assert.equal(mixerComp.entries.length, lastSize + 1)
          assert.equal(mixerComp.state.entriesByCoord.size, lastSize + 1)
          assert.isNotNull(entry1)
          assert.equal(entry1?.[xProperty]?.[0], value1)
          assert.equal(entry1?.[yProperty]?.[0], defaultValue)

          // Test 2: Set entry with both x and y values (overwriting previous entry)
          const entry2 = MixerComponent.setEntry(mixerEntity, coord, { ...xSetter(value2), ...ySetter(value2) })
          // This should not change the number of entries; it should overwrite the previous one
          assert.equal(mixerComp.entries.length, lastSize + 1)
          assert.equal(mixerComp.state.entriesByCoord.size, lastSize + 1)
          assert.notDeepEqual(entry2, entry1)
          assert.equal(entry2?.[xProperty][0], value2)
          assert.equal(entry2?.[yProperty][0], value2)
        })
      })

      describe('getEntry', () => {
        const coord = 3
        it('should return the entry at the given coord, if it exists', () => {
          const entry = MixerComponent.setEntry(mixerEntity, coord, {})
          assert.equal(MixerComponent.getEntry(mixerEntity, coord), entry)
        })
        it('should return null if the entry does not exist', () => {
          assert.isNull(MixerComponent.getEntry(mixerEntity, 3))
        })
      })

      describe('appendEntry', () => {
        it('should set an entry at the given coord, if one does not exist', () => {
          const coord = 3
          const lastSize = mixerComp.entries.length
          const entry = MixerComponent.appendEntry(mixerEntity, coord, {})
          assert.equal(mixerComp.entries.length, lastSize + 1)
          assert.equal(mixerComp.state.entriesByCoord.size, lastSize + 1)
          assert.isNotNull(entry)
        })
        it('should provide a value for any properties not set in the entry, that is mixed between the two closest entries, weighted by distance', () => {
          const xSetter = MixerComponent.addProperty(mixerEntity, targetEntity, testComponent, 'x')!
          const xProperty = mixerComp.properties.find((prop: string) => prop.endsWith('x'))

          // Create two entries at different coordinates
          const leftValue = 10
          const rightValue = 20
          const leftCoord = 10
          const rightCoord = 11
          const midCoord = 10.75 // 75% of the way from left to right

          // Set entries at left and right coordinates
          MixerComponent.setEntry(mixerEntity, leftCoord, xSetter(leftValue))
          MixerComponent.setEntry(mixerEntity, rightCoord, xSetter(rightValue))

          // Create entry at middle coordinate and verify interpolation
          const midEntry = MixerComponent.appendEntry(mixerEntity, midCoord, {})
          assert.equal(midEntry?.[xProperty][0], leftValue * 0.25 + rightValue * 0.75)
        })

        it('should change an existing entry, while leaving existing values unchanged', () => {
          const xSetter = MixerComponent.addProperty(mixerEntity, targetEntity, testComponent, 'x')!
          const xProperty = mixerComp.properties.find((prop: string) => prop.endsWith('x'))
          const ySetter = MixerComponent.addProperty(mixerEntity, targetEntity, testComponent, 'y')!
          const yProperty = mixerComp.properties.find((prop: string) => prop.endsWith('y'))
          const coord = 3
          const xValue = 1
          const yValue = 2
          const defaultValue = 0
          const lastSize = mixerComp.entries.length

          // Test 1: Create entry with only x value
          const entry1 = MixerComponent.appendEntry(mixerEntity, coord, { ...xSetter(xValue) })
          // There should be one more entry than before
          assert.equal(mixerComp.entries.length, lastSize + 1)
          assert.equal(mixerComp.state.entriesByCoord.size, lastSize + 1)
          assert.isNotNull(entry1)
          assert.equal(entry1?.[xProperty][0], xValue)
          assert.equal(entry1?.[yProperty][0], defaultValue)

          // Test 2: Append to existing entry with y value, x should remain unchanged
          const entry2 = MixerComponent.appendEntry(mixerEntity, coord, { ...ySetter(yValue) })
          // This should not change the number of entries; it should modify the previous one
          assert.equal(mixerComp.entries.length, lastSize + 1)
          assert.equal(mixerComp.state.entriesByCoord.size, lastSize + 1)
          // The entry should be a different object, with the new value for y
          assert.notEqual(entry2, entry1)
          assert.equal(entry2?.[xProperty][0], xValue)
          assert.equal(entry2?.[yProperty][0], yValue)
        })
      })

      describe('deleteEntry', () => {
        it('should delete the entry at the given coord, if it exists', () => {
          const coord1 = 0
          const coord2 = 1
          const coord3 = 2
          MixerComponent.setEntry(mixerEntity, coord1, {})
          MixerComponent.setEntry(mixerEntity, coord2, {})
          MixerComponent.setEntry(mixerEntity, coord3, {})

          // Store state before deletion
          const lastEntryCoords = [...mixerComp.state.entriesByCoord.keys()]
          const lastSize = mixerComp.entries.length

          // Delete one entry
          MixerComponent.deleteEntry(mixerEntity, coord1)

          // Verify entry was removed
          assert.equal(mixerComp.entries.length, lastSize - 1)
          assert.equal(mixerComp.state.entriesByCoord.size, lastSize - 1)

          // Verify remaining entries are correct
          const entryCoords = [...mixerComp.state.entriesByCoord.keys()]
          // The entriesByCoord in the mixer state should be the same as before, except for the deleted one
          assert.deepEqual(
            entryCoords,
            lastEntryCoords.filter((c) => c !== coord1)
          )
        })
      })
    })
    describe('Mixing', () => {
      let targetEntity: Entity
      let mixerEntity: Entity
      let mixerComp: any

      beforeEach(async () => {
        createEngine()
        getMutableState(EngineState).userID.set('userId' as UserID)

        mixerEntity = createEntityWithUUID()
        targetEntity = createEntityWithUUID()
        setComponent(targetEntity, testComponent)
        setComponent(mixerEntity, MixerComponent)
        await vi.waitUntil(
          () =>
            getComponent(targetEntity, testComponent) != null && getComponent(mixerEntity, MixerComponent).state != null
        )
        mixerComp = getComponent(mixerEntity, MixerComponent)
      })

      afterEach(() => {
        removeEntity(mixerEntity)
        removeEntity(targetEntity)
        return destroyEngine()
      })

      describe('getMixedEntry', () => {
        it('should return an entry that is the mixed value of the entries at the given coord, weighted by distance', () => {
          const xSetter = MixerComponent.addProperty(mixerEntity, targetEntity, testComponent, 'x')!
          const xProperty = mixerComp.properties.find((prop: string) => prop.endsWith('x'))

          // Create entries at two coordinates
          const leftValue = 10
          const rightValue = 20
          const leftCoord = 10
          const rightCoord = 11
          const midCoord = 10.75 // 75% of the way from left to right

          // Set entries
          MixerComponent.setEntry(mixerEntity, leftCoord, xSetter(leftValue))
          MixerComponent.setEntry(mixerEntity, rightCoord, xSetter(rightValue))

          // Get interpolated entry and verify
          const midEntry = MixerComponent.getMixedEntry(mixerEntity, midCoord)
          assert.equal(midEntry[xProperty][0], leftValue * 0.25 + rightValue * 0.75)
        })

        // Test getting entry at exact coordinate
        it('should return an entry that is deeply equal to the entry at the given coord, if it exists', () => {
          const xSetter = MixerComponent.addProperty(mixerEntity, targetEntity, testComponent, 'x')!
          const value = 10
          const coord = 10

          // Create entry
          const entry = MixerComponent.setEntry(mixerEntity, coord, xSetter(value))

          // Get mixed entry at exact coordinate
          const mixedEntry = MixerComponent.getMixedEntry(mixerEntity, coord)

          // Should be deeply equal but not the same object
          assert.notEqual(entry, mixedEntry)
          assert.deepEqual(entry, mixedEntry)
        })

        // Test getting entry outside the range
        it('should return an entry that is deeply equal to the nearest entry if the given coord is outside the range of entries', () => {
          const xSetter = MixerComponent.addProperty(mixerEntity, targetEntity, testComponent, 'x')!

          // Create entries
          const leftValue = 10
          const rightValue = 20
          const leftCoord = 10
          const rightCoord = 11
          const farCoord = 100 // Far outside the range

          MixerComponent.setEntry(mixerEntity, leftCoord, xSetter(leftValue))
          const rightEntry = MixerComponent.setEntry(mixerEntity, rightCoord, xSetter(rightValue))

          // Get entry far outside the range
          const farEntry = MixerComponent.getMixedEntry(mixerEntity, farCoord)

          // Should match the rightmost entry (nearest to farCoord)
          assert.notEqual(farEntry, rightEntry)
          assert.deepEqual(farEntry, rightEntry)
        })
      })

      describe('mix', () => {
        it('should set the target entity properties to the mixed value of the entries at the mixer coord', () => {
          const xSetter = MixerComponent.addProperty(mixerEntity, targetEntity, testComponent, 'x')!
          const leftValue = 10
          const rightValue = 20
          const leftCoord = 10
          const rightCoord = 11
          const midCoord = leftCoord * 0.25 + rightCoord * 0.75
          MixerComponent.setEntry(mixerEntity, leftCoord, xSetter(leftValue))
          MixerComponent.setEntry(mixerEntity, rightCoord, xSetter(rightValue))
          mixerComp.coord = midCoord
          MixerComponent.mix(mixerEntity)

          // Verify target property was updated with interpolated value
          const testComp = getComponent(targetEntity, testComponent)
          assert.equal(testComp.x, leftValue * 0.25 + rightValue * 0.75)
        })
      })
    })

    describe('Serialization', () => {
      let targetEntity: Entity
      let mixerEntity: Entity
      let mixerComp: any

      beforeEach(async () => {
        createEngine()
        getMutableState(EngineState).userID.set('userId' as UserID)

        mixerEntity = createEntityWithUUID()
        targetEntity = createEntityWithUUID()
        setComponent(targetEntity, testComponent)
        setComponent(mixerEntity, MixerComponent)
        await vi.waitUntil(
          () =>
            getComponent(targetEntity, testComponent) != null && getComponent(mixerEntity, MixerComponent).state != null
        )
        mixerComp = getComponent(mixerEntity, MixerComponent)
      })

      afterEach(() => {
        removeEntity(mixerEntity)
        removeEntity(targetEntity)
        return destroyEngine()
      })

      it('should correctly serialize and deserialize component data', async () => {
        // Set up properties and entries
        const xSetter = MixerComponent.addProperty(mixerEntity, targetEntity, testComponent, 'x')
        const ySetter = MixerComponent.addProperty(mixerEntity, targetEntity, testComponent, 'y')
        const xValue = 10
        const yValue = 20
        MixerComponent.setEntry(mixerEntity, 0, { ...xSetter?.(xValue), ...ySetter?.(yValue) })

        // Store original component data
        const { state: state1, ...componentData1 } = getComponent(mixerEntity, MixerComponent)

        // Serialize, remove, and deserialize component
        const serialized = serializeComponent(mixerEntity, MixerComponent)
        removeComponent(mixerEntity, MixerComponent)
        await vi.waitUntil(() => !hasComponent(mixerEntity, MixerComponent))
        deserializeComponent(mixerEntity, MixerComponent, serialized)

        // Wait for component to be reinitialized
        await vi.waitUntil(() => {
          mixerComp = getComponent(mixerEntity, MixerComponent)
          return mixerComp.state != null
        })

        // Verify serialized data matches original
        const { state: state2, ...componentData2 } = getComponent(mixerEntity, MixerComponent)
        assert.deepEqual(componentData2, componentData1)

        // The "state" property isn't serialized, so we check it separately
        // to verify the reactor is properly running:
        assert.deepEqual(state2.properties, state2.properties)
        assert.deepEqual(state2.sortedEntries, state2.sortedEntries)

        // Verify the deserialized component can still function
        MixerComponent.mix(mixerEntity)
        const testComp = getComponent(targetEntity, testComponent)
        assert.equal(testComp.x, xValue)
        assert.equal(testComp.y, yValue)
      })
    })
    describe('Reactor', () => {
      let targetEntity: Entity
      let mixerEntity: Entity
      let mixerComp: any
      let targetComp: any

      beforeEach(async () => {
        createEngine()
        getMutableState(EngineState).userID.set('userId' as UserID)

        mixerEntity = createEntityWithUUID()
        targetEntity = createEntityWithUUID()
        setComponent(targetEntity, testComponent)
        setComponent(mixerEntity, MixerComponent)
        await vi.waitUntil(() => {
          targetComp = getComponent(targetEntity, testComponent)
          mixerComp = getComponent(mixerEntity, MixerComponent)
          return targetComp != null && mixerComp.state != null
        })
      })

      afterEach(() => {
        removeEntity(mixerEntity)
        removeEntity(targetEntity)
        return destroyEngine()
      })

      /**
       * Tests for automatic mixing when coord changes
       */
      describe('coord', () => {
        it('should cause the target entity properties to be set to the mixed value of the entries at the mixer coord', async () => {
          // Set up property and entries
          const xSetter = MixerComponent.addProperty(mixerEntity, targetEntity, testComponent, 'x')!
          const leftValue = 10
          const rightValue = 20
          const leftCoord = 10
          const rightCoord = 11
          const midCoord = leftCoord * 0.25 + rightCoord * 0.75

          // Create entries
          MixerComponent.setEntry(mixerEntity, leftCoord, xSetter(leftValue))
          MixerComponent.setEntry(mixerEntity, rightCoord, xSetter(rightValue))

          // Change the coordinate using the mutable component
          getMutableComponent(mixerEntity, MixerComponent).coord.set(midCoord)

          // The reactor should automatically run and set the target entity properties
          await vi.waitUntil(() => targetComp.x === leftValue * 0.25 + rightValue * 0.75)
        })
      })
    })

    // Add tests for nested properties
    describe('Nested Properties', () => {
      let targetEntity: Entity
      let mixerEntity: Entity
      let mixerComp: any
      let targetComp: any

      beforeEach(async () => {
        createEngine()
        getMutableState(EngineState).userID.set('userId' as UserID)

        mixerEntity = createEntityWithUUID()
        targetEntity = createEntityWithUUID()
        setComponent(targetEntity, testComponent)
        setComponent(mixerEntity, MixerComponent)
        await vi.waitUntil(() => {
          targetComp = getComponent(targetEntity, testComponent)
          mixerComp = getComponent(mixerEntity, MixerComponent)
          return targetComp != null && mixerComp.state != null
        })
      })

      afterEach(() => {
        removeEntity(mixerEntity)
        removeEntity(targetEntity)
        return destroyEngine()
      })

      it('should support simple properties', async () => {
        const simpleSetter = MixerComponent.addProperty(mixerEntity, targetEntity, testComponent, 'simple')
        assert.isNotNull(simpleSetter)

        MixerComponent.setEntry(mixerEntity, 0, simpleSetter!(10))
        mixerComp.coord = 0
        MixerComponent.mix(mixerEntity)

        assert.equal(targetComp.simple, 10)
      })

      it('should support first-level nested properties', async () => {
        const nestedXSetter = MixerComponent.addProperty(mixerEntity, targetEntity, testComponent, 'nested.x')
        assert.isNotNull(nestedXSetter)

        MixerComponent.setEntry(mixerEntity, 0, nestedXSetter!(5))
        mixerComp.coord = 0
        MixerComponent.mix(mixerEntity)

        assert.equal(targetComp.nested.x, 5)
      })

      it('should support deeply nested properties', async () => {
        const deepNestedSetter = MixerComponent.addProperty(
          mixerEntity,
          targetEntity,
          testComponent,
          'deepNested.rotation.angle'
        )
        assert.isNotNull(deepNestedSetter)

        MixerComponent.setEntry(mixerEntity, 0, deepNestedSetter!(45))
        mixerComp.coord = 0
        MixerComponent.mix(mixerEntity)

        assert.equal(targetComp.deepNested.rotation.angle, 45)
      })

      it('should support vector properties', async () => {
        const positionSetter = MixerComponent.addProperty(
          mixerEntity,
          targetEntity,
          testComponent,
          'deepNested.position'
        )
        assert.isNotNull(positionSetter)

        // Set entry with vector value and apply
        MixerComponent.setEntry(mixerEntity, 0, positionSetter!(new Vector3(1, 2, 3)))
        mixerComp.coord = 0
        MixerComponent.mix(mixerEntity)

        // Verify vector components were updated
        assert.equal(targetComp.deepNested.position.x, 1)
        assert.equal(targetComp.deepNested.position.y, 2)
        assert.equal(targetComp.deepNested.position.z, 3)
      })

      it('should interpolate between entries with nested properties', async () => {
        const angleSetter = MixerComponent.addProperty(
          mixerEntity,
          targetEntity,
          testComponent,
          'deepNested.rotation.angle'
        )
        assert.isNotNull(angleSetter)

        // Set two entries at different coordinates
        MixerComponent.setEntry(mixerEntity, 0, angleSetter!(0))
        MixerComponent.setEntry(mixerEntity, 10, angleSetter!(100))

        // Set the mixer to halfway between the entries
        mixerComp.coord = 5
        MixerComponent.mix(mixerEntity)

        // Verify interpolation worked correctly
        assert.equal(targetComp.deepNested.rotation.angle, 50)
      })

      it('should handle multiple nested properties simultaneously', async () => {
        // Add multiple properties at different nesting levels
        const xSetter = MixerComponent.addProperty(mixerEntity, targetEntity, testComponent, 'nested.x')
        const ySetter = MixerComponent.addProperty(mixerEntity, targetEntity, testComponent, 'nested.y')
        const angleSetter = MixerComponent.addProperty(
          mixerEntity,
          targetEntity,
          testComponent,
          'deepNested.rotation.angle'
        )

        assert.isNotNull(xSetter)
        assert.isNotNull(ySetter)
        assert.isNotNull(angleSetter)

        // Set values for all properties in a single entry
        let entry = xSetter!(10)
        entry = { ...entry, ...ySetter!(20) }
        entry = { ...entry, ...angleSetter!(30) }
        MixerComponent.setEntry(mixerEntity, 0, entry)

        // Apply the changes
        mixerComp.coord = 0
        MixerComponent.mix(mixerEntity)

        // Check that all properties were updated correctly
        assert.equal(targetComp.nested.x, 10)
        assert.equal(targetComp.nested.y, 20)
        assert.equal(targetComp.deepNested.rotation.angle, 30)
      })
    })
  })
})
