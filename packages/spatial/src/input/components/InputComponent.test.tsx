/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/EtherealEngine/etherealengine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Ethereal Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Ethereal Engine team.

All portions of the code written by the Ethereal Engine team are Copyright © 2021-2023 
Ethereal Engine. All Rights Reserved.
*/

import assert from 'assert'

import {
  getComponent,
  getMutableComponent,
  hasComponent,
  setComponent
} from '@etherealengine/ecs/src/ComponentFunctions'
import { destroyEngine } from '@etherealengine/ecs/src/Engine'
import { ReactorReconciler, getState } from '@etherealengine/hyperflux'

import { Entity, EntityUUID, UndefinedEntity, createEntity, removeEntity } from '@etherealengine/ecs'
import { createEngine } from '@etherealengine/ecs/src/Engine'
import { EngineState } from '../../EngineState'
import { initializeSpatialEngine } from '../../initializeEngine'
import { assertArrayEqual } from '../../physics/components/RigidBodyComponent.test'
import { HighlightComponent } from '../../renderer/components/HighlightComponent'
import { InputComponent } from './InputComponent'

const InputComponentDefaults = {
  inputSinks: ['Self'] as EntityUUID[],
  activationDistance: 2,
  highlight: true,
  grow: false,
  inputSources: [] as Entity[]
}
function assertInputComponentEq(A, B): void {
  assertArrayEqual(A.inputSinks, B.inputSinks)
  assert.equal(A.activationDistance, B.activationDistance)
  assert.equal(A.highlight, B.highlight)
  assert.equal(A.grow, B.grow)
  assertArrayEqual(A.inputSources, B.inputSources)
}

describe('InputComponent', () => {
  describe('IDs', () => {
    it('should initialize the InputComponent.name field with the expected value', () => {
      assert.equal(InputComponent.name, 'InputComponent')
    })
  })

  describe('onInit', () => {
    let testEntity = UndefinedEntity

    beforeEach(async () => {
      createEngine()
      testEntity = createEntity()
      setComponent(testEntity, InputComponent)
    })

    afterEach(() => {
      removeEntity(testEntity)
      return destroyEngine()
    })

    it('should initialize the component with the expected default values', () => {
      const data = getComponent(testEntity, InputComponent)
      assertInputComponentEq(data, InputComponentDefaults)
    })
  }) // << onInit

  describe('onSet', () => {
    let testEntity = UndefinedEntity

    beforeEach(async () => {
      createEngine()
      testEntity = createEntity()
      setComponent(testEntity, InputComponent)
    })

    afterEach(() => {
      removeEntity(testEntity)
      return destroyEngine()
    })

    it('should change the values of an initialized InputComponent', () => {
      const before = getComponent(testEntity, InputComponent)
      assertInputComponentEq(before, InputComponentDefaults)
      const Expected = {
        inputSinks: ['SomeUUID'] as EntityUUID[],
        activationDistance: 10_000,
        highlight: false,
        grow: true,
        inputSources: [] as Entity[]
      }
      setComponent(testEntity, InputComponent, Expected)
      const after = getComponent(testEntity, InputComponent)
      assertInputComponentEq(after, Expected)
    })

    it('should not change values of an initialized InputComponent when the data passed had incorrect types', () => {
      const before = getComponent(testEntity, InputComponent)
      assertInputComponentEq(before, InputComponentDefaults)
      const Incorrect = {
        inputSinks: false,
        activationDistance: false,
        highlight: 46 & 2,
        grow: 'invalid',
        inputSources: [] as Entity[]
      }
      // @ts-ignore Override the linter to force-send invalid types
      setComponent(testEntity, InputComponent, Incorrect)
      const after = getComponent(testEntity, InputComponent)
      assertInputComponentEq(after, InputComponentDefaults)
    })
  }) // << onSet

  describe('reactor', () => {
    beforeEach(() => {
      createEngine()
      initializeSpatialEngine()
    })

    afterEach(() => {
      return destroyEngine()
    })

    it('should add a HighlightComponent to the entity when the InputComponent is set with `highlight: true', async () => {
      const entity = getState(EngineState).localFloorEntity

      const Expected = { highlight: true, grow: true }
      ReactorReconciler.flushSync(() => {
        setComponent(entity, InputComponent, Expected)
      })
      const result = getComponent(entity, InputComponent)

      assert.equal(result.grow, Expected.grow)
      assert.equal(result.highlight, Expected.highlight)

      ReactorReconciler.flushSync(() => {
        getMutableComponent(entity, InputComponent).inputSources.merge([entity])
      })

      assert(hasComponent(entity, HighlightComponent))
    })
  })
})
