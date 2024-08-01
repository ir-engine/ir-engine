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

import {
  createEngine,
  createEntity,
  destroyEngine,
  getComponent,
  removeEntity,
  setComponent,
  UndefinedEntity
} from '@etherealengine/ecs'
import assert from 'assert'
import { Object3D } from 'three'
import { Object3DComponent } from './Object3DComponent'

const Object3DComponentDefaults = null! as Object3D

function assertObject3DComponentEq(A, B) {
  assert.equal(Boolean(A), Boolean(B))
  assert.equal(A.isObject3D, B.isObject3D)
  /** @todo Check other properties */
}

describe('Object3DComponent', () => {
  describe('IDs', () => {
    it('should initialize the Object3DComponent.name field with the expected value', () => {
      assert.equal(Object3DComponent.name, 'Object3DComponent')
    })

    it('should initialize the Object3DComponent.jsonID field with the expected value', () => {
      assert.equal(Object3DComponent.jsonID, 'EE_mesh')
    })
  }) //:: IDs

  describe('onInit', () => {
    let testEntity = UndefinedEntity

    beforeEach(async () => {
      createEngine()
      testEntity = createEntity()
      setComponent(testEntity, Object3DComponent)
    })

    afterEach(() => {
      removeEntity(testEntity)
      return destroyEngine()
    })

    it('should initialize the component with the expected default values', () => {
      const data = getComponent(testEntity, Object3DComponent)
      assertObject3DComponentEq(data, Object3DComponentDefaults)
    })
  }) //:: onInit

  describe('onSet', () => {
    // it('should change the values of an initialized Object3DComponent', () => {})
    // it('should not change values of an initialized Object3DComponent when the data passed had incorrect types', () => {})
    // it('should throw an error if the data assigned does not provide a valid `Object3D` object', () => {})
  }) //:: onSet
  /** @todo @maybe Should this component have a reactor that updates the name of the object when a NameComponent is set on the entity after its Object3DComponent is set? */
})
