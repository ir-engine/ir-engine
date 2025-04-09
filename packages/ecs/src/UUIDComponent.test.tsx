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

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { createEntity, defineQuery, entityExists } from '@ir-engine/ecs'
import { hookstate, NO_PROXY_STEALTH, ReactorReconciler, startReactor } from '@ir-engine/hyperflux'
import { useEffect } from 'react'
import {
  getComponent,
  hasComponent,
  LayerComponents,
  LayerFunctions,
  Layers,
  removeComponent,
  serializeComponent,
  setComponent
} from './ComponentFunctions'
import { createEngine, destroyEngine } from './Engine'
import { EntityUUID, UndefinedEntity } from './Entity'
import { UUIDComponent, UUIDComponentFunctions } from './UUIDComponent'

describe('UUIDComponent', () => {
  beforeEach(() => {
    createEngine()
  })

  afterEach(() => {
    destroyEngine()
  })

  describe('name', () => {
    it('should have the expected value', () => {
      expect(UUIDComponent.name).toBeTruthy()
      expect(UUIDComponent.name).toBe('UUIDComponent')
    })

    it('should respect the naming convention for Components', () => {
      expect(UUIDComponent.name).toBeTruthy()
      expect(UUIDComponent.name.endsWith('Component')).toBeTruthy()
    })
  }) //:: name

  describe('serialize', () => {
    it('should return correctly serialized data', () => {
      const Expected = UUIDComponent.generateUUID()
      const testEntity = createEntity()
      const uuid = Expected
      setComponent(testEntity, UUIDComponent, uuid)
      const result = serializeComponent(testEntity, UUIDComponent)
      expect(result).toBe(Expected)
    })
  })

  describe('onSet', () => {
    it('should call UUIDComponentFunctions._getUUIDState once and set its value to `@param entity`', () => {
      // Set the data as expected
      // Sanity check before running
      const uuid = UUIDComponent.generateUUID()
      const before = UUIDComponentFunctions._getUUIDState(uuid).get()
      const resultSpy = vi.spyOn(UUIDComponentFunctions, '_getUUIDState')
      expect(resultSpy).toHaveBeenCalledTimes(0)
      // Run and Check the result
      const testEntity = createEntity()
      expect(before).not.toBe(testEntity)
      // run via setComponent
      setComponent(testEntity, UUIDComponent, uuid)
      expect(resultSpy).toHaveBeenCalledTimes(1)
      expect(UUIDComponentFunctions._getUUIDState(uuid).get()).toBe(testEntity)
    })
  }) //:: onSet

  describe('onRemove', () => {
    it('should call UUIDComponentFunctions._getUUIDState with (currentUUID, layer) as arguments and set its value to UndefinedEntity', () => {
      const Expected = UndefinedEntity
      // Set the data as expected
      const layer = Layers.Simulation
      const testEntity = createEntity(layer)
      const uuid = UUIDComponent.generateUUID()
      setComponent(testEntity, UUIDComponent, uuid)
      const resultSpy = vi.spyOn(UUIDComponentFunctions, '_getUUIDState')
      // Sanity check before running
      expect(resultSpy).not.toHaveBeenCalled()
      const before = UUIDComponentFunctions._getUUIDState(uuid, layer).get()
      expect(before).toBe(testEntity)
      expect(before).not.toBe(Expected)
      // Run and Check the result
      removeComponent(testEntity, UUIDComponent)
      expect(resultSpy).toHaveBeenCalled()
      expect(resultSpy).toHaveBeenCalledTimes(1)
      expect(UUIDComponent.entitiesByUUIDState[layer][uuid]).toBeUndefined()
      const result = UUIDComponentFunctions._getUUIDState(uuid, layer).get()
      expect(result).not.toBe(testEntity)
      expect(result).toBe(Expected)
    })

    it('should remove the component from the entity', () => {
      const uuid = UUIDComponent.generateUUID()
      const testEntity = createEntity()
      setComponent(testEntity, UUIDComponent, uuid)
      expect(hasComponent(testEntity, UUIDComponent)).toBeTruthy()
      removeComponent(testEntity, UUIDComponent)
      expect(hasComponent(testEntity, UUIDComponent)).toBeFalsy()
    })
  }) //:: onRemove

  describe('useEntityByUUID', () => {
    it('should return the result.value of calling useHookstate with UUIDComponentFunctions._getUUIDState(uuid, `@param layer`) as its argument', () => {
      // Set the data as expected
      const layer = Layers.Authoring
      const testEntity = createEntity(layer)
      const uuid = UUIDComponent.generateUUID()
      setComponent(testEntity, UUIDComponent, uuid)
      const resultSpy = vi.spyOn(UUIDComponent, 'useEntityByUUID')
      const Initial = UndefinedEntity
      const Expected = testEntity
      let result = Initial
      // Define the Reactor that will run the tested hook
      const Reactor = () => {
        const data = UUIDComponent.useEntityByUUID(uuid, layer)
        useEffect(() => {
          result = data
        }, [data])
        return null
      }
      // Sanity check before running
      expect(result).toBe(Initial)
      expect(result).not.toBe(Expected)
      expect(resultSpy).not.toHaveBeenCalled()
      // Run and Check the result
      const root = startReactor(Reactor)
      ReactorReconciler.flushSync(() => root.run())
      expect(resultSpy).toHaveBeenCalled()
      expect(resultSpy).toHaveBeenCalledTimes(1)
      expect(result).not.toBe(Initial)
      expect(result).toBe(Expected)
      expect(result).toBe(UUIDComponentFunctions._getUUIDState(uuid, layer).get())
    })

    it('should return the result.value of calling useHookstate with UUIDComponentFunctions._getUUIDState(uuid, Layers.Simulation) as its argument when `@param layer` is not provided', () => {
      // Set the data as expected
      const testEntity = createEntity()
      const uuid = UUIDComponent.generateUUID()
      setComponent(testEntity, UUIDComponent, uuid)
      const resultSpy = vi.spyOn(UUIDComponent, 'useEntityByUUID')
      const Initial = UndefinedEntity
      const Expected = testEntity
      let result = Initial
      // Define the Reactor that will run the tested hook
      const Reactor = () => {
        const data = UUIDComponent.useEntityByUUID(uuid)
        useEffect(() => {
          result = data
        }, [data])
        return null
      }
      // Sanity check before running
      expect(result).toBe(Initial)
      expect(result).not.toBe(Expected)
      expect(resultSpy).not.toHaveBeenCalled()
      // Run and Check the result
      const root = startReactor(Reactor)
      ReactorReconciler.flushSync(() => root.run())
      expect(resultSpy).toHaveBeenCalled()
      expect(resultSpy).toHaveBeenCalledTimes(1)
      expect(result).not.toBe(Initial)
      expect(result).toBe(Expected)
      expect(result).toBe(UUIDComponentFunctions._getUUIDState(uuid, Layers.Simulation).get())
    })
  }) //:: useEntityByUUID

  describe('getEntityByUUID', () => {
    it('should return the correct entity', () => {
      const testEntity = createEntity()
      const uuid = UUIDComponent.generateUUID()
      setComponent(testEntity, UUIDComponent, uuid)
      const Expected = testEntity
      const result = UUIDComponent.getEntityByUUID(uuid)
      expect(result).toBe(Expected)
    })

    it('should return UndefinedEntity when the UUID has not been added to any entity', () => {
      const testEntity = createEntity()
      const uuid = UUIDComponent.generateUUID()
      // setComponent(testEntity, UUIDComponent, uuid)
      const Expected = UndefinedEntity
      const result = UUIDComponent.getEntityByUUID(uuid)
      expect(result).not.toBe(testEntity)
      expect(result).toBe(Expected)
    })

    it('should return the NO_PROXY_STEALTH result of calling UUIDComponentFunctions._getUUIDState with (uuid, `@param layer`) as its arguments', () => {
      // Set the data as expected
      const uuid = UUIDComponent.generateUUID()
      const layer = Layers.Authoring
      const testEntity = createEntity(layer)
      setComponent(testEntity, UUIDComponent, uuid)
      const Expected = UUIDComponentFunctions._getUUIDState(uuid, layer).get(NO_PROXY_STEALTH)
      // Run and Check the result
      const result = UUIDComponent.getEntityByUUID(uuid, layer)
      expect(result).not.toBe(UndefinedEntity)
      expect(result).toBe(Expected)
      expect(result).toBe(testEntity)
    })

    it('should return the NO_PROXY_STEALTH result of calling UUIDComponentFunctions._getUUIDState with (uuid, Layers.Simulation) as its arguments when `@param layer` is not provided', () => {
      // Set the data as expected
      const uuid = UUIDComponent.generateUUID()
      const testEntity = createEntity()
      setComponent(testEntity, UUIDComponent, uuid)
      const Expected = UUIDComponentFunctions._getUUIDState(uuid, Layers.Simulation).get(NO_PROXY_STEALTH)
      // Run and Check the result
      const result = UUIDComponent.getEntityByUUID(uuid)
      expect(result).not.toBe(UndefinedEntity)
      expect(result).toBe(Expected)
      expect(result).toBe(testEntity)
    })
  }) //:: getEntityByUUID

  describe('getOrCreateEntityByUUID', () => {
    it('should create a new entity and set its UUIDComponent to `@param uuid` when the result.value of UUIDComponentFunctions._getUUIDState(uuid, Layers.Simulation) is falsy', () => {
      const Expected = 1 // Number of entities expected to exist after
      const Initial = 0 // Number of entities expected to exist initially
      // Set the data as expected
      const allEntities = defineQuery([])
      const uuid = UUIDComponent.generateUUID()
      // Sanity check before running
      const entityCountBefore = allEntities().length
      expect(entityCountBefore).toBe(Initial)
      expect(entityCountBefore).not.toBe(Expected)
      expect(UUIDComponentFunctions._getUUIDState(uuid, Layers.Simulation).get()).toBeFalsy()
      // Run and Check the result
      const result = UUIDComponent.getOrCreateEntityByUUID(uuid)
      const entityCount = allEntities().length
      expect(entityCount).not.toBe(Initial)
      expect(entityCount).toBe(Expected)
      expect(result).toBeTruthy()
      expect(result).not.toBe(UndefinedEntity)
      expect(entityExists(result)).toBeTruthy()
      expect(hasComponent(result, UUIDComponent)).toBeTruthy()
      expect(getComponent(result, UUIDComponent)).toBe(uuid)
    })

    it('should return the result.value of UUIDComponentFunctions._getUUIDState with (`@param uuid`, `@param layer`) as its arguments', () => {
      const Expected = 1 // Number of entities expected to exist after
      const Initial = 0 // Number of entities expected to exist initially
      // Set the data as expected
      const allEntities = defineQuery([])
      const uuid = UUIDComponent.generateUUID()
      const layer = Layers.Authoring
      // Sanity check before running
      const entityCountBefore = allEntities().length
      expect(entityCountBefore).toBe(Initial)
      expect(entityCountBefore).not.toBe(Expected)
      expect(UUIDComponentFunctions._getUUIDState(uuid, layer).get()).toBeFalsy()
      // Run and Check the result
      const result = UUIDComponent.getOrCreateEntityByUUID(uuid, layer)
      const entityCount = allEntities().length
      expect(entityCount).not.toBe(Initial)
      expect(entityCount).toBe(Expected)
      expect(result).toBeTruthy()
      expect(result).not.toBe(UndefinedEntity)
      expect(entityExists(result)).toBeTruthy()
      expect(hasComponent(result, UUIDComponent)).toBeTruthy()
      expect(getComponent(result, UUIDComponent)).toBe(uuid)
      expect(LayerFunctions.getLayerComponent(result).name).toBe(LayerComponents[layer].name)
    })

    it('should return the correct entity when it already exists', () => {
      const uuid = UUIDComponent.generateUUID()
      const testEntity = createEntity()
      setComponent(testEntity, UUIDComponent, uuid)
      const Expected = testEntity
      const result = UUIDComponent.getOrCreateEntityByUUID(uuid)
      expect(result).toBe(Expected)
    })

    it("should create a new entity when the UUID hasn't been added to any entity", () => {
      // Set the data as expected
      const allEntities = defineQuery([])
      const uuid = UUIDComponent.generateUUID()
      const testEntity = createEntity()
      // setComponent(testEntity, UUIDComponent, uuid)
      expect(allEntities().length).toBe(1)
      // Run and Check the result
      const result = UUIDComponent.getOrCreateEntityByUUID(uuid)
      expect(result).not.toBe(testEntity)
      expect(allEntities().length).toBe(2)
    })
  }) //:: getOrCreateEntityByUUID

  describe('_getUUIDState', () => {
    it('should set UUIDComponent.entitiesByUUIDState[layer] to a non-falsy value when it is falsy', () => {
      const Initial = undefined
      // Set the data as expected
      const layer = Layers.Authoring
      const uuid = UUIDComponent.generateUUID()
      // @ts-expect-error Coerce undefined into the Record entry
      UUIDComponent.entitiesByUUIDState[layer] = Initial
      // Sanity check before running
      expect(UUIDComponent.entitiesByUUIDState[layer]).toBe(Initial)
      // Run and Check the result
      UUIDComponentFunctions._getUUIDState(uuid, layer)
      expect(UUIDComponent.entitiesByUUIDState[layer]).not.toBe(Initial)
    })

    it('should set UUIDComponent.entitiesByUUIDState[layer][uuid] to the result of hookstate(UndefinedEntity) when it is falsy', () => {
      const Initial = undefined
      const Expected = hookstate(UndefinedEntity)
      // Set the data as expected
      const layer = Layers.Authoring
      const uuid = UUIDComponent.generateUUID()
      // @ts-expect-error Coerce undefined into the Record entry
      UUIDComponent.entitiesByUUIDState[layer][uuid] = Initial
      // Sanity check before running
      expect(UUIDComponent.entitiesByUUIDState[layer][uuid]).toBe(Initial)
      expect(UUIDComponent.entitiesByUUIDState[layer][uuid]).not.toEqual(Expected)
      // Run and Check the result
      UUIDComponentFunctions._getUUIDState(uuid, layer)
      expect(UUIDComponent.entitiesByUUIDState[layer][uuid]).not.toBe(Initial)
      expect(UUIDComponent.entitiesByUUIDState[layer][uuid]).toEqual(Expected)
    })

    it('should return the value of UUIDComponent.entitiesByUUIDState[layer][uuid]', () => {
      const Initial = undefined
      const Expected = { path: [], value: 0 }
      // Set the data as expected
      const layer = Layers.Authoring
      const uuid = UUIDComponent.generateUUID()
      // @ts-expect-error Coerce undefined into the Record entry
      UUIDComponent.entitiesByUUIDState[layer][uuid] = Initial
      // Sanity check before running
      expect(UUIDComponent.entitiesByUUIDState[layer][uuid]).toBe(Initial)
      expect(UUIDComponent.entitiesByUUIDState[layer][uuid]).not.toEqual(Expected)
      // Run and Check the result
      UUIDComponentFunctions._getUUIDState(uuid, layer)
      expect(UUIDComponent.entitiesByUUIDState[layer][uuid]).not.toBe(Initial)
      expect(UUIDComponent.entitiesByUUIDState[layer][uuid]).toEqual(Expected)
      const testEntity = createEntity(layer)
      setComponent(testEntity, UUIDComponent, uuid)
      expect(UUIDComponent.entitiesByUUIDState[layer][uuid].get()).toEqual(testEntity)
    })
  }) //:: _getUUIDState

  describe('generateUUID', () => {
    it('should generate a non-empty UUID', () => {
      const result = UUIDComponent.generateUUID()
      expect(result).toBeTruthy()
      expect(result).not.toBe('' as EntityUUID)
    })

    // const iter = 8_500 /** @note 10_000 iterations takes ~4sec on an AMD Ryzen 5 2600 */
    const iter = 10
    it(`should generate unique UUIDs when run multiple times  (${iter} iterations)`, () => {
      const list = [] as EntityUUID[]
      // Generate the list of (supposedly) unique UUIDs
      for (let id = 0; id < iter; id++) list.push(UUIDComponent.generateUUID())
      // Compare every UUID with all other UUIDs
      for (let id = 0; id < iter; id++) {
        const A = list[id]
        for (const B in list.filter((n) => n !== list[id])) {
          // For every other uuid that is not the current one
          expect(A).not.toBe(B)
        }
      }
    })
  }) //:: generateUUID
}) //:: UUIDComponent
