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

import {
  Entity,
  EntityUUID,
  UUIDComponent,
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
import { assertArrayEqual, assertArrayNotEqual } from '../../physics/components/RigidBodyComponent.test'
import { MeshComponent } from '../components/MeshComponent'
import {
  MaterialInstanceComponent,
  MaterialPrototypeComponent,
  MaterialPrototypeObjectConstructor,
  MaterialStateComponent,
  PrototypeArgument,
  PrototypeArgumentValue,
  prototypeQuery
} from './MaterialComponent'

type MaterialStateComponentData = {
  material: Material
  parameters: { [key: string]: any }
  instances: Entity[]
  prototypeEntity: Entity
}

const MaterialStateComponentDefaults: MaterialStateComponentData = {
  material: {} as Material,
  parameters: {} as { [key: string]: any },
  instances: [] as Entity[],
  prototypeEntity: UndefinedEntity as Entity
}

function assertMaterialStateComponentEq(A: MaterialStateComponentData, B: MaterialStateComponentData) {
  assert.equal(A.material.uuid, B.material.uuid)
  assert.deepEqual(A.parameters, B.parameters)
  assertArrayEqual(A.instances, B.instances)
  assert.equal(A.prototypeEntity, B.prototypeEntity)
}

function assertMaterialStateComponentNotEq(A: MaterialStateComponentData, B: MaterialStateComponentData) {
  assert.notEqual(A.material.uuid, B.material.uuid)
  assert.notDeepEqual(A.parameters, B.parameters)
  assertArrayEqual(A.instances, B.instances)
  assert.notEqual(A.prototypeEntity, B.prototypeEntity)
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
        instances: [],
        prototypeEntity: UndefinedEntity
      }
      setComponent(testEntity, MaterialStateComponent, Expected)
      const result = getComponent(testEntity, MaterialStateComponent)
      assertMaterialStateComponentEq(result, Expected)
    })

    it('should not change values of an initialized MaterialStateComponent when the data passed had incorrect types', () => {
      const Incorrect = {
        material: 'someMaterial',
        parameters: 41,
        instances: 42,
        prototypeEntity: 'somePrototypeEntity'
      }
      const before = getComponent(testEntity, MaterialStateComponent)
      // @ts-ignore Coerce an incorrect type into the component's data
      setComponent(testEntity, MaterialStateComponent, Incorrect)
      const after = getComponent(testEntity, MaterialStateComponent)
      assertMaterialStateComponentEq(before, after)
    })
  }) //:: onSet

  describe.skip('onRemove', () => {
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

    /** @todo How to set it up correctly ?? */
    it('it should call setMeshMaterial for every entity in the  `@param entity`.MaterialStateComponent.instances list, using its MaterialInstanceComponent.uuid', () => {
      // Set the data as expected
      const instance1 = createEntity()
      const instance2 = createEntity()
      const instances = [instance1, instance2] as Entity[]
      const mesh1 = new Mesh(new BoxGeometry())
      const mesh2 = new Mesh(new BoxGeometry())
      const meshes = [mesh1, mesh2] as Mesh[]
      const material1 = new Material()
      const material2 = new Material()
      const materials = [material1, material2] as Material[]
      const uuid1 = UUIDComponent.generateUUID()
      const uuid2 = UUIDComponent.generateUUID()
      const uuids = [uuid1, uuid2]
      material1.uuid = uuid1
      material2.uuid = uuid2
      for (const id in instances) setComponent(instances[id], MaterialStateComponent, { material: materials[id] })
      for (const id in instances) setComponent(instances[id], MeshComponent, meshes[id])
      setComponent(testEntity, MaterialInstanceComponent, { uuid: uuids })
      setComponent(testEntity, MaterialStateComponent, { instances: instances })
      // Sanity check before running
      assert.equal(hasComponent(testEntity, MaterialInstanceComponent), true)
      for (const entity of getComponent(testEntity, MaterialStateComponent).instances) {
        assert.equal(hasComponent(entity, MaterialStateComponent), true)
        assert.equal(hasComponent(entity, MeshComponent), true)
        assert.notEqual(
          (getComponent(entity, MeshComponent).material as Material).uuid,
          getComponent(entity, MaterialStateComponent).material.uuid
        )
      }
      // Run and Check the result
      removeComponent(testEntity, MaterialInstanceComponent)
      for (const entity of getComponent(testEntity, MaterialStateComponent).instances) {
        assert.equal(
          (getComponent(entity, MeshComponent).material as Material).uuid,
          getComponent(entity, MaterialStateComponent).material.uuid
        )
      }
    })

    /** @todo When the previous test case is done */
    // it("should not do anything if the entity does not have a MaterialStateComponent", () => {})
  }) //:: onRemove
}) //:: MaterialStateComponent

