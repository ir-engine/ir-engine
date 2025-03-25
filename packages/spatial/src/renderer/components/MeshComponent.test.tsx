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

import assert from 'assert'
import { BoxGeometry, Mesh, MeshBasicMaterial, SphereGeometry } from 'three'
import { afterEach, beforeEach, describe, it } from 'vitest'

import {
  createEntity,
  getComponent,
  hasComponent,
  removeComponent,
  removeEntity,
  setComponent,
  UndefinedEntity
} from '@ir-engine/ecs'
import { destroyEngine } from '@ir-engine/ecs/src/Engine'

import { createEngine } from '@ir-engine/ecs/src/Engine'
import { MeshComponent } from './MeshComponent'
import { ObjectComponent } from './ObjectComponent'

describe('MeshComponent', () => {
  describe('IDs', () => {
    it('should initialize the MeshComponent.name field with the expected value', () => {
      assert.equal(MeshComponent.name, 'MeshComponent')
    })
  }) //:: IDs

  describe('onInit', () => {
    let testEntity = UndefinedEntity

    beforeEach(async () => {
      createEngine()
      testEntity = createEntity()
    })

    afterEach(() => {
      removeEntity(testEntity)
      return destroyEngine()
    })

    it('should initialize the component correctly', () => {
      const geometry = new BoxGeometry(1, 1, 1)
      const material = new MeshBasicMaterial({ color: 0xffff00 })

      setComponent(testEntity, MeshComponent, new Mesh(geometry, material))

      assert(hasComponent(testEntity, MeshComponent))
      const data = getComponent(testEntity, MeshComponent)
      assert.equal(data.geometry === geometry, true)
      assert.equal(data.material === material, true)

      removeComponent(testEntity, MeshComponent)

      assert(!hasComponent(testEntity, MeshComponent))
    })

    it("shouldn't serialize the mesh", () => {
      const geometry = new BoxGeometry(1, 1, 1)
      const material = new MeshBasicMaterial({ color: 0xffff00 })

      setComponent(testEntity, MeshComponent, new Mesh(geometry, material))
      const data = getComponent(testEntity, MeshComponent)
      const json = MeshComponent.toJSON(data)
      assert(json === null)
    })
  }) //:: onInit

  describe('onSet', () => {
    let testEntity = UndefinedEntity

    beforeEach(async () => {
      createEngine()
      testEntity = createEntity()
    })

    afterEach(() => {
      removeEntity(testEntity)
      return destroyEngine()
    })

    it('should throw an error if the data assigned does not provide a valid `MeshComponent.geometry` object', () => {
      assert.throws(() => setComponent(testEntity, MeshComponent))
    })

    it('should change the values of an initialized MeshComponent', () => {
      const Initial = new Mesh(new SphereGeometry())
      const Expected = new Mesh(new BoxGeometry())
      setComponent(testEntity, MeshComponent, Initial)
      const before = getComponent(testEntity, MeshComponent)
      assert.equal(before, Initial)
      // Run and Check the result
      setComponent(testEntity, MeshComponent, Expected)
      const result = getComponent(testEntity, MeshComponent)
      assert.notEqual(result, Initial)
      assert.equal(result, Expected)
      const obj = getComponent(testEntity, MeshComponent)
      assert.equal(obj, Expected)
    })
  }) //:: onSet

  describe('onRemove', () => {
    let testEntity = UndefinedEntity

    beforeEach(async () => {
      createEngine()
      testEntity = createEntity()
    })

    afterEach(() => {
      removeEntity(testEntity)
      return destroyEngine()
    })

    it('should remove the component from the entity', () => {
      const geometry = new BoxGeometry(1, 1, 1)
      const material = new MeshBasicMaterial({ color: 0xffff00 })

      setComponent(testEntity, MeshComponent, new Mesh(geometry, material))
      assert(hasComponent(testEntity, MeshComponent))
      removeComponent(testEntity, MeshComponent)
      assert(!hasComponent(testEntity, MeshComponent))
      assert(!hasComponent(testEntity, ObjectComponent))
    })
  })
})
