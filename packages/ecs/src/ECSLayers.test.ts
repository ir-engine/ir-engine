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
describe('removeEntity', () => {}) //:: removeEntity

// @note High complexity
describe('setComponent', () => {
  describe('Propagation', () => {}) //:: Propagation
}) //:: setComponent

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
  describe('SimulationLayerComponent', () => {}) //:: SimulationLayerComponent
  describe('AuthoringLayerComponent', () => {}) //:: AuthoringLayerComponent
}) //:: LayerComponents
describe('LayerComponent', () => {}) //:: LayerComponent
describe('UUIDComponent', () => {}) //:: UUIDComponent
describe('Queries', () => {}) //:: Queries

//......................................................................................................................
//......................................................................................................................
describe.skip('old-tests-reference', () => {
  // @warning Broken. Will remove.
  // Reference from an old implementation.
  describe('setComponent: Authoring Layer', async () => {
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