type MaterialInstanceComponentData = {
  uuid: EntityUUID[]
}

const MaterialInstanceComponentDefaults: MaterialInstanceComponentData = {
  uuid: [] as EntityUUID[]
}

function assertMaterialInstanceComponentEq(A: MaterialInstanceComponentData, B: MaterialInstanceComponentData) {
  assertArrayEqual(A.uuid, B.uuid)
}

function assertMaterialInstanceComponentNotEq(A: MaterialInstanceComponentData, B: MaterialInstanceComponentData) {
  assertArrayNotEqual(A.uuid, B.uuid)
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
      const Expected: MaterialInstanceComponentData = {
        uuid: [UUIDComponent.generateUUID(), UUIDComponent.generateUUID()] as EntityUUID[]
      }
      setComponent(testEntity, MaterialInstanceComponent, Expected)
      const result = getComponent(testEntity, MaterialInstanceComponent)
      assertMaterialInstanceComponentEq(result, Expected)
    })

    it('should not change values of an initialized MaterialInstanceComponent when the data passed had incorrect types', () => {
      const Incorrect = { uuid: 'someUUID' }
      const before = getComponent(testEntity, MaterialInstanceComponent)
      // @ts-ignore Coerce an incorrect type into the component's data
      setComponent(testEntity, MaterialInstanceComponent, Incorrect)
      const after = getComponent(testEntity, MaterialInstanceComponent)
      assertMaterialInstanceComponentEq(before, after)
    })
  }) //:: onSet

  describe.skip('onRemove', () => {
    let testEntity = UndefinedEntity

    beforeEach(async () => {
      createEngine()
      testEntity = createEntity()
    })

    afterEach(() => {
      removeEntity(testEntity)
      return destroyEngine()
    })

    it('should ???', () => {})
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

describe('MaterialPrototypeComponent', () => {
  describe('IDs', () => {
    it('should initialize the MaterialPrototypeComponent.name field with the expected value', () => {
      assert.equal(MaterialPrototypeComponent.name, 'MaterialPrototypeComponent')
    })
  }) //:: IDs

  describe('onInit', () => {
    let testEntity = UndefinedEntity

    beforeEach(async () => {
      createEngine()
      testEntity = createEntity()
      setComponent(testEntity, MaterialPrototypeComponent)
    })

    afterEach(() => {
      removeEntity(testEntity)
      return destroyEngine()
    })

    it('should initialize the component with the expected default values', () => {
      const data = getComponent(testEntity, MaterialPrototypeComponent)
      assertMaterialPrototypeComponentEq(data, MaterialPrototypeComponentDefaults)
    })
  }) //:: onInit

  describe('onSet', () => {
    let testEntity = UndefinedEntity

    beforeEach(async () => {
      createEngine()
      testEntity = createEntity()
      setComponent(testEntity, MaterialPrototypeComponent)
    })

    afterEach(() => {
      removeEntity(testEntity)
      return destroyEngine()
    })

    it('should change the values of an initialized MaterialPrototypeComponent', () => {
      const Expected: MaterialPrototypeComponentData = {
        prototypeArguments: {} as PrototypeArgument,
        prototypeConstructor: {} as MaterialPrototypeObjectConstructor
      }
      setComponent(testEntity, MaterialPrototypeComponent, Expected)
      const result = getComponent(testEntity, MaterialPrototypeComponent)
      assertMaterialPrototypeComponentEq(result, Expected)
    })

    it('should not change values of an initialized MaterialPrototypeComponent when the data passed had incorrect types', () => {
      const Incorrect = { uuid: 'someUUID' }
      const before = getComponent(testEntity, MaterialPrototypeComponent)
      // @ts-ignore Coerce an incorrect type into the component's data
      setComponent(testEntity, MaterialPrototypeComponent, Incorrect)
      const after = getComponent(testEntity, MaterialPrototypeComponent)
      assertMaterialPrototypeComponentEq(before, after)
    })
  }) //:: onSet
}) //:: MaterialPrototypeComponent

describe('prototypeQuery', () => {
  beforeEach(() => {
    createEngine()
  })

  afterEach(() => {
    return destroyEngine()
  })

  it('should only return entities that have a MaterialPrototypeComponent', () => {
    const otherEntity = createEntity()
    const one = createEntity()
    const two = createEntity()
    setComponent(one, MaterialPrototypeComponent)
    setComponent(two, MaterialPrototypeComponent)
    const Expected = [one, two] as Entity[]
    // Run and Check the result
    const result = prototypeQuery()
    for (const entity of result) assert.equal(Expected.includes(entity), true)
    assert.equal(Expected.includes(otherEntity), false)
  })
})