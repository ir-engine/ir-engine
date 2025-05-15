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
  Entity,
  UndefinedEntity,
  createEngine,
  createEntity,
  destroyEngine,
  getComponent,
  hasComponent,
  removeComponent,
  removeEntity,
  setComponent
} from '@ir-engine/ecs'
import assert from 'assert'
import { BoxGeometry, Material, Mesh } from 'three'
import { afterEach, beforeEach, describe, it } from 'vitest'
import { assertArray } from '../../../tests/util/assert'
import { MeshComponent } from '../components/MeshComponent'
import {
  MaterialInstanceComponent,
  MaterialPrototypeObjectConstructor,
  MaterialStateComponent,
  PrototypeArgument,
  PrototypeArgumentValue
} from './MaterialComponent'

type MaterialStateComponentData = {
  material: Material
  parameters: { [key: string]: any }
  instances: Entity[]
}

const MaterialStateComponentDefaults: MaterialStateComponentData = {
  material: {} as Material,
  parameters: {} as { [key: string]: any },
  instances: [] as Entity[]
}

function assertMaterialStateComponentEq(A: MaterialStateComponentData, B: MaterialStateComponentData) {
  assert.equal(A.material.uuid, B.material.uuid)
  assert.deepEqual(A.parameters, B.parameters)
  assertArray.eq(A.instances, B.instances)
}

function assertMaterialStateComponentNotEq(A: MaterialStateComponentData, B: MaterialStateComponentData) {
  assert.notEqual(A.material.uuid, B.material.uuid)
  assert.notDeepEqual(A.parameters, B.parameters)
  assertArray.eq(A.instances, B.instances)
}

