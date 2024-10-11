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
  UndefinedEntity,
  createEngine,
  createEntity,
  destroyEngine,
  getComponent,
  getOptionalComponent,
  hasComponent,
  removeComponent,
  removeEntity,
  setComponent
} from '@ir-engine/ecs'
import { ReactorRoot, getMutableState, getState } from '@ir-engine/hyperflux'
import assert from 'assert'
import { Box3, BoxGeometry, Mesh, Vector3 } from 'three'
import { afterEach, beforeEach, describe, it } from 'vitest'
import { assertVecAnyApproxNotEq, assertVecApproxEq } from '../../../tests/util/mathAssertions'
import { NameComponent } from '../../common/NameComponent'
import { RendererState } from '../../renderer/RendererState'
import { GroupComponent } from '../../renderer/components/GroupComponent'
import { MeshComponent } from '../../renderer/components/MeshComponent'
import { VisibleComponent } from '../../renderer/components/VisibleComponent'
import { ObjectLayers } from '../../renderer/constants/ObjectLayers'
import { BoundingBoxComponent, BoundingBoxComponentFunctions, updateBoundingBox } from './BoundingBoxComponents'
import { EntityTreeComponent } from './EntityTree'
import { TransformComponent } from './TransformComponent'

function createEntityWithBoxAndParent(parent: Entity): Entity {
  const result = createEntity()
  setComponent(result, EntityTreeComponent, { parentEntity: parent })
  const mesh = new Mesh(new BoxGeometry(result + 1, result + 2, result + 3))
  mesh.geometry.computeBoundingBox()
  const box = mesh.geometry.boundingBox!.clone()
  mesh.geometry.boundingBox = null
  setComponent(result, BoundingBoxComponent, { box: box })
  setComponent(result, MeshComponent, mesh)
  return result
}

type BoundingBoxComponentData = {
  box: Box3
  helper: Entity
}

const BoundingBoxComponentDefaults: BoundingBoxComponentData = {
  box: new Box3(),
  helper: UndefinedEntity
}

function assertBoundingBoxComponentEq(A: BoundingBoxComponentData, B: BoundingBoxComponentData): void {
  assertVecApproxEq(A.box.max, B.box.max, 3)
  assertVecApproxEq(A.box.min, B.box.min, 3)
  assert.equal(A.helper, B.helper)
}

