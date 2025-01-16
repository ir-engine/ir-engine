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

import { assert, describe, it } from 'vitest'

import { getState } from '@ir-engine/hyperflux'
import { TransformComponent } from '@ir-engine/spatial/src/transform/components/TransformComponent'
import { Vector3 } from 'three'
import { getComponent, hasComponent, removeComponent, setComponent } from './ComponentFunctions'
import { createEngine, destroyEngine } from './Engine'
import { EntityTreeComponent } from './EntityTree'
import { UUIDComponent } from './UUIDComponent'
import { createEntity } from './createEntity'

/** @todo Move this describe into `EntityFunctions.test.tsx` instead */
describe('createEntity', () => {
  it.todo('should use Layers.Simulation as the default value for `@param layerID` when it is omitted', () => {})
  it.todo('should create a new entity by calling bitECS.addEntity with HyperFlux.store as its world argument', () => {})
  it.todo(
    'should set a LayerComponent on the newly created entity with `@param layerID` as its layer argument',
    () => {}
  )
  it.todo('should return the newly created entity', () => {})
}) //:: createEntity
/** @todo Move this describe into `EntityFunctions.test.tsx` instead */
describe('removeEntity', () => {
  it.todo('should return an empty `never[]` array if `@param entity` is falsy', () => {})
  it.todo('should return an empty `never[]` array if the result of `entityExists(entity)` is falsy', () => {})
  it.todo('should call removeAllComponents with `@param entity`', () => {})
  it.todo('should call bitECS.removeEntity with HyperFlux.store and `@param entity` as arguments', () => {})
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

  describe('shouldPropagate', () => {}) //:: shouldPropagate
  describe('propagateLayer', () => {}) //:: propagateLayer
  describe('getAuthoringCounterpart', () => {}) //:: getAuthoringCounterpart
  // @note High complexity
  describe('propagateSchema', () => {}) //:: propagateSchema
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
  describe('SimulationLayerComponent', () => {}) //:: SimulationLayerComponent
  describe('AuthoringLayerComponent', () => {}) //:: AuthoringLayerComponent
}) //:: LayerComponents

describe('LayerComponent', () => {
  // LayerComponent is the API for setting and getting the layer of an entity
}) //:: LayerComponent

describe('UUIDComponent', () => {
  describe('onSet', () => {}) //:: onSet
  describe('onRemove', () => {}) //:: onRemove
  describe('entitiesByUUIDState', () => {}) //:: entitiesByUUIDState
  describe('useEntityByUUID', () => {}) //:: useEntityByUUID
  describe('getEntityByUUID', () => {}) //:: getEntityByUUID
  describe('getOrCreateEntityByUUID', () => {}) //:: getOrCreateEntityByUUID
  describe('generateUUID', () => {
    // not affected by layers, just for completion
  }) //:: generateUUID
  describe('function _getUUIDState', () => {
    // not exported. Figure out how to access it
  }) //:: _getUUIDState
}) //:: UUIDComponent

describe('Queries', () => {
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