describe('MaterialStateComponent', () => {
  describe('IDs', () => {
    it('should initialize the MaterialStateComponent.name field with the expected value', () => {
      assert.equal(MaterialStateComponent.name, 'MaterialStateComponent')
    })
  }) //:: IDs

  describe('onInit', () => {
    let testEntity = UndefinedEntity

    beforeEach(async () => {
      createEngine()
      testEntity = createEntity()
      setComponent(testEntity, MaterialStateComponent)
    })

    afterEach(() => {
      removeEntity(testEntity)
      return destroyEngine()
    })

    it('should initialize the component with the expected default values', () => {
      const data = getComponent(testEntity, MaterialStateComponent)
      assertMaterialStateComponentEq(data, MaterialStateComponentDefaults)
    })
  }) //:: onInit

  describe('onSet', () => {
    let testEntity = UndefinedEntity

    beforeEach(async () => {
      createEngine()
      testEntity = createEntity()
      setComponent(testEntity, MaterialStateComponent)
    })

    afterEach(() => {
      removeEntity(testEntity)
      return destroyEngine()
    })

    it('should change the values of an initialized MaterialStateComponent', () => {
      const Expected: MaterialStateComponentData = {
        material: new Material(),
        parameters: [],
        instances: []
      }
      setComponent(testEntity, MaterialStateComponent, Expected)
      const result = getComponent(testEntity, MaterialStateComponent)
      assertMaterialStateComponentEq(result, Expected)
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
      assertMaterialStateComponentEq(before, after)
    })
  }) //:: onSet

  describe('onRemove', () => {
    let testEntity = UndefinedEntity

    beforeEach(async () => {
      createEngine()
      testEntity = createEntity()
      setComponent(testEntity, MaterialStateComponent)
    })

    afterEach(() => {
      removeEntity(testEntity)
      return destroyEngine()
    })

    it("should call setMeshMaterial for every entity in the  `@param entity`.MaterialStateComponent.instances list, using that instanceEntity's material entities", () => {
      // Set the data as expected
      const instance1 = createEntity()
      const instance2 = createEntity()
      const instances = [instance1, instance2] as Entity[]

      const mesh1 = new Mesh(new BoxGeometry(), [new Material(), new Material()])
      const mesh2 = new Mesh(new BoxGeometry(), [new Material(), new Material()])
      const meshes = [mesh1, mesh2] as Mesh[]

      const materialEntity1 = createEntity()
      const materialEntity2 = createEntity()
      const materialEntities = [materialEntity1, materialEntity2]

      const material1 = new Material()
      const material2 = new Material()

      setComponent(materialEntity1, MaterialStateComponent, { instances: instances, material: material1 })
      setComponent(materialEntity2, MaterialStateComponent, { instances: instances, material: material2 })

      for (const id in instances) {
        setComponent(instances[id], MaterialInstanceComponent, { entities: materialEntities })
        setComponent(instances[id], MeshComponent, meshes[id])
      }

      // Sanity check before running
      assert.equal(hasComponent(materialEntity1, MaterialStateComponent), true)
      for (const entity of getComponent(materialEntity1, MaterialStateComponent).instances) {
        assert.equal(hasComponent(entity, MaterialInstanceComponent), true)
        assert.equal(hasComponent(entity, MeshComponent), true)
        assert.notEqual(
          (getComponent(entity, MeshComponent).material as Material).uuid,
          getComponent(materialEntity1, MaterialStateComponent).material.uuid
        )
      }

      // Run and Check the result
      removeComponent(materialEntity1, MaterialStateComponent)
      for (const instance of instances) {
        const instanceMaterialEntities = getComponent(instance, MaterialInstanceComponent).entities
        const meshMaterials = getComponent(instance, MeshComponent).material as Material[]
        for (const id in instanceMaterialEntities) {
          const materialEntity = instanceMaterialEntities[id]
          if (materialEntity === materialEntity1) continue // Skip the removed entity
          if (hasComponent(materialEntity, MaterialStateComponent)) {
            assert.equal(meshMaterials[id].uuid, getComponent(materialEntity, MaterialStateComponent).material.uuid)
          }
        }
      }
    })

    it('should not do anything if the entity does not have a MaterialStateComponent', () => {
      // Set the data as expected
      const instance1 = createEntity()
      const instance2 = createEntity()
      const instances = [instance1, instance2] as Entity[]

      const mesh1 = new Mesh(new BoxGeometry(), [new Material(), new Material()])
      const mesh2 = new Mesh(new BoxGeometry(), [new Material(), new Material()])
      const meshes = [mesh1, mesh2] as Mesh[]

      const materialEntity1 = createEntity()
      const materialEntity2 = createEntity()
      const materialEntities = [materialEntity1, materialEntity2]

      const material1 = new Material()
      const material2 = new Material()

      // Don't set MaterialStateComponent on materialEntity1
      setComponent(materialEntity2, MaterialStateComponent, { instances: instances, material: material2 })

      for (const id in instances) {
        setComponent(instances[id], MaterialInstanceComponent, { entities: materialEntities })
        setComponent(instances[id], MeshComponent, meshes[id])
      }

      // Sanity check before running
      assert.equal(hasComponent(materialEntity1, MaterialStateComponent), false)
      assert.equal(hasComponent(materialEntity2, MaterialStateComponent), true)

      // Run and Check the result
      removeComponent(materialEntity1, MaterialStateComponent) // This should do nothing
      for (const instance of instances) {
        const instanceMaterialEntities = getComponent(instance, MaterialInstanceComponent).entities
        const meshMaterials = getComponent(instance, MeshComponent).material as Material[]
        // Verify that the materials haven't been changed
        for (const id in instanceMaterialEntities) {
          const materialEntity = instanceMaterialEntities[id]
          if (materialEntity === materialEntity2) {
            assert.notEqual(meshMaterials[id].uuid, getComponent(materialEntity, MaterialStateComponent).material.uuid)
          }
        }
      }
    })
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

function assertMaterialInstanceComponentNotEq(A: MaterialInstanceComponentData, B: MaterialInstanceComponentData) {
  assertArray.anyNotEq(A.entities, B.entities)
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
      createEngine()
      testEntity = createEntity()
      setComponent(testEntity, MaterialInstanceComponent)
    })

    afterEach(() => {
      removeEntity(testEntity)
      return destroyEngine()
    })

    it('should initialize the component with the expected default values', () => {
      const data = getComponent(testEntity, MaterialInstanceComponent)
      assertMaterialInstanceComponentEq(data, MaterialInstanceComponentDefaults)
    })
  }) //:: onInit

  describe('onSet', () => {
    let testEntity = UndefinedEntity

    beforeEach(async () => {
      createEngine()
      testEntity = createEntity()
      setComponent(testEntity, MaterialInstanceComponent)
    })

    afterEach(() => {
      removeEntity(testEntity)
      return destroyEngine()
    })

    it('should change the values of an initialized MaterialInstanceComponent', () => {
      const entity1 = createEntity()
      const entity2 = createEntity()
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
      createEngine()
      testEntity = createEntity()
    })

    afterEach(() => {
      removeEntity(testEntity)
      return destroyEngine()
    })

    describe("for every materialEntity in the testEntity's MaterialInstanceComponent.uuid list", () => {
      it("... should remove the testEntity from each materialEntity's MaterialStateComponent.instances list", () => {
        const otherEntity1 = createEntity()
        const otherEntity2 = createEntity()
        const materialEntities = [otherEntity1, otherEntity2]

        setComponent(otherEntity1, MaterialStateComponent, { instances: [testEntity], material: new Material() })
        setComponent(otherEntity2, MaterialStateComponent, { instances: [testEntity], material: new Material() })

        // Set the data as expected
        setComponent(testEntity, MaterialInstanceComponent, { entities: materialEntities })

        // Sanity check before running
        assert.equal(hasComponent(testEntity, MaterialInstanceComponent), true)
        for (const entity of materialEntities) {
          assert.equal(getComponent(entity, MaterialStateComponent).instances.includes(testEntity), true)
        }

        // Run and Check the result
        removeComponent(testEntity, MaterialInstanceComponent)
        for (const entity of materialEntities) {
          assert.equal(getComponent(entity, MaterialStateComponent).instances.includes(testEntity), false)
        }
      })
    })
  }) //:: onRemove
}) //:: MaterialInstanceComponent

function assertPrototypeArgumentsEq(A: PrototypeArgumentValue, B: PrototypeArgumentValue) {
  assert.equal(A.type, B.type)
  assert.deepEqual(A.default, B.default)
  assert.equal(A.min, B.min)
  assert.equal(A.max, B.max)
  if (!A.options || !B.options) {
    assert.equal(true, false)
    return
  }
  assert.equal(A.options.length, B.options?.length)
  for (const opt in A.options) assert.deepEqual(A.options[opt], B.options[opt])
}

type MaterialPrototypeComponentData = {
  prototypeArguments: PrototypeArgument
  prototypeConstructor: MaterialPrototypeObjectConstructor
}

const MaterialPrototypeComponentDefaults: MaterialPrototypeComponentData = {
  prototypeArguments: {} as PrototypeArgument,
  prototypeConstructor: {} as MaterialPrototypeObjectConstructor
}

function assertMaterialPrototypeComponentEq(A: MaterialPrototypeComponentData, B: MaterialPrototypeComponentData) {
  for (const arg in A.prototypeArguments)
    assertPrototypeArgumentsEq(A.prototypeArguments[arg], B.prototypeArguments[arg])
  assert.deepEqual(A.prototypeConstructor, B.prototypeConstructor)
}
