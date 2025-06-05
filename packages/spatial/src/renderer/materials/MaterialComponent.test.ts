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

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2025
Infinite Reality Engine. All Rights Reserved.
*/

import {
  Engine,
  Entity,
  EntityID,
  SourceID,
  UUIDComponent,
  UndefinedEntity,
  createEngine,
  createEntity,
  destroyEngine,
  getComponent,
  removeEntity,
  setComponent
} from '@ir-engine/ecs'
import assert from 'assert'
import { Material } from 'three'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { assertArray } from '../../../tests/util/assert'
import { MaterialInstanceComponent, MaterialStateComponent } from './MaterialComponent'

describe('MaterialStateComponent', () => {
  describe('IDs', () => {
    it('should initialize the MaterialStateComponent.name field with the expected value', () => {
      assert.equal(MaterialStateComponent.name, 'MaterialStateComponent')
    })
  }) //:: IDs

  describe('onInit', () => {
    let testEntity = UndefinedEntity

    beforeEach(async () => {
      if (!Engine.instance) createEngine()
      testEntity = createEntity()
      setComponent(testEntity, UUIDComponent, {
        entitySourceID: 'source' as SourceID,
        entityID: 'id' as EntityID
      })
      setComponent(testEntity, MaterialStateComponent)
    })

    afterEach(() => {
      if (testEntity !== UndefinedEntity) {
        removeEntity(testEntity)
      }
      destroyEngine()
    })

    it('should initialize the component with the expected default values', () => {
      const data = getComponent(testEntity, MaterialStateComponent)
      expect(data).toEqual({
        material: undefined,
        parameters: {}
      })
    })
  }) //:: onInit

  describe('onSet', () => {
    let testEntity = UndefinedEntity

    beforeEach(async () => {
      if (!Engine.instance) createEngine()
      testEntity = createEntity()
      setComponent(testEntity, UUIDComponent, {
        entitySourceID: 'source' as SourceID,
        entityID: 'id' as EntityID
      })
      setComponent(testEntity, MaterialStateComponent, { material: new Material() })
    })

    afterEach(() => {
      if (testEntity !== UndefinedEntity) {
        removeEntity(testEntity)
      }
      destroyEngine()
    })

    it('should change the values of an initialized MaterialStateComponent', () => {
      const Expected = {
        material: new Material(),
        parameters: {}
      }
      setComponent(testEntity, MaterialStateComponent, Expected)
      const result = getComponent(testEntity, MaterialStateComponent)
      expect(result).toEqual(Expected)
    })

    it('should not change values of an initialized MaterialStateComponent when the data passed had incorrect types', () => {
      const Incorrect = {
        material: 'someMaterial',
        parameters: 41,
        instances: 42
      }
      const before = getComponent(testEntity, MaterialStateComponent)
      // @ts-ignore Coerce an incorrect type into the component's data
      setComponent(testEntity, MaterialStateComponent, Incorrect)
      const after = getComponent(testEntity, MaterialStateComponent)
      expect(before).toEqual(after)
    })
  }) //:: onSet

  describe('onRemove', () => {
    let testEntity = UndefinedEntity

    beforeEach(async () => {
      if (!Engine.instance) createEngine()
      testEntity = createEntity()
      setComponent(testEntity, MaterialStateComponent)
    })

    afterEach(() => {
      if (testEntity !== UndefinedEntity) {
        removeEntity(testEntity)
      }
      destroyEngine()
    })

    it.todo(
      "should call setMeshMaterial for every entity in the  `@param entity`.MaterialStateComponent.instances list, using that instanceEntity's material entities",
      () => {}
    )

    it.todo('should not do anything if the entity does not have a MaterialStateComponent', () => {})
  }) //:: onRemove
}) //:: MaterialStateComponent

type MaterialInstanceComponentData = {
  entities: Entity[]
}

const MaterialInstanceComponentDefaults: MaterialInstanceComponentData = {
  entities: [] as Entity[]
}

function assertMaterialInstanceComponentEq(A: MaterialInstanceComponentData, B: MaterialInstanceComponentData) {
  assertArray.eq(A.entities, B.entities)
}

describe('MaterialInstanceComponent', () => {
  describe('IDs', () => {
    it('should initialize the MaterialInstanceComponent.name field with the expected value', () => {
      assert.equal(MaterialInstanceComponent.name, 'MaterialInstanceComponent')
    })
  }) //:: IDs

  describe('onInit', () => {
    let testEntity = UndefinedEntity

    beforeEach(async () => {
      if (!Engine.instance) createEngine()
      testEntity = createEntity()
      setComponent(testEntity, MaterialInstanceComponent)
    })

    afterEach(() => {
      destroyEngine()
    })

    it('should initialize the component with the expected default values', () => {
      const data = getComponent(testEntity, MaterialInstanceComponent)
      assertMaterialInstanceComponentEq(data, MaterialInstanceComponentDefaults)
    })
  }) //:: onInit

  describe('onSet', () => {
    let testEntity = UndefinedEntity

    beforeEach(async () => {
      if (!Engine.instance) createEngine()
      testEntity = createEntity()
      setComponent(testEntity, UUIDComponent, {
        entitySourceID: 'source' as SourceID,
        entityID: 'id' as EntityID
      })
      setComponent(testEntity, MaterialInstanceComponent)
    })

    afterEach(() => {
      destroyEngine()
    })

    it('should change the values of an initialized MaterialInstanceComponent', () => {
      const entity1 = createEntity()
      const entity2 = createEntity()
      setComponent(entity1, UUIDComponent, {
        entitySourceID: 'source' as SourceID,
        entityID: 'id1' as EntityID
      })
      setComponent(entity2, UUIDComponent, {
        entitySourceID: 'source' as SourceID,
        entityID: 'id2' as EntityID
      })
      const Expected: MaterialInstanceComponentData = {
        entities: [entity1, entity2] as Entity[]
      }
      setComponent(testEntity, MaterialInstanceComponent, Expected)
      const result = getComponent(testEntity, MaterialInstanceComponent)
      assertMaterialInstanceComponentEq(result, Expected)
    })

    it('should not change values of an initialized MaterialInstanceComponent when the data passed had incorrect types', () => {
      const Incorrect = { entities: 'someUUID' }
      const before = getComponent(testEntity, MaterialInstanceComponent)
      // @ts-ignore Coerce an incorrect type into the component's data
      setComponent(testEntity, MaterialInstanceComponent, Incorrect)
      const after = getComponent(testEntity, MaterialInstanceComponent)
      assertMaterialInstanceComponentEq(before, after)
    })
  }) //:: onSet

  describe('onRemove', () => {
    let testEntity = UndefinedEntity

    beforeEach(async () => {
      if (!Engine.instance) createEngine()
      testEntity = createEntity()
    })

    afterEach(() => {
      if (testEntity !== UndefinedEntity) {
        removeEntity(testEntity)
      }
      destroyEngine()
    })

    describe("for every materialEntity in the testEntity's MaterialInstanceComponent.uuid list", () => {
      it.todo(
        "... should remove the testEntity from each materialEntity's MaterialStateComponent.instances list",
        () => {}
      )
    })
  }) //:: onRemove
}) //:: MaterialInstanceComponent
