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

import { createEntity, destroyEngine, getComponent, setComponent } from '@ir-engine/ecs'
import { createEngine } from '@ir-engine/ecs/src/Engine'
import assert from 'assert'
import { TransformComponent, TransformECS, TransformGizmoTagComponent } from './TransformComponent'

describe('TransformComponent', () => {
  describe('Fields', () => {
    it('should initialize the *Component.name field with the expected value', () => {
      assert.equal(TransformComponent.name, 'TransformComponent')
    })

    it('should initialize the *Component.jsonID field with the expected value', () => {
      assert.equal(TransformComponent.jsonID, 'EE_transform')
    })

    it('should initialize the *Component.schema field with the expected value', () => {
      assert.deepEqual(TransformComponent.schema, TransformECS)
    })
  }) //:: Fields

  describe('onInit', () => {}) //:: onInit
  describe('onSet', () => {}) //:: onSet
  describe('toJSON', () => {}) //:: toJSON
  describe('reactor', () => {}) //:: reactor
  describe('getWorldPosition', () => {}) //:: getWorldPosition
  describe('getMatrixRelativeToEntity', () => {}) //:: getMatrixRelativeToEntity
  describe('getMatrixRelativeToScene', () => {}) //:: getMatrixRelativeToScene
  describe('getWorldRotation', () => {}) //:: getWorldRotation
  describe('getWorldScale', () => {}) //:: getWorldScale
  describe('getSceneScale', () => {}) //:: getSceneScale
  describe('updateFromWorldMatrix', () => {}) //:: updateFromWorldMatrix
  describe('setWorldPosition', () => {}) //:: setWorldPosition
  describe('setWorldRotation', () => {}) //:: setWorldRotation
  describe('setWorldScale', () => {}) //:: setWorldScale
  describe('forward', () => {}) //:: forward
  describe('back', () => {}) //:: back
  describe('up', () => {}) //:: up
  describe('down', () => {}) //:: down
  describe('right', () => {}) //:: right
  describe('left', () => {}) //:: left
  describe('transformsNeedSorting', () => {}) //:: transformsNeedSorting

  describe('General Purpose', () => {
    beforeEach(async () => {
      createEngine()
    })

    afterEach(() => {
      return destroyEngine()
    })

    it('should create a valid TransformComponent', () => {
      const entity = createEntity()

      setComponent(entity, TransformComponent)
      const transformComponent = getComponent(entity, TransformComponent)
      assert.equal(TransformComponent.dirtyTransforms[entity], true)
      transformComponent.position.x = 12
      assert.equal(transformComponent.position.x, TransformComponent.position.x[entity])
    })
  }) //:: General Purpose
}) //:: TransformComponent

describe('composeMatrix', () => {}) //:: composeMatrix
describe('decomposeMatrix', () => {}) //:: decomposeMatrix
describe('setFromRotationMatrix', () => {}) //:: setFromRotationMatrix

describe('TransformGizmoTagComponent', () => {
  describe('Fields', () => {
    it('should initialize the *Component.name field with the expected value', () => {
      assert.equal(TransformGizmoTagComponent.name, 'TransformGizmoTagComponent')
    })
  }) //:: Fields
}) //:: TransformGizmoTagComponent