describe('BoundingBoxComponent', () => {
  describe('IDs', () => {
    it('should initialize the BoundingBoxComponent.name field with the expected value', () => {
      assert.equal(BoundingBoxComponent.name, 'BoundingBoxComponent')
    })
  }) //:: IDs

  describe('onInit', () => {
    let testEntity = UndefinedEntity

    beforeEach(async () => {
      createEngine()
      testEntity = createEntity()
      setComponent(testEntity, BoundingBoxComponent)
    })

    afterEach(() => {
      removeEntity(testEntity)
      return destroyEngine()
    })

    it('should initialize the component with the expected default values', () => {
      const data = getComponent(testEntity, BoundingBoxComponent)
      assertBoundingBoxComponentEq(data, BoundingBoxComponentDefaults)
    })
  }) //:: onInit

  describe('onSet', () => {
    let testEntity = UndefinedEntity

    beforeEach(async () => {
      createEngine()
      testEntity = createEntity()
      setComponent(testEntity, BoundingBoxComponent)
    })

    afterEach(() => {
      removeEntity(testEntity)
      return destroyEngine()
    })

    it('should change the values of an initialized BoundingBoxComponent', () => {
      const before = getComponent(testEntity, BoundingBoxComponent)
      assertBoundingBoxComponentEq(before, BoundingBoxComponentDefaults)
      const Expected = {
        box: new Box3(new Vector3(1, 2, 3), new Vector3(4, 5, 6)),
        helper: createEntity()
      }
      setComponent(testEntity, BoundingBoxComponent, Expected)
      const after = getComponent(testEntity, BoundingBoxComponent)
      assertBoundingBoxComponentEq(after, Expected)
    })

    it('should not change values of an initialized BoundingBoxComponent when the data passed had incorrect types', () => {
      const before = getComponent(testEntity, BoundingBoxComponent)
      assertBoundingBoxComponentEq(before, BoundingBoxComponentDefaults)
      const Incorrect = { box: 'someBox', helper: false }
      // @ts-ignore Override the linter to force-send invalid types
      setComponent(testEntity, BoundingBoxComponent, Incorrect)
      const after = getComponent(testEntity, BoundingBoxComponent)
      assertBoundingBoxComponentEq(after, BoundingBoxComponentDefaults)
    })
  }) //:: onSet

  describe('reactor', () => {
    let testEntity = UndefinedEntity

    beforeEach(async () => {
      createEngine()
      testEntity = createEntity()
    })

    afterEach(() => {
      removeEntity(testEntity)
      return destroyEngine()
    })

    describe('when BoundingBoxComponent is mounted or RendererState.nodeHelperVisibility changes', () => {
      describe('should set BoundingBoxComponent.helper to a new helperEntity that ...', () => {
        let BoundingBoxComponentReactor: ReactorRoot
        beforeEach(() => {
          setComponent(testEntity, BoundingBoxComponent)
          getMutableState(RendererState).nodeHelperVisibility.set(true)
          BoundingBoxComponentReactor = BoundingBoxComponent.reactorMap.get(testEntity)!
        })

        it('... has a VisibleComponent', () => {
          const Expected = true
          // Run and Check the result
          BoundingBoxComponentReactor.run()
          const helperEntity = getComponent(testEntity, BoundingBoxComponent).helper
          assert.notEqual(helperEntity, UndefinedEntity)
          const result = hasComponent(helperEntity, VisibleComponent)
          assert.equal(result, Expected)
        })

        it('... has a NameComponent with the value `bounding-box-helper-${entity}`', () => {
          const Expected = `bounding-box-helper-${testEntity}`
          // Run and Check the result
          BoundingBoxComponentReactor.run()
          const helperEntity = getComponent(testEntity, BoundingBoxComponent).helper
          assert.notEqual(helperEntity, UndefinedEntity)
          assert.equal(hasComponent(helperEntity, NameComponent), true)
          const result = getComponent(helperEntity, NameComponent)
          assert.equal(result, Expected)
        })

        it('... has an EntityTreeComponent with the entityContext as its parentEntity', () => {
          const Expected = testEntity
          // Run and Check the result
          BoundingBoxComponentReactor.run()
          const helperEntity = getComponent(testEntity, BoundingBoxComponent).helper
          assert.notEqual(helperEntity, UndefinedEntity)
          assert.equal(hasComponent(helperEntity, EntityTreeComponent), true)
          const result = getComponent(helperEntity, EntityTreeComponent).parentEntity
          assert.equal(result, Expected)
        })

        it("... has a Box3Helper which's name is the same as the helperEntity.NameComponent", () => {
          const Expected = `bounding-box-helper-${testEntity}`
          // Run and Check the result
          BoundingBoxComponentReactor.run()
          const helperEntity = getComponent(testEntity, BoundingBoxComponent).helper
          assert.notEqual(helperEntity, UndefinedEntity)
          assert.equal(hasComponent(helperEntity, NameComponent), true)
          assert.equal(hasComponent(helperEntity, TransformComponent), true)
          assert.equal(hasComponent(helperEntity, GroupComponent), true)
          assert.equal(getComponent(helperEntity, GroupComponent).length, 1)
          const result = getComponent(helperEntity, GroupComponent)[0].name
          assert.equal(result, Expected)
        })

        it('... has a Box3Helper with the ObjectLayers.NodeHelper layer enabled', () => {
          const Expected = true
          // Run and Check the result
          BoundingBoxComponentReactor.run()
          const helperEntity = getComponent(testEntity, BoundingBoxComponent).helper
          assert.notEqual(helperEntity, UndefinedEntity)
          assert.equal(hasComponent(helperEntity, NameComponent), true)
          assert.equal(hasComponent(helperEntity, TransformComponent), true)
          assert.equal(hasComponent(helperEntity, GroupComponent), true)
          assert.equal(getComponent(helperEntity, GroupComponent).length, 1)
          const result = getComponent(helperEntity, GroupComponent)[0].layers.isEnabled(ObjectLayers.NodeHelper)
          assert.equal(result, Expected)
        })
      })

      it('should not set the BoundingBoxComponent.helper entity when RendererState.nodeHelperVisibility is false', () => {
        const Expected = UndefinedEntity
        // Set the data as expected
        setComponent(testEntity, BoundingBoxComponent)
        // Sanity check before running
        assert.equal(getState(RendererState).nodeHelperVisibility, false)
        // Run and Check the result
        BoundingBoxComponent.reactorMap.get(testEntity)!.run()
        const result = getComponent(testEntity, BoundingBoxComponent).helper
        assert.equal(result, Expected)
      })

      it('should call updateBoundingBox on the entityContext whenever the value of RendererState.nodeHelperVisibility changes', () => {
        // Set the data as expected
        const box = new Box3(new Vector3(1, 2, 3), new Vector3(4, 5, 6))
        setComponent(testEntity, BoundingBoxComponent, { box: box })
        setComponent(testEntity, MeshComponent, new Mesh(new BoxGeometry()))
        const one = createEntityWithBoxAndParent(testEntity)
        const two = createEntityWithBoxAndParent(one)
        const entityList: Entity[] = [testEntity, one, two]
        // Sanity check before running
        assert.equal(getState(RendererState).nodeHelperVisibility, false)
        for (const entity of entityList) assert.equal(getComponent(entity, MeshComponent).geometry.boundingBox, null)
        // Run and Check the result
        getMutableState(RendererState).nodeHelperVisibility.set(true)
        assert.equal(getState(RendererState).nodeHelperVisibility, true)
        BoundingBoxComponent.reactorMap.get(testEntity)!.run()
        for (const entity of entityList) assert.notEqual(getComponent(entity, MeshComponent).geometry.boundingBox, null)
      })
    })

    describe('when BoundingBoxComponent is unmounted ...', () => {
      beforeEach(() => {
        getMutableState(RendererState).nodeHelperVisibility.set(true)
      })

      it('... should set the entityContext.BoundingBoxComponent.helper entity to UndefinedEntity', () => {
        const Expected = undefined
        // Set the data as expected
        setComponent(testEntity, BoundingBoxComponent)
        // Sanity check before running
        assert.equal(getState(RendererState).nodeHelperVisibility, true)
        BoundingBoxComponent.reactorMap.get(testEntity)!.run()
        const helperEntity = getComponent(testEntity, BoundingBoxComponent).helper
        assert.notEqual(helperEntity, UndefinedEntity)
        // Run and Check the result
        removeComponent(testEntity, BoundingBoxComponent)
        const result = getOptionalComponent(testEntity, BoundingBoxComponent)?.helper
        assert.equal(result, Expected)
      })

      it('... should remove the helperEntity', () => {
        // Set the data as expected
        setComponent(testEntity, BoundingBoxComponent)
        // Sanity check before running
        assert.equal(getState(RendererState).nodeHelperVisibility, true)
        BoundingBoxComponent.reactorMap.get(testEntity)!.run()
        const helperEntity = getComponent(testEntity, BoundingBoxComponent).helper
        assert.notEqual(helperEntity, UndefinedEntity)
        assert.equal(hasComponent(helperEntity, NameComponent), true)
        assert.equal(hasComponent(helperEntity, TransformComponent), true)
        assert.equal(hasComponent(helperEntity, GroupComponent), true)
        assert.equal(getComponent(helperEntity, GroupComponent).length, 1)
        // Run and Check the result
        removeComponent(testEntity, BoundingBoxComponent)
        assert.equal(hasComponent(helperEntity, VisibleComponent), false)
        assert.equal(hasComponent(helperEntity, NameComponent), false)
        assert.equal(hasComponent(helperEntity, TransformComponent), false)
        assert.equal(hasComponent(helperEntity, GroupComponent), false)
      })
    })
  }) //:: reactor
}) //:: BoundingBoxComponent

