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

import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { HyperFlux } from '@ir-engine/hyperflux'
import * as bitECS from 'bitecs'
import {
  LayerComponent,
  LayerID,
  Layers,
  _removeMarkedEntity,
  createEntity,
  entityExists,
  removeEntity
} from './ComponentFunctions'
import { createEngine, destroyEngine } from './Engine'
import { Entity, UndefinedEntity } from './Entity'

describe('createEntity', () => {
  beforeEach(() => {
    createEngine()
  })
  afterEach(() => {
    return destroyEngine()
  })

  it('should return a valid entity ID that returns true when given to `entityExists`', () => {
    const result = createEntity()
    expect(entityExists(result)).toBeTruthy()
  })

  it('should never return UndefinedEntity', () => {
    const result = createEntity()
    expect(result).not.toBe(UndefinedEntity)
  })

  it('should use Layers.Simulation as the default value for `@param layerID` when it is omitted', () => {
    const Expected = Layers.Simulation
    // Set the data as expected
    const testEntity = createEntity()
    // Run and Check the result
    const result = LayerComponent.get(testEntity)
    expect(result).toBe(Expected)
  })

  it('should create a new entity by calling bitECS.addEntity with HyperFlux.store as its world argument', () => {
    // Set the data as expected
    const testEntity = createEntity()
    // Run and Check the result
    const result = bitECS.entityExists(HyperFlux.store, testEntity)
    expect(result).toBeTruthy()
  })

  it('should set a LayerComponent on the newly created entity with `@param layerID` as its layer argument', () => {
    // Set the data as expected
    const expectedLayer = Layers.Authoring
    const testEntity = createEntity(expectedLayer)
    // Run and Check the result
    const result = LayerComponent.get(testEntity)
    expect(result).toBeTruthy()
    expect(result).toBe(expectedLayer)
  })

  it('should return the newly created entity', () => {
    const result = createEntity()
    expect(result).not.toBe(undefined)
    expect(result).toBeTruthy()
    expect(entityExists(result)).toBeTruthy()
  })

  it('should throw an error when `@param layerID` is not a valid LayerID', () => {
    expect(() => createEntity(42_000 as LayerID)).toThrowError()
  })
}) //:: createEntity

describe('removeEntity', () => {
  beforeEach(() => {
    createEngine()
  })

  afterEach(() => {
    destroyEngine()
  })

  it('should call bitECS.removeEntity with HyperFlux.store and `@param entity` as arguments', () => {
    // Set the data as expected
    const testEntity = bitECS.addEntity(HyperFlux.store) as Entity
    // Run and Check the result
    removeEntity(testEntity)
    const result = bitECS.entityExists(HyperFlux.store, testEntity)
    expect(result).equals(true)
    _removeMarkedEntity(testEntity)
    const result2 = bitECS.entityExists(HyperFlux.store, testEntity)
    expect(result2).equals(false)
  })

  /**
  // @note
  // Just for reference. These tests require circular logic that cannot be solved
  // Cannot check if the process of removing an entity is not happening on a falsy entity (aka already does not exist)
  // Cannot check if removing all components from an entity has been triggered on an entity that after the process does not exist
  it.todo('should not do anything if `@param entity` is falsy', () => {})
  it.todo('should not do anything if the result of `entityExists(entity)` is falsy', () => {})
  it.todo('should call removeAllComponents with `@param entity`', () => {})
  */
}) //:: removeEntity
