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
import { afterEach, assert, beforeEach, describe, it, vi } from 'vitest'
import { MixerComponent } from './MixerComponent'

const createEntityWithUUID = () => {
  const entity = createEntity()
  setComponent(entity, UUIDComponent, UUIDComponent.generateUUID())
  return entity
}

const testComponent = defineComponent({
  name: 'TestComponent',
  jsonID: 'EE_test',
  schema: S.Object({
    x: S.Number(0),
    y: S.Number(0),
    z: S.Number(0)
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
        setComponent(mixerEntity, MixerComponent, customData)
        await vi.waitUntil(() => getComponent(mixerEntity, MixerComponent).state != null)
        const { state, ...componentData } = getComponent(mixerEntity, MixerComponent)
        assert.deepEqual(componentData, customData)
        // The "state" property isn't serialized, so we ought to check it separately
        // to verify the reactor is properly running:
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
          const x1Set = MixerComponent.addProperty(mixerEntity, targetEntity, testComponent, 'x')!
          const x2Set = MixerComponent.propertySetter(mixerEntity, targetEntity, testComponent, 'x')
          const xProperty = mixerComp.properties.find((prop) => prop.endsWith('x'))
          assert.isNotNull(x2Set)
          const x1 = 0
          const x1Partial = x1Set(x1)
          assert.deepEqual(x1Partial[xProperty][0], x1)
          const x2 = 1
          const x2Partial = x2Set!(x2)
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
          const xProperty = mixerComp.properties.find((prop) => prop.endsWith('x'))
          const defaultValue = 0
          const defaultEntry = MixerComponent.getDefaultEntry(mixerEntity, 0)
          assert.equal(defaultEntry[xProperty][0], defaultValue)
        })
      })

      describe('setEntry', () => {
        it('should set an entry at the given coord, overwriting any existing entry at that coord', () => {
          const xSet = MixerComponent.addProperty(mixerEntity, targetEntity, testComponent, 'x')!
          const xProperty = mixerComp.properties.find((prop) => prop.endsWith('x'))
          const ySet = MixerComponent.addProperty(mixerEntity, targetEntity, testComponent, 'y')!
          const yProperty = mixerComp.properties.find((prop) => prop.endsWith('y'))
          const coord = 3
          const value1 = 1,
            value2 = 2,
            defaultValue = 0
          const lastSize = mixerComp.entries.length

          // We set the entry to a value for x, default value for y, and check that they are set
          const entry1 = MixerComponent.setEntry(mixerEntity, coord, { ...xSet(value1) })
          // There should be one more entry than before
          assert.equal(mixerComp.entries.length, lastSize + 1)
          assert.equal(mixerComp.state.entriesByCoord.size, lastSize + 1)
          assert.isNotNull(entry1)
          assert.equal(entry1?.[xProperty]?.[0], value1)
          assert.equal(entry1?.[yProperty]?.[0], defaultValue)

          // We set the entry to a different value for x and y, and check that they are set
          const entry2 = MixerComponent.setEntry(mixerEntity, coord, { ...xSet(value2), ...ySet(value2) })
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
          const xSet = MixerComponent.addProperty(mixerEntity, targetEntity, testComponent, 'x')!
          const xProperty = mixerComp.properties.find((prop) => prop.endsWith('x'))
          const leftValue = 10,
            rightValue = 20
          const leftCoord = 10,
            rightCoord = 11,
            midCoord = 10.75
          MixerComponent.setEntry(mixerEntity, leftCoord, xSet(leftValue))
          MixerComponent.setEntry(mixerEntity, rightCoord, xSet(rightValue))
          const midEntry = MixerComponent.appendEntry(mixerEntity, midCoord, {})
          assert.equal(midEntry?.[xProperty][0], leftValue * 0.25 + rightValue * 0.75)
        })
        it('should change an existing entry, while leaving existing values unchanged', () => {
          const xSet = MixerComponent.addProperty(mixerEntity, targetEntity, testComponent, 'x')!
          const xProperty = mixerComp.properties.find((prop) => prop.endsWith('x'))
          const ySet = MixerComponent.addProperty(mixerEntity, targetEntity, testComponent, 'y')!
          const yProperty = mixerComp.properties.find((prop) => prop.endsWith('y'))
          const coord = 3
          const xValue = 1,
            yValue = 2,
            defaultValue = 0
          const lastSize = mixerComp.entries.length

          // We set the entry to a value for x, default value for y, and check that they are set
          const entry1 = MixerComponent.appendEntry(mixerEntity, coord, { ...xSet(xValue) })
          // There should be one more entry than before
          assert.equal(mixerComp.entries.length, lastSize + 1)
          assert.equal(mixerComp.state.entriesByCoord.size, lastSize + 1)
          assert.isNotNull(entry1)
          assert.equal(entry1?.[xProperty][0], xValue)
          assert.equal(entry1?.[yProperty][0], defaultValue)

          // We append the entry with a different value for y, and check that x is unchanged while y is set
          const entry2 = MixerComponent.appendEntry(mixerEntity, coord, { ...ySet(yValue) })
          // This should not change the number of entries; it should modify the previous one
          assert.equal(mixerComp.entries.length, lastSize + 1)
          assert.equal(mixerComp.state.entriesByCoord.size, lastSize + 1)
          // The entry should a different object, with the new value for y
          assert.notEqual(entry2, entry1)
          assert.equal(entry2?.[xProperty][0], xValue)
          assert.equal(entry2?.[yProperty][0], yValue)
        })
      })

      describe('deleteEntry', () => {
        it('should delete the entry at the given coord, if it exists', () => {
          const coord1 = 0,
            coord2 = 1,
            coord3 = 2
          MixerComponent.setEntry(mixerEntity, coord1, {})
          MixerComponent.setEntry(mixerEntity, coord2, {})
          MixerComponent.setEntry(mixerEntity, coord3, {})
          const lastEntryCoords = [...mixerComp.state.entriesByCoord.keys()]
          const lastSize = mixerComp.entries.length
          MixerComponent.deleteEntry(mixerEntity, coord1)
          assert.equal(mixerComp.entries.length, lastSize - 1)
          assert.equal(mixerComp.state.entriesByCoord.size, lastSize - 1)
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
          const xSet = MixerComponent.addProperty(mixerEntity, targetEntity, testComponent, 'x')!
          const xProperty = mixerComp.properties.find((prop) => prop.endsWith('x'))
          const leftValue = 10,
            rightValue = 20
          const leftCoord = 10,
            rightCoord = 11,
            midCoord = 10.75
          MixerComponent.setEntry(mixerEntity, leftCoord, xSet(leftValue))
          MixerComponent.setEntry(mixerEntity, rightCoord, xSet(rightValue))
          const midEntry = MixerComponent.getMixedEntry(mixerEntity, midCoord)
          assert.equal(midEntry[xProperty][0], leftValue * 0.25 + rightValue * 0.75)
        })

        it('should return an entry that is deeply equal to the entry at the given coord, if it exists', () => {
          const xSet = MixerComponent.addProperty(mixerEntity, targetEntity, testComponent, 'x')!
          const xProperty = mixerComp.properties.find((prop) => prop.endsWith('x'))
          const value = 10
          const coord = 10
          const entry = MixerComponent.setEntry(mixerEntity, coord, xSet(value))
          const mixedEntry = MixerComponent.getMixedEntry(mixerEntity, coord)
          assert.notEqual(entry, mixedEntry)
          assert.deepEqual(entry, mixedEntry)
        })

        it('should return an entry that is deeply equal to the nearest entry if the given coord is outside the range of entries', () => {
          const xSet = MixerComponent.addProperty(mixerEntity, targetEntity, testComponent, 'x')!
          const leftValue = 10,
            rightValue = 20
          const leftCoord = 10,
            rightCoord = 11,
            farCoord = 100
          MixerComponent.setEntry(mixerEntity, leftCoord, xSet(leftValue))
          const rightEntry = MixerComponent.setEntry(mixerEntity, rightCoord, xSet(rightValue))
          const farEntry = MixerComponent.getMixedEntry(mixerEntity, farCoord)
          assert.notEqual(farEntry, rightEntry)
          assert.deepEqual(farEntry, rightEntry)
        })
      })

      describe('mix', () => {
        it('should set the target entity properties to the mixed value of the entries at the mixer coord', () => {
          const xSet = MixerComponent.addProperty(mixerEntity, targetEntity, testComponent, 'x')!
          const leftValue = 10,
            rightValue = 20
          const leftCoord = 10,
            rightCoord = 11,
            midCoord = leftCoord * 0.25 + rightCoord * 0.75
          MixerComponent.setEntry(mixerEntity, leftCoord, xSet(leftValue))
          MixerComponent.setEntry(mixerEntity, rightCoord, xSet(rightValue))
          mixerComp.coord = midCoord
          MixerComponent.mix(mixerEntity)

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
        const xSet = MixerComponent.addProperty(mixerEntity, targetEntity, testComponent, 'x')
        const ySet = MixerComponent.addProperty(mixerEntity, targetEntity, testComponent, 'y')
        const xValue = 10,
          yValue = 20
        MixerComponent.setEntry(mixerEntity, 0, { ...xSet?.(xValue), ...ySet?.(yValue) })

        const { state: state1, ...componentData1 } = getComponent(mixerEntity, MixerComponent)

        const serialized = serializeComponent(mixerEntity, MixerComponent)
        removeComponent(mixerEntity, MixerComponent)
        await vi.waitUntil(() => {
          return !hasComponent(mixerEntity, MixerComponent)
        })
        deserializeComponent(mixerEntity, MixerComponent, serialized)
        await vi.waitUntil(() => {
          mixerComp = getComponent(mixerEntity, MixerComponent)
          return mixerComp.state != null
        })

        const { state: state2, ...componentData2 } = getComponent(mixerEntity, MixerComponent)
        assert.deepEqual(componentData2, componentData1)
        // The "state" property isn't serialized, so we ought to check it separately
        // to verify the reactor is properly running:
        assert.deepEqual(state2.properties, state2.properties)
        assert.deepEqual(state2.sortedEntries, state2.sortedEntries)

        // The new component should be able to set the target entity properties
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

      describe('coord', () => {
        it('should cause the target entity properties to be set to the mixed value of the entries at the mixer coord', async () => {
          const xSet = MixerComponent.addProperty(mixerEntity, targetEntity, testComponent, 'x')!
          const leftValue = 10,
            rightValue = 20
          const leftCoord = 10,
            rightCoord = 11,
            midCoord = leftCoord * 0.25 + rightCoord * 0.75
          MixerComponent.setEntry(mixerEntity, leftCoord, xSet(leftValue))
          MixerComponent.setEntry(mixerEntity, rightCoord, xSet(rightValue))
          getMutableComponent(mixerEntity, MixerComponent).coord.set(midCoord)
          // The reactor should run and set the target entity properties to the mixed value
          await vi.waitUntil(() => targetComp.x === leftValue * 0.25 + rightValue * 0.75)
        })
      })
    })
  })
})
