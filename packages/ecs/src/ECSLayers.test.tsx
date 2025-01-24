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

import { HyperFlux } from '@ir-engine/hyperflux'
import { TransformComponent } from '@ir-engine/spatial/src/transform/components/TransformComponent'
import * as bitECS from 'bitecs'
import {
  defineComponent,
  getComponent,
  hasComponent,
  LayerComponent,
  LayerComponents,
  LayerFunctions,
  LayerID,
  LayerRelationTypes,
  Layers,
  removeComponent,
  setComponent
} from './ComponentFunctions'
import { createEntity } from './createEntity'
import { createEngine, destroyEngine } from './Engine'
import { Entity, UndefinedEntity } from './Entity'
import { entityExists, removeEntity } from './EntityFunctions'
import { defineQuery } from './QueryFunctions'

/** @todo Move this describe to `EntityFunctions.test.tsx` */
describe('createEntity', () => {
  beforeEach(() => {
    createEngine()
  })

  afterEach(() => {
    destroyEngine()
  })

  it('should use Layers.Simulation as the default value for `@param layerID` when it is omitted', () => {
    const Expected = Layers.Simulation
    // Set the data as expected
    const testEntity = createEntity()
    // Run and Check the result
    const result = getComponent(testEntity, LayerComponent)
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
    const result = getComponent(testEntity, LayerComponent)
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

/** @todo Move this describe to `EntityFunctions.test.tsx` */
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
    expect(result).toBeFalsy()
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

describe('LayerFunctions', () => {
  beforeEach(() => {
    createEngine()
  })

  afterEach(() => {
    destroyEngine()
  })

  /** @todo Has been refactored. Needs a deep revision */
  describe('getLayerRelationsEntities', () => {
    it('should return an array of arrays that contains valid layer ID numbers in slot 0 of each subarray', () => {
      // Set the data as expected
      const testEntity = createEntity(Layers.Authoring)
      // Run and Check the result
      const result = LayerFunctions.getLayerRelationsEntities(testEntity)
      expect(Array.isArray(result)).toBeTruthy()
      expect(Array.isArray(result[0])).toBeTruthy()
      expect(Object.values(Layers).includes(result[0][0] as LayerID)).toBeTruthy()
    })

    it('should return an array of arrays that contains valid Entity IDs in slot 1 of each subarray', () => {
      // Set the data as expected
      const testEntity = createEntity(Layers.Authoring)
      // Run and Check the result
      const result = LayerFunctions.getLayerRelationsEntities(testEntity)
      expect(Array.isArray(result)).toBeTruthy()
      expect(Array.isArray(result[0])).toBeTruthy()
      expect(entityExists(result[0][1])).toBeTruthy()
    })

    it('should retrieve the `@param entity` Layer relations from the LayerFunctions.getLayerComponent(entity) component and map them as expected into the result', () => {
      // Set the data as expected
      const testEntity = createEntity(Layers.Authoring)
      // Run and Check the result
      const result = LayerFunctions.getLayerRelationsEntities(testEntity)
      expect(Array.isArray(result)).toBeTruthy()
      expect(result.length).toBe(1)
      expect(result[0][0]).toBe(Layers.Simulation)
      expect(entityExists(result[0][1])).toBeTruthy()
    })
  }) //:: getLayerRelationsEntities

  describe('getLayerRelationsTypes', () => {
    it('should return an array of arrays that contains valid layer ID numbers in slot 0 of each subarray', () => {
      // Set the data as expected
      const layer = Layers.Authoring
      // Run and Check the result
      const result = LayerFunctions.getLayerRelationsTypes(layer)
      expect(Array.isArray(result)).toBeTruthy()
      expect(Array.isArray(result[0])).toBeTruthy()
      expect(Object.values(Layers).includes(result[0][0] as LayerID)).toBeTruthy()
    })

    it('should return an array of arrays that contains a valid RelationTypes entry in slot 1 of each subarray', () => {
      // Set the data as expected
      const layer = Layers.Authoring
      // Run and Check the result
      const result = LayerFunctions.getLayerRelationsTypes(layer)
      expect(Array.isArray(result)).toBeTruthy()
      expect(Array.isArray(result[0])).toBeTruthy()
      expect(Object.values(LayerRelationTypes).includes(result[0][1])).toBeTruthy()
    })

    it('should retrieve the `@param entity` Layer relations from the LayerFunctions.getLayerComponent(entity) component and map them as expected into the result', () => {
      // Set the data as expected
      const layer = Layers.Authoring
      // Run and Check the result
      const result = LayerFunctions.getLayerRelationsTypes(layer)
      expect(Array.isArray(result)).toBeTruthy()
      expect(result.length).toBe(1)
      expect(result[0][0]).toBe(Layers.Simulation)
      expect(Object.values(LayerRelationTypes).includes(result[0][1])).toBeTruthy()
    })
  }) //:: getLayerRelationsTypes

  describe('getLayerComponent', () => {
    it('should return the expected Layer component for the `@param entity` from the `LayerComponents` map', () => {
      const Expected = LayerComponents[Layers.Authoring]
      // Set the data as expected
      const testEntity = createEntity(Layers.Authoring)
      // Run and Check the result
      const result = LayerFunctions.getLayerComponent(testEntity)
      expect(result).toBe(Expected)
      expect(result).toEqual(Expected)
    })
  }) //:: getLayerComponent

  describe('shouldPropagate', () => {
    it('should never return true when comparing a layer with itself', () => {
      const Expected = false
      // Set the data as expected
      const layerA = Layers.Authoring
      const layerB = Layers.Authoring
      // Run and Check the result
      const result = LayerFunctions.shouldPropagate(layerA, layerB)
      expect(result).toBe(Expected)
    })

    it('should return true if the given layer pair is expected to trigger propagation behavior.', () => {
      const Expected = true
      // Set the data as expected
      const layerA = Layers.Authoring
      const layerB = Layers.Simulation
      // Run and Check the result
      const result = LayerFunctions.shouldPropagate(layerA, layerB)
      expect(result).toBe(Expected)
    })

    it('should return false if the given layer pair is not expected to trigger propagation behavior.', () => {
      const Expected = false
      // Set the data as expected
      const layerA = Layers.Simulation
      const layerB = Layers.Authoring
      // Run and Check the result
      const result = LayerFunctions.shouldPropagate(layerA, layerB)
      expect(result).toBe(Expected)
    })
  }) //:: shouldPropagate

  /** @todo Broken by #2015ad3 */
  describe.todo('propagateLayer', () => {
    it('should not do anything if `@param component` is LayerComponent', () => {
      // Set the data as expected
      const resultSpy = vi.spyOn(LayerFunctions, 'createLayerPropagationArgs')
      const entityLayer = Layers.Authoring
      const linkedLayer = Layers.Simulation
      const testEntity = createEntity(entityLayer)
      const component = LayerComponent as any
      // Sanity check before running
      expect(component).toBe(LayerComponent)
      expect(LayerComponents.includes(component)).toBeFalsy()
      expect(LayerFunctions.shouldPropagate(entityLayer, linkedLayer)).toBeTruthy()
      expect(component.schema).toBeTruthy()
      expect(resultSpy).not.toHaveBeenCalled()
      // Run and Check the result
      LayerFunctions.propagateLayer(testEntity, component)
      expect(resultSpy).not.toHaveBeenCalled()
    })

    it('should not do anything if the LayerComponents array contains `@param component`', () => {
      // Set the data as expected
      const resultSpy = vi.spyOn(LayerFunctions, 'createLayerPropagationArgs')
      const entityLayer = Layers.Authoring
      const linkedLayer = Layers.Simulation
      const testEntity = createEntity(entityLayer)
      const component = LayerComponents[entityLayer]
      // Sanity check before running
      expect(component).not.toBe(LayerComponent)
      expect(LayerComponents.includes(component)).toBeTruthy()
      expect(LayerFunctions.shouldPropagate(entityLayer, linkedLayer)).toBeTruthy()
      expect(component.schema).toBeTruthy()
      expect(resultSpy).not.toHaveBeenCalled()
      // Run and Check the result
      LayerFunctions.propagateLayer(testEntity, component)
      expect(resultSpy).not.toHaveBeenCalled()
    })

    describe('for every (layer,entity) pair returned by LayerFunctions.getLayerRelationsEntities for the `@param entity`', () => {
      // should call removeComponent(linkedEntity, component) and not do anything else for this pair (continue) if `@param entity` does not have `@param component`

      it('.. should not do anything else for this pair (continue) if the result of LayerFunctions.shouldPropagate(entityLayer, linkedLayer) is falsy', () => {
        // Set the data as expected
        const resultSpy = vi.spyOn(LayerFunctions, 'createLayerPropagationArgs')
        const entityLayer = Layers.Simulation
        const linkedLayer = Layers.Authoring
        const testEntity = createEntity(entityLayer)
        const component = TransformComponent as any
        // Sanity check before running
        const linkedEntity = LayerFunctions.getLayerRelationsEntities(testEntity)[0][1]
        expect(component).not.toBe(LayerComponent)
        expect(LayerComponents.includes(component)).toBeFalsy()
        expect(LayerFunctions.shouldPropagate(entityLayer, linkedLayer)).toBeFalsy()
        expect(component.schema).toBeTruthy()
        expect(resultSpy).not.toHaveBeenCalled()
        // Run and Check the result
        LayerFunctions.propagateLayer(testEntity, component)
        expect(resultSpy).not.toHaveBeenCalled()
        expect(hasComponent(linkedEntity, component)).toBeTruthy()
      })

      it('.. should call LayerFunctions.createLayerPropagationArgs with (entity, linkedLayer, component) as arguments when LayerFunctions.shouldPropagate(entityLayer, linkedLayer) is truthy', () => {
        // Set the data as expected
        const resultSpy = vi.spyOn(LayerFunctions, 'createLayerPropagationArgs')
        const entityLayer = Layers.Authoring
        const linkedLayer = Layers.Simulation
        const testEntity = createEntity(entityLayer)
        const component = TransformComponent as any
        // Sanity check before running
        expect(component).not.toBe(LayerComponent)
        expect(LayerComponents.includes(component)).toBeFalsy()
        expect(LayerFunctions.shouldPropagate(entityLayer, linkedLayer)).toBeTruthy()
        expect(resultSpy).not.toHaveBeenCalled()
        // Run and Check the result
        LayerFunctions.propagateLayer(testEntity, component)
        expect(resultSpy).toHaveBeenCalled()
        expect(resultSpy).toHaveBeenCalledWith(testEntity, linkedLayer, component)
      })

      it('.. should call setComponent with (linkedEntity, `@param component`, `@param args`) as arguments', () => {
        // Set the data as expected
        const resultSpy = vi.spyOn(LayerFunctions, 'createLayerPropagationArgs')
        const entityLayer = Layers.Authoring
        const linkedLayer = Layers.Simulation
        const testEntity = createEntity(entityLayer)
        const component = TransformComponent as any
        const linkedEntity = LayerFunctions.getLayerRelationsEntities(testEntity)[0][1]
        // Sanity check before running
        expect(component).not.toBe(LayerComponent)
        expect(LayerComponents.includes(component)).toBeFalsy()
        expect(LayerFunctions.shouldPropagate(entityLayer, linkedLayer)).toBeTruthy()
        expect(component.schema).toBeTruthy()
        expect(resultSpy).not.toHaveBeenCalled()
        const before = hasComponent(linkedEntity, component)
        expect(before).toBeFalsy()
        // Run and Check the result
        LayerFunctions.propagateLayer(testEntity, component)
        const result = hasComponent(linkedEntity, component)
        expect(result).toBeTruthy()
      })
    })
  }) //:: propagateLayer

  describe('getAuthoringCounterpart', () => {
    /** @todo Shouldn't createEntity trigger an onSet and call createEntity to create a linked entity with AuthoringLayerComponent ?? */
    it.todo(
      'should return the entity stored in the `.refs` field of the AuthoringLayerComponent for the given `@param entity`',
      () => {
        const Expected = 1234 as Entity
        // Set the data as expected
        const testEntity = createEntity(Layers.Simulation)
        // Sanity check before running
        // Run and Check the result
        const result = LayerFunctions.getAuthoringCounterpart(testEntity)
        expect(result).toBe(Expected)
      }
    )
  }) //:: getAuthoringCounterpart

  /** @todo */
  // @note High complexity
  describe.todo('createLayerPropagationArgs', () => {}) //:: createLayerPropagationArgs
}) //:: LayerFunctions

/** @todo Broken by #2015ad3 */
describe.todo('setComponent', () => {
  beforeEach(() => {
    createEngine()
  })

  afterEach(() => {
    destroyEngine()
  })

  /** @section ECS Layers specific tests */
  it('should call LayerFunctions.propagateLayer with (entity, component, args) as arguments', () => {
    // Set the data as expected
    const resultSpy = vi.spyOn(LayerFunctions, 'propagateLayer')
    const TestComponent = defineComponent({ name: '123' })
    const testArgs = '42'
    const testEntity = createEntity()
    // Run and Check the result
    setComponent(testEntity, TestComponent, testArgs)
    expect(resultSpy).toHaveBeenCalled()
    expect(resultSpy).toHaveBeenCalledWith(testEntity, TestComponent, testArgs)
  })

  /** @section Other tests for Coverage */
  it.todo('should throw an error if `@param entity` is falsy', () => {})
  it.todo(
    'should throw an error if calling bitECS.entityExists with (HyperFlux.store, `@param entity`) as arguments returns a falsy value',
    () => {}
  )
  describe('when the result of hasComponent(`@param entity`, `@param component`) is falsy ...', () => {
    it.todo(
      '.. should set `@param component`.stateMap[`@param entity`] to the result of hookstate(createInitialComponentValue(`@param entity`, `@param component`)) when `@param component`.stateMap[`@param entity`] is falsy',
      () => {}
    )
    it.todo(
      '.. should call `@param component`.stateMap[`@param entity`].set with the result of hookstate(createInitialComponentValue(`@param entity`, `@param component`)) as arguments when `@param component`.stateMap[`@param entity`] is falsy',
      () => {}
    )
    it.todo(
      '.. should call bitECS.addComponent with (HyperFlux.store, `@param component`, `@param entity`, false) as arguments',
      () => {}
    )
  })
  it.todo(
    'should call `@param component`.onSet with (entity, component.stateMap[entity]!, args) as arguments',
    () => {}
  )
  // @todo Missing Statements after the line that calls LayerFunctions.propagateLayer
}) //:: setComponent

describe('removeComponent', () => {
  beforeEach(() => {
    createEngine()
  })

  afterEach(() => {
    destroyEngine()
  })

  /** @section ECS Layers specific tests */
  describe('for every (layer,entity) pair returned by LayerFunctions.getLayerRelationsEntities(`@param entity`)', () => {
    it('.. should not do anything if LayerFunctions.shouldPropagate(entityLayer, layer) is falsy', () => {
      // Set the data as expected
      const entityLayer = Layers.Simulation
      const component = defineComponent({ name: 'SomeTestComponent' })
      const testEntity = createEntity(entityLayer)
      setComponent(testEntity, component)
      const list = [] as Entity[]
      const relationLayer = LayerFunctions.getLayerRelationsEntities(testEntity)?.[0]?.[0] as LayerID
      for (const relation of LayerFunctions.getLayerRelationsEntities(testEntity)) list.push(relation[1])
      // Sanity check before running
      expect(LayerFunctions.shouldPropagate(entityLayer, relationLayer)).toBeFalsy()
      expect(list.length).toBe(0)
      for (const linkedEntity of list) expect(hasComponent(linkedEntity, component)).toBeTruthy() // @note Only for clarity of intention. List should be empty
      // Run and Check the result
      removeComponent(testEntity, component)
      for (const linkedEntity of list) expect(hasComponent(linkedEntity, component)).toBeTruthy() // @note Only for clarity of intention. List should be empty
    })

    it('.. should remove `@param component` from the linkedEntity returned by LayerFunctions.getLayerRelationsEntities', () => {
      // Set the data as expected
      const entityLayer = Layers.Authoring
      const component = defineComponent({ name: 'SomeTestComponent' })
      const testEntity = createEntity(entityLayer)
      setComponent(testEntity, component)
      const list = [] as Entity[]
      const relationLayer = LayerFunctions.getLayerRelationsEntities(testEntity)[0][0] as LayerID
      for (const relation of LayerFunctions.getLayerRelationsEntities(testEntity)) list.push(relation[1])
      // Sanity check before running
      expect(LayerFunctions.shouldPropagate(entityLayer, relationLayer)).toBeTruthy()
      for (const linkedEntity of list) expect(hasComponent(linkedEntity, component)).toBeTruthy()
      // Run and Check the result
      removeComponent(testEntity, component)
      for (const linkedEntity of list) expect(hasComponent(linkedEntity, component)).toBeFalsy()
    })
  })

  /** @section Other tests for Coverage */
  it.todo('should not do anything if `@param entity` does not have the given `@param component`', () => {})
  it.todo(
    'should call `@param component` onRemove with `@param entity` and `component.stateMap[entity])` as arguments',
    () => {}
  )
  it.todo(
    'should call bitECS.removeComponent with `(HyperFlux.store, component, entity, false)` as arguments',
    () => {}
  )
  it.todo('should call `@param component`.reactorMap.get with `@param entity` as its argument', () => {})
  it.todo('should call `@param component`.reactorMap.delete with `@param entity` as its argument', () => {})
  it.todo(
    'should call root.stop from the result of @param component`.reactorMap.get when root.isRunning is truthy',
    () => {}
  )
  it.todo('should set `@param component`.stateMap[`@param entity`] to none by calling its .set method', () => {})
}) //:: removeComponent

describe('LayerComponents', () => {
  // This array of Components is used for propagation logic upon setting, and for querying
  it('should contain the expected number of components', () => {
    const Expected = Object.entries(Layers).length
    const result = LayerComponents.length
    expect(result).toBe(Expected)
  })

  it('should contain a list of valid Components', () => {
    for (const component of LayerComponents) {
      expect(component?.isComponent).toBeTruthy()
      expect(component?.name).not.toBeFalsy()
      expect(component?.name.endsWith('Component'))
    }
  })

  it('should contain a Component for every LayerID defined by the `Layers` object', () => {
    const ExpectedList = Object.values(Layers)
    for (const layerID of ExpectedList) expect(LayerComponents[layerID]).toBeTruthy()
  })

  it('should not contain duplicate entries', () => {
    const ExpectedList = Object.values(Layers)
    // @note
    // This duplication check assumes that entries of the Layers object are in order by their LayerID
    // and that their value matches their position on the array.
    // eg: Layers[ 0] ===  0 as LayerID
    //   : Layers[ 1] ===  1 as LayerID
    //   : Layers[42] === 42 as LayerID
    for (let id = 0; id < ExpectedList.length; ++id) {
      if ((id as LayerID) === ExpectedList[id]) continue
      for (const layerID of ExpectedList) expect(ExpectedList[id]).not.toBe(layerID)
    }
  })

  describe('*LayerComponent', () => {
    beforeEach(() => {
      createEngine()
    })

    afterEach(() => {
      destroyEngine()
    })

    describe('name', () => {
      const layerNameSuffix = LayerComponent.name

      it('should have the expected value', () => {
        for (const [name, id] of Object.entries(Layers)) {
          const result = LayerComponents[id].name
          expect(result).toBeTruthy()
          expect(result.endsWith(layerNameSuffix)).toBeTruthy()
          expect(result).toBe(name + layerNameSuffix)
        }
      })

      it('should respect the naming convention for Components', () => {
        for (const id of Object.values(Layers)) {
          const result = LayerComponents[id].name
          expect(result).toBeTruthy()
          expect(result.endsWith('Component')).toBeTruthy()
        }
      })
    }) //:: name

    describe('onSet', () => {
      describe("for every entity,relation pair returned by LayerFunctions.getLayerRelationsTypes for this component's layer ..", () => {
        /** @todo */
        it.todo('.. should not do anything for this pair if the relation is not LayerRelationTypes.Propagate', () => {
          // Set the data as expected
          const testQuery = defineQuery([])
          const before1 = testQuery().length
          expect(before1).toBe(0)
          const layer = Layers.Simulation
          const testEntity = createEntity(layer)
          // Sanity check before running
          expect(LayerFunctions.getLayerRelationsTypes(layer)[0][1]).not.toBe(LayerRelationTypes.Propagate)
          const before2 = testQuery().length
          expect(before2).toBe(1)
          // Run and Check the result
          LayerComponents[layer].onSet(testEntity, {} as any)
          const result = testQuery().length
          expect(result).toBe(1)
        })

        it(".. should create a new entity on this pair's layer", () => {
          // Set the data as expected
          const testQuery = defineQuery([])
          const before1 = testQuery().length
          expect(before1).toBe(0)
          const layer = Layers.Authoring
          const testEntity = createEntity(layer)
          // Sanity check before running
          expect(LayerFunctions.getLayerRelationsTypes(layer)[0][1]).toBe(LayerRelationTypes.Propagate)
          const before2 = testQuery().length
          expect(before2).toBe(1)
          // Run and Check the result
          LayerComponents[layer].onSet(testEntity, {} as any)
          const result = testQuery().length
          expect(result).toBe(2)
        })

        /** @todo */
        it.todo(".. should set the relations on the LayerComponent of this Layer to this pair's entity", () => {})
        it.todo('.. should set [linkedLayer].refs[linkedEntity] to `@param entity`', () => {})
      })
    }) //:: onSet

    describe('onRemove', () => {
      describe("for every entity,relation pair returned by LayerFunctions.getLayerRelationsTypes for this component's layer ..", () => {
        it.todo('.. should not do anything for this pair if the relation is not LayerRelationTypes.Propagate', () => {})
        it.todo(
          '.. should call removeEntity on the entity stored at getComponent(entity, LayerComponents[layer]).relations[linkedLayer]',
          () => {}
        )
        it.todo('.. should delete the LayerComponents[linkedLayer].refs[relation] array entry', () => {})
      })
    }) //:: onRemove
  }) //:: *LayerComponent
}) //:: LayerComponents

describe('LayerComponent', () => {
  beforeEach(() => {
    createEngine()
  })

  afterEach(() => {
    destroyEngine()
  })

  describe('name', () => {
    it('should have the expected value', () => {
      const Expected = 'LayerComponent'
      const result = LayerComponent.name
      expect(result).toBe(Expected)
    })

    it('should respect the naming convention for Components', () => {
      const result = LayerComponent.name
      expect(result).toBeTruthy()
      expect(result.endsWith('Component')).toBeTruthy()
    })
  }) //:: name

  describe('onSet', () => {
    it('should set the value of LayerComponent.layer for `@param entity` to the value of `@param layer`', () => {
      const Expected = Layers.Simulation
      const Initial = 42 as LayerID
      // Set the data as expected
      const layer = Expected
      const testEntity = createEntity(layer)
      LayerComponent.layer[testEntity] = Initial
      // Sanity check before running
      const before = LayerComponent.layer[testEntity]
      expect(before).toBe(Initial)
      expect(before).not.toBe(Expected)
      // Run and Check the result
      LayerComponent.onSet(testEntity, {} as any, layer)
      const result = LayerComponent.layer[testEntity]
      expect(result).not.toBe(Initial)
      expect(result).toBe(Expected)
    })

    it('should set the LayerComponents with `@param layer` id from the LayerComponents array into the entity', () => {
      // Set the data as expected
      const layer = Layers.Simulation
      const testEntity = createEntity(layer)
      const component = LayerComponents[layer]
      removeComponent(testEntity, component) // Manually remove the component to ensure the code adds it back as expected  (createEntity already added it)
      // Sanity check before running
      const before = hasComponent(testEntity, component)
      expect(before).toBeFalsy()
      // Run and Check the result
      LayerComponent.onSet(testEntity, {} as any, layer)
      const result = hasComponent(testEntity, component)
      expect(result).toBeTruthy()
    })
  }) //:: onSet

  describe('get', () => {
    it('should return the `@param entity` entry of the LayerComponent.layer array/list as a LayerID type', () => {
      const Expected = 255 as LayerID
      const Initial = Layers.Simulation
      // Set the data as expected
      const layer = Initial
      const testEntity = createEntity(layer)
      // Sanity check before running
      const before = LayerComponent.layer[testEntity]
      expect(before).toBe(Initial)
      expect(before).not.toBe(Expected)
      // Run and Check the result
      LayerComponent.layer[testEntity] = Expected // @note Temporary fake layer. Needs cleanup at the end of the test.
      const result = LayerComponent.get(testEntity)
      expect(result).not.toBe(Initial)
      expect(result).toBe(Expected)
      // Cleanup after running
      LayerComponent.layer[testEntity] = Initial // Remove the fake layer from the list. Avoids errors on `destroyEngine`
    })
  }) //:: get

  describe('onRemove', () => {
    it('should remove the LayerComponent returned by LayerFunctions.getLayerComponent for the `@param entity`', () => {
      // Set the data as expected
      const layer = Layers.Simulation
      const testEntity = createEntity(layer)
      const component = LayerComponents[layer]
      // Sanity check before running
      expect(hasComponent(testEntity, component)).toBeTruthy()
      // Run and Check the result
      LayerComponent.onRemove(testEntity, {} as any)
      expect(hasComponent(testEntity, component)).toBeFalsy()
    })

    it('should set the `@param entity` entry of the LayerComponent.layer array/list to 0', () => {
      const Expected = Object.values(Layers)[0]
      const Initial = Object.values(Layers)[1]
      // Set the data as expected
      const layer = Initial
      const testEntity = createEntity(layer)
      LayerComponent.layer[testEntity] = Initial // Temporary fake layer. Should be replaced by the function
      // Sanity check before running
      const before = LayerComponent.layer[testEntity]
      expect(before).toBe(Initial)
      expect(before).not.toBe(Expected)
      // Run and Check the result
      LayerComponent.onRemove(testEntity, {} as any)
      const result = LayerComponent.layer[testEntity]
      expect(result).not.toBe(Initial)
      expect(result).toBe(Expected)
    })
  }) //:: onRemove

  describe('hasUpstreamEntity', () => {
    it('should return false if LayerComponent.get(entity) is not Layers.Simulation', () => {
      const Expected = false
      // Set the data as expected
      const layer = Layers.Authoring
      const testEntity = createEntity(layer)
      // Sanity check before running
      expect(LayerComponent.get(testEntity)).not.toBe(Layers.Simulation)
      // Run and Check the result
      const result = LayerComponent.hasUpstreamEntity(testEntity)
      expect(result).toBe(Expected)
    })

    describe('when LayerComponent.get(entity) is Layers.Simulation ..', () => {
      it('.. should return false if LayerComponents[Layers.Simulation].refs[entity] is undefined', () => {
        const Expected = false
        // Set the data as expected
        const layer = Layers.Simulation
        const ref = undefined
        const testEntity = createEntity(layer)
        // Sanity check before running
        expect(LayerComponent.get(testEntity)).toBe(Layers.Simulation)
        expect(LayerComponents[Layers.Simulation].refs[testEntity]).toBe(ref)
        // Run and Check the result
        const result = LayerComponent.hasUpstreamEntity(testEntity)
        expect(result).toBe(Expected)
      })

      it('.. should return false if LayerComponents[Layers.Simulation].refs[entity] is UndefinedEntity', () => {
        const Expected = false
        // Set the data as expected
        const layer = Layers.Simulation
        const ref = UndefinedEntity
        const testEntity = createEntity(layer)
        LayerComponents[Layers.Simulation].refs[testEntity] = ref
        // Sanity check before running
        expect(LayerComponent.get(testEntity)).toBe(Layers.Simulation)
        expect(LayerComponents[Layers.Simulation].refs[testEntity]).toBe(ref)
        // Run and Check the result
        const result = LayerComponent.hasUpstreamEntity(testEntity)
        expect(result).toBe(Expected)
      })

      it('.. should return false if entityExists(LayerComponents[Layers.Simulation].refs[entity]) returns a falsy value', () => {
        const Expected = false
        // Set the data as expected
        const layer = Layers.Simulation
        const testEntity = createEntity(layer)
        const fakeEntity = Number.MAX_SAFE_INTEGER as Entity
        LayerComponents[Layers.Simulation].refs[testEntity] = fakeEntity
        // Sanity check before running
        expect(LayerComponent.get(testEntity)).toBe(Layers.Simulation)
        expect(LayerComponents[Layers.Simulation].refs[testEntity]).not.toBe(undefined)
        expect(LayerComponents[Layers.Simulation].refs[testEntity]).not.toBe(UndefinedEntity)
        expect(entityExists(fakeEntity)).toBeFalsy()
        expect(entityExists(LayerComponents[Layers.Simulation].refs[testEntity])).toBeFalsy()
        // Run and Check the result
        const result = LayerComponent.hasUpstreamEntity(testEntity)
        expect(result).toBe(Expected)
      })

      it('.. should return true if LayerComponents[Layers.Simulation].refs[entity] is a valid entity that is considered to exist', () => {
        const Expected = true
        // Set the data as expected
        const layer = Layers.Simulation
        const testEntity = createEntity(layer)
        const otherEntity = createEntity()
        LayerComponents[Layers.Simulation].refs[testEntity] = otherEntity
        // Sanity check before running
        expect(LayerComponent.get(testEntity)).toBe(Layers.Simulation)
        expect(LayerComponents[Layers.Simulation].refs[testEntity]).not.toBe(undefined)
        expect(LayerComponents[Layers.Simulation].refs[testEntity]).not.toBe(UndefinedEntity)
        expect(entityExists(otherEntity)).toBeTruthy()
        expect(entityExists(LayerComponents[Layers.Simulation].refs[testEntity])).toBeTruthy()
        // Run and Check the result
        const result = LayerComponent.hasUpstreamEntity(testEntity)
        expect(result).toBe(Expected)
      })
    })
  }) //:: hasUpstreamEntity
}) //:: LayerComponent

describe('Queries', () => {
  // @todo After the refactor is merged
  describe('defineQuery', () => {}) //:: defineQuery
  describe('useQuery', () => {}) //:: useQuery
  // @note The rest of the QueryFunctions file is not affected by the Layers changes
}) //:: Queries