describe('updateBoundingBox', () => {
  let testEntity = UndefinedEntity

  beforeEach(async () => {
    createEngine()
    testEntity = createEntity()
  })

  afterEach(() => {
    removeEntity(testEntity)
    return destroyEngine()
  })

  it("should call expandBoxByObject on every entity in the `@param entity`'s EntityTree", () => {
    // Set the data as expected
    const box = new Box3(new Vector3(1, 2, 3), new Vector3(4, 5, 6))
    setComponent(testEntity, BoundingBoxComponent, { box: box })
    setComponent(testEntity, MeshComponent, new Mesh(new BoxGeometry()))
    const one = createEntityWithBoxAndParent(testEntity)
    const two = createEntityWithBoxAndParent(one)
    const entityList: Entity[] = [testEntity, one, two]
    // Sanity check before running
    for (const entity of entityList) assert.equal(getComponent(entity, MeshComponent).geometry.boundingBox, null)
    // Run and Check the result
    updateBoundingBox(testEntity)
    for (const entity of entityList) assert.notEqual(getComponent(entity, MeshComponent).geometry.boundingBox, null)
  })

  it('should not do anything if `@param entity` does not have a BoundingBoxComponent', () => {
    // Set the data as expected
    // setComponent(testEntity, BoundingBoxComponent, { box: new Box3(new Vector3(1, 2, 3), new Vector3(4, 5, 6)) })
    setComponent(testEntity, MeshComponent, new Mesh(new BoxGeometry()))
    const one = createEntityWithBoxAndParent(testEntity)
    const two = createEntityWithBoxAndParent(one)
    const entityList: Entity[] = [testEntity, one, two]
    // Sanity check before running
    assert.equal(hasComponent(testEntity, BoundingBoxComponent), false)
    for (const entity of entityList) assert.equal(getComponent(entity, MeshComponent).geometry.boundingBox, null)
    // Run and Check the result
    updateBoundingBox(testEntity)
    for (const entity of entityList) assert.equal(getComponent(entity, MeshComponent).geometry.boundingBox, null)
  })
}) //:: updateBoundingBox

