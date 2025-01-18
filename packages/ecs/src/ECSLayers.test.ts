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

import { afterEach, assert, beforeEach, describe, expect, it } from 'vitest'

import { getState, HyperFlux } from '@ir-engine/hyperflux'
import { TransformComponent } from '@ir-engine/spatial/src/transform/components/TransformComponent'
import * as bitECS from 'bitecs'
import { Vector3 } from 'three'
import {
  getComponent,
  hasComponent,
  LayerComponent,
  LayerID,
  Layers,
  removeComponent,
  setComponent
} from './ComponentFunctions'
import { createEntity } from './createEntity'
import { createEngine, destroyEngine } from './Engine'
import { Entity } from './Entity'
import { entityExists, removeEntity } from './EntityFunctions'
import { EntityTreeComponent } from './EntityTree'
import { UUIDComponent } from './UUIDComponent'

/** @todo Move this describe into `EntityFunctions.test.tsx` instead */
describe('createEntity', () => {
  beforeEach(() => {
    createEngine()
  })

  afterEach(() => {
    destroyEngine()
  })

  it('should use Layers.Simulation as the default value for `@param layerID` when it is omitted', () => {
    const Expected = Layers.Simulation
    const testEntity = createEntity()
    const result = getComponent(testEntity, LayerComponent).layer
    expect(result).toBe(Expected)
  })

  it('should create a new entity by calling bitECS.addEntity with HyperFlux.store as its world argument', () => {
    const testEntity = createEntity()
    const result = bitECS.entityExists(HyperFlux.store, testEntity)
    expect(result).toBeTruthy()
  })

  it('should set a LayerComponent on the newly created entity with `@param layerID` as its layer argument', () => {
    const expectedLayer = Layers.Authoring
    const testEntity = createEntity(expectedLayer)
    const result = getComponent(testEntity, LayerComponent)
    expect(result).toBeTruthy()
    expect(result.layer).toBe(expectedLayer)
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

/** @todo Move this describe into `EntityFunctions.test.tsx` instead */
describe('removeEntity', () => {
  beforeEach(() => {
    createEngine()
  })

  afterEach(() => {
    destroyEngine()
  })

  it('should call bitECS.removeEntity with HyperFlux.store and `@param entity` as arguments', () => {
    const testEntity = bitECS.addEntity(HyperFlux.store) as Entity
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

describe('setComponent', () => {
  /** @section ECS Layers specific tests */
  it.todo('should call LayerFunctions.propagateLayer with (entity, component, args) as arguments', () => {})

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

describe('LayerFunctions', () => {
  describe('getLayerRelations', () => {
    it.todo(
      'should return an array of arrays that contains valid layer ID numbers in slot 0 of each subarray',
      () => {}
    )
    it.todo('should return an array of arrays that contains valid Entity IDs in slot 1 of each subarray', () => {})
    it.todo(
      'should retrieve the `@param entity` Layer relations from the LayerFunctions.getLayerComponent(entity) component and map them as expected into the result',
      () => {}
    )
  }) //:: getLayerRelations

  describe('getLayerComponent', () => {
    it.todo(
      'should return the expected Layer component for the `@param entity` from the `LayerComponents` map',
      () => {}
    )
  }) //:: getLayerComponent

  describe('hasLayer', () => {
    it.todo('should return false when the result of LayerFunctions.getLayerComponent(`@param entity`)', () => {})
    it.todo(
      'should return false when the result of hasComponent(`@param entity`, LayerFunctions.getLayerComponent(`@param entity`)) is falsy',
      () => {}
    )
    it.todo(
      'should return true when the result of LayerFunctions.getLayerComponent(`@param entity`) and hasComponent(`@param entity`, LayerFunctions.getLayerComponent(`@param entity`)) are both truthy',
      () => {}
    )
  }) //:: hasLayer

  describe('shouldPropagate', () => {
    it.todo('should return true if the given entity/layer pair is expected to trigger propagation behavior.', () => {})
    it.todo(
      'should return false if the given entity/layer pair is not expected to trigger propagation behavior.',
      () => {}
    )
  }) //:: shouldPropagate

  describe('propagateLayer', () => {
    it.todo('should not do anything if `@param component` is LayerComponent', () => {})
    it.todo('should not do anything if the LayerComponents array contains `@param component`', () => {})
    describe('for every (layer,entity) pair returned by LayerFunctions.getLayerRelations for the `@param entity`', () => {
      it.todo(
        '.. should not do anything for this pair if the result of LayerFunctions.shouldPropagate(linkedEntity, linkedLayer) is falsy',
        () => {}
      )
      it.todo(
        '.. should call LayerFunctions.propagateSchema with (linkedLayer, component, args) as arguments when `@param component`.schema is truthy',
        () => {}
      )
      it.todo(
        '.. should call setComponent with (linkedEntity, `@param component`, `@param args`) as arguments',
        () => {}
      )
    })
  }) //:: propagateLayer

  describe('getAuthoringCounterpart', () => {
    it.todo(
      'should return the entity stored in the `.refs` field of the AuthoringLayerComponent for the given `@param entity`',
      () => {}
    )
  }) //:: getAuthoringCounterpart

  /** @todo */
  // @note High complexity
  describe.todo('propagateSchema', () => {}) //:: propagateSchema
}) //:: LayerFunctions

describe('removeComponent', () => {
  it.todo('should not do anything if `@param entity` does not have the given `@param component`', () => {})
  describe('when the result of LayerFunctions.hasLayer(`@param entity`) is truthy (aka the entity has an ECS layer) ...', () => {
    describe('.. for every (layer,entity) pair returned by LayerFunctions.getLayerRelations(`@param entity`)', () => {
      it.todo(
        '.. .. should not do anything if LayerFunctions.shouldPropagate(`@param entity`, layer) is falsy',
        () => {}
      )
      it.todo(
        '.. .. should remove `@param component` from the linkedEntity returned by LayerFunctions.getLayerRelations',
        () => {}
      )
    })
  })
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
  it.todo('should contain the expected number of components', () => {})
  it.todo('should contain a list of valid Components', () => {})
  it.todo(
    'should contain a Component for every LayerID defined by the `Layers` object that all have the expected name',
    () => {}
  )
  describe('*LayerComponent', () => {
    describe('name', () => {
      it.todo('should have the expected value', () => {})
      it.todo('should respect the naming convention for Components', () => {})
    }) //:: name
    describe('onSet', () => {
      describe("for every entity,relation pair returned by LayerFunctions.getLayerRelationsTypes for this component's layer ..", () => {
        it.todo('.. should not do anything for this pair if the relation is LayerRelationTypes.Propagate', () => {})
        it.todo(".. should create a new entity on this pair's layer", () => {})
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
  // LayerComponent is the API for setting and getting the layer of an entity
  describe('name', () => {
    it.todo('should have the expected value', () => {})
    it.todo('should respect the naming convention for Components', () => {})
  }) //:: name

  describe('onSet', () => {
    it.todo('should set the value of LayerComponent.layer for `@param entity` to the value of `@param layer`', () => {})
    it.todo(
      'should set the LayerComponents with `@param layer` id from the LayerComponents array into the entity',
      () => {}
    )
  }) //:: onSet

  describe('get', () => {
    it.todo(
      'should return the `@param entity` entry of the LayerComponent.layer array/list as a LayerID type',
      () => {}
    )
  }) //:: get

  describe('onRemove', () => {
    it.todo(
      'should remove the LayerComponent returned by LayerFunctions.getLayerComponent for the `@param entity`',
      () => {}
    )
    it.todo('should set the `@param entity` entry of the LayerComponent.layer array/list to 0', () => {})
  }) //:: onRemove

  describe('hasUpstreamEntity', () => {
    it.todo('should return false if LayerComponent.get(entity) is not Layers.Simulation', () => {})
    describe('when LayerComponent.get(entity) is Layers.Simulation ..', () => {
      it.todo('.. should return false if LayerComponents[Layers.Simulation].refs[entity] is undefined', () => {})
      it.todo('.. should return false if LayerComponents[Layers.Simulation].refs[entity] is UndefinedEntity', () => {})
      it.todo(
        '.. should return false if entityExists(LayerComponents[Layers.Simulation].refs[entity]) returns a falsy value',
        () => {}
      )
      it.todo(
        '.. should return true if LayerComponents[Layers.Simulation].refs[entity] is a valid entity that is considered to exist',
        () => {}
      )
    })
  }) //:: hasUpstreamEntity
}) //:: LayerComponent

describe('UUIDComponent', () => {
  describe('name', () => {}) //:: name
  describe('jsonID', () => {}) //:: jsonID

  describe('onSet', () => {
    it.todo(
      'should call UUIDComponentFunctions._getUUIDState with (currentUUID, layer) as arguments and set its value to UndefinedEntity if `@param component`.value is truthy ',
      () => {}
    )
    it.todo(
      'should call UUIDComponentFunctions._getUUIDState with (`@param uuid`, layer) as arguments and set its value to `@param entity`',
      () => {}
    )
    it.todo('should call `@param component`.set with `@param uuid` as its argument', () => {})
  }) //:: onSet

  describe('onRemove', () => {
    it.todo(
      'should call UUIDComponentFunctions._getUUIDState with (currentUUID, layer) as arguments and set its value to UndefinedEntity if `@param component`.value is truthy ',
      () => {}
    )
  }) //:: onRemove

  describe('useEntityByUUID', () => {
    it.todo(
      'should return the result.value of calling useHookstate with UUIDComponentFunctions._getUUIDState(uuid, `@param layer`) as its argument',
      () => {}
    )
    it.todo(
      'should return the result.value of calling useHookstate with UUIDComponentFunctions._getUUIDState(uuid, Layers.Simulation) as its argument when `@param layer` is not provided',
      () => {}
    )
  }) //:: useEntityByUUID

  describe('getEntityByUUID', () => {
    it.todo(
      'should return the NO_PROXY_STEALTH result of calling UUIDComponentFunctions._getUUIDState with (uuid, `@param layer`) as its arguments',
      () => {}
    )
    it.todo(
      'should return the NO_PROXY_STEALTH result of calling UUIDComponentFunctions._getUUIDState with (uuid, Layers.Simulation) as its arguments when `@param layer` is not provided',
      () => {}
    )
  }) //:: getEntityByUUID

  describe('getOrCreateEntityByUUID', () => {
    it.todo(
      'should create a new entity and set its UUIDComponent to `@param uuid` when the result.value of UUIDComponentFunctions._getUUIDState(uuid, layer) is falsy',
      () => {}
    )
    it.todo(
      'should return the result.value of UUIDComponentFunctions._getUUIDState with (`@param uuid`, `@param layer`) as its arguments',
      () => {}
    )
  }) //:: getOrCreateEntityByUUID

  describe('generateUUID', () => {
    // not affected by layers, just for completion
  }) //:: generateUUID

  describe('function _getUUIDState', () => {
    // should set UUIDComponent.entitiesByUUIDState to `{}` when it is falsy
  }) //:: _getUUIDState
}) //:: UUIDComponent

describe('Queries', () => {
  // @todo After the refactor is merged
  describe('defineQuery', () => {}) //:: defineQuery
  describe('useQuery', () => {}) //:: useQuery
  // @note The rest of the QueryFunctions file is not affected by the Layers changes
}) //:: Queries

//......................................................................................................................
//......................................................................................................................
describe.skip('old-tests-reference', () => {
  // @warning Broken. Will remove.
  // Reference from an old implementation.
  describe('setComponent: Authoring Layer', async () => {
    // changes target entity to destination layer
    // adds component to destination layer entity
    // removes component from destination layer entity
    it('changes target entity to destination layer', async () => {
      createEngine()

      const parentEntity = createEntity('authoring' as LayerID)
      const childEntity = createEntity('authoring' as LayerID)
      const layerState = getState(EntityLayerState)
      console.log(layerState)
      const simParent = EntityLayerState.getLinkedEntity(parentEntity, 'simulation' as LayerID)
      const simChild = EntityLayerState.getLinkedEntity(childEntity, 'simulation' as LayerID)

      setComponent(childEntity, EntityTreeComponent, { parentEntity })

      const simChildETree = getComponent(simChild, EntityTreeComponent)
      assert.equal(simChildETree.parentEntity, simParent)

      const authChildETree = getComponent(childEntity, EntityTreeComponent)
      assert.equal(authChildETree.parentEntity, parentEntity)

      destroyEngine()
    })

    it('adds component to destination layer entity', async () => {
      createEngine()

      const entity = createEntity('authoring' as LayerID)
      const simEntity = EntityLayerState.getLinkedEntity(entity, 'simulation' as LayerID)

      setComponent(entity, UUIDComponent, 'AAAAAAAAAAAAHHHHHHHHHHHHHHHHH' as EntityUUID)

      assert.equal(getComponent(simEntity, UUIDComponent), 'AAAAAAAAAAAAHHHHHHHHHHHHHHHHH')
      assert.equal(getComponent(entity, UUIDComponent), getComponent(simEntity, UUIDComponent))

      destroyEngine()
    })

    it('removes component from destination layer entity', async () => {
      createEngine()

      const entity = createEntity('authoring' as LayerID)
      const simEntity = EntityLayerState.getLinkedEntity(entity, 'simulation' as LayerID)

      setComponent(entity, TransformComponent, { position: new Vector3(1, 2, 3) })

      assert.equal(getComponent(simEntity, TransformComponent).position.x, 1)

      removeComponent(simEntity, TransformComponent)

      assert.equal(hasComponent(simEntity, TransformComponent), false)
      assert.equal(hasComponent(entity, TransformComponent), true)

      setComponent(entity, TransformComponent, { position: new Vector3(4, 5, 6) })

      assert.equal(getComponent(simEntity, TransformComponent).position.x, 4)
      removeComponent(entity, TransformComponent)
      assert.equal(hasComponent(simEntity, TransformComponent), false)

      destroyEngine()
    })
  })
}) // old-tests-reference