describe('expandBoxByObject', () => {
  let testEntity = UndefinedEntity

  beforeEach(async () => {
    createEngine()
    testEntity = createEntity()
    setComponent(testEntity, BoundingBoxComponent)
  })

  afterEach(() => {
    removeEntity(testEntity)
    return destroyEngine()
  })

  it('should call `@param object`.geometry.computeBoundingBox if its .boundingBox property is null', () => {
    // Set the data as expected
    setComponent(testEntity, MeshComponent, new Mesh(new BoxGeometry()))
    const mesh = getComponent(testEntity, MeshComponent)
    const box = getComponent(testEntity, BoundingBoxComponent).box
    // Sanity check before running
    assert.equal(Boolean(mesh.geometry), true)
    assert.equal(mesh.geometry.boundingBox, null)
    // Run and Check the result
    BoundingBoxComponentFunctions.expandBoxByObject(mesh, box)
    assert.notEqual(mesh.geometry.boundingBox, null)
  })

  it('should not do anything if `@param object`.geometry is falsy (aka does not have any geometry)', () => {
    // Set the data as expected
    const mesh = new Mesh()
    // @ts-ignore Force a falsy value into the mesh's geometry
    mesh.geometry = undefined
    const box = getComponent(testEntity, BoundingBoxComponent).box
    const before = box.clone()
    // Sanity check before running
    assert.equal(Boolean(mesh.geometry), false)
    // Run and Check the result
    BoundingBoxComponentFunctions.expandBoxByObject(mesh, box)
    const after = getComponent(testEntity, BoundingBoxComponent).box.clone()
    assertVecApproxEq(before.min, after.min, 3)
    assertVecApproxEq(before.max, after.max, 3)
  })

  it('should call `@param box`.union() to compute the result of combining itself with `@param`.object.geometry.boundingBox', () => {
    // Set the data as expected
    const mesh = new Mesh(new BoxGeometry(1234, 5678))
    const box = new Box3(new Vector3(1, 2, 3), new Vector3(4, 5, 6))
    const before = box.clone()
    mesh.geometry.computeBoundingBox()
    // Sanity check before running
    assert.equal(Boolean(mesh.geometry), true)
    assert.notEqual(mesh.geometry.boundingBox, null)
    // Run and Check the result
    BoundingBoxComponentFunctions.expandBoxByObject(mesh, box)
    const after = mesh.geometry.boundingBox!
    assertVecAnyApproxNotEq(before.min, after.min, 3)
    assertVecAnyApproxNotEq(before.max, after.max, 3)
  })
}) //:: expandBoxByObject
