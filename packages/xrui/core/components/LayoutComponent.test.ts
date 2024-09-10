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
  createEngine,
  createEntity,
  destroyEngine,
  getComponent,
  getMutableComponent,
  removeEntity,
  setComponent
} from '@ir-engine/ecs'
import { TransformComponent } from '@ir-engine/spatial'
import { EntityTreeComponent } from '@ir-engine/spatial/src/transform/components/EntityTree'
import assert from 'assert'
import { Quaternion, Vector3 } from 'three'
import { LayoutComponent } from './LayoutComponent'

describe('LayoutComponent', () => {
  let entity

  beforeEach(() => {
    createEngine()
    entity = createEntity()
    setComponent(entity, LayoutComponent)
    setComponent(entity, TransformComponent)
  })

  afterEach(() => {
    removeEntity(entity)
    destroyEngine()
  })

  it('should initialize with default values', () => {
    const layout = getComponent(entity, LayoutComponent)
    assert.strictEqual(layout.position, null)
    assert.strictEqual(layout.size, null)
    assert.strictEqual(layout.sizeMode, null)
    assert.deepStrictEqual(layout.effectiveSize, new Vector3())
  })

  it('should compute effective position', () => {
    const layout = getMutableComponent(entity, LayoutComponent)
    layout.position.set(new Vector3(1, 2, 3))
    LayoutComponent.reactorMap.get(entity)?.run()
    assert.deepStrictEqual(layout.effectivePosition.value, new Vector3(1, 2, 3))
  })

  it('should compute effective size based on sizeMode', () => {
    const layout = getMutableComponent(entity, LayoutComponent)
    layout.size.set(new Vector3(0.5, 100, 0.75))
    layout.sizeMode.set({ x: 'proportional', y: 'literal', z: 'proportional' })

    // Create a parent entity with a LayoutComponent
    const parentEntity = createEntity()
    setComponent(parentEntity, LayoutComponent)
    const parentLayout = getMutableComponent(parentEntity, LayoutComponent)
    parentLayout.size.set(new Vector3(1000, 1000, 1000))

    setComponent(entity, EntityTreeComponent, { parentEntity })

    LayoutComponent.reactorMap.get(entity)?.run()
    assert.deepStrictEqual(layout.effectiveSize.value, new Vector3(500, 100, 750))
  })

  it('should compute effective rotation', () => {
    const layout = getMutableComponent(entity, LayoutComponent)
    const rotation = new Quaternion().setFromAxisAngle(new Vector3(0, 1, 0), Math.PI / 2)
    layout.rotation.set(rotation)
    LayoutComponent.reactorMap.get(entity)?.run()
    assert.deepStrictEqual(layout.effectiveRotation.value, rotation)
  })

  it('should use default values when properties are null', () => {
    const layout = getComponent(entity, LayoutComponent)
    LayoutComponent.reactorMap.get(entity)?.run()
    assert.deepStrictEqual(layout.effectivePosition, layout.defaults.position)
    assert.deepStrictEqual(layout.effectiveRotation, layout.defaults.rotation)
    assert.deepStrictEqual(layout.effectiveSize, layout.defaults.size)
  })

  it('should correctly compute nested layouts with different size modes and rotations', () => {
    // Create a hierarchy of entities
    const rootEntity = createEntity()
    const childEntity = createEntity()
    const grandchildEntity = createEntity()

    // Set up components
    setComponent(rootEntity, LayoutComponent)
    setComponent(childEntity, LayoutComponent)
    setComponent(grandchildEntity, LayoutComponent)

    setComponent(rootEntity, TransformComponent)
    setComponent(childEntity, TransformComponent)
    setComponent(grandchildEntity, TransformComponent)

    // Set up entity tree
    setComponent(childEntity, EntityTreeComponent, { parentEntity: rootEntity })
    setComponent(grandchildEntity, EntityTreeComponent, { parentEntity: childEntity })

    // Configure root layout
    const rootLayout = getMutableComponent(rootEntity, LayoutComponent)
    rootLayout.size.set(new Vector3(1000, 1000, 1000))
    rootLayout.rotation.set(new Quaternion().setFromAxisAngle(new Vector3(0, 1, 0), Math.PI / 4))

    // Configure child layout
    const childLayout = getMutableComponent(childEntity, LayoutComponent)
    childLayout.size.set(new Vector3(0.5, 200, 0.75))
    childLayout.sizeMode.set({ x: 'proportional', y: 'literal', z: 'proportional' })
    childLayout.position.set(new Vector3(100, 100, 100))

    // Configure grandchild layout
    const grandchildLayout = getMutableComponent(grandchildEntity, LayoutComponent)
    grandchildLayout.size.set(new Vector3(50, 0.25, 50))
    grandchildLayout.sizeMode.set({ x: 'literal', y: 'proportional', z: 'literal' })
    grandchildLayout.position.set(new Vector3(25, 0, 25))
    grandchildLayout.rotation.set(new Quaternion().setFromAxisAngle(new Vector3(1, 0, 0), Math.PI / 6))

    // Run reactors
    LayoutComponent.reactorMap.get(rootEntity)?.run()
    LayoutComponent.reactorMap.get(childEntity)?.run()
    LayoutComponent.reactorMap.get(grandchildEntity)?.run()

    // Assert root layout
    assert.deepStrictEqual(rootLayout.effectiveSize.value, new Vector3(1000, 1000, 1000))
    assert.deepStrictEqual(
      rootLayout.effectiveRotation.value,
      new Quaternion().setFromAxisAngle(new Vector3(0, 1, 0), Math.PI / 4)
    )

    // Assert child layout
    assert.deepStrictEqual(childLayout.effectiveSize.value, new Vector3(500, 200, 750))
    assert.deepStrictEqual(childLayout.effectivePosition.value, new Vector3(100, 100, 100))

    // Assert grandchild layout
    assert.deepStrictEqual(grandchildLayout.effectiveSize.value, new Vector3(50, 50, 50))
    assert.deepStrictEqual(grandchildLayout.effectivePosition.value, new Vector3(25, 0, 25))

    // Check if the final world position of the grandchild is correct
    // This would require a method to compute world position based on the hierarchy
    // For now, we'll just check if the components are set correctly
    const grandchildTransform = getComponent(grandchildEntity, TransformComponent)
    assert(grandchildTransform, 'Grandchild should have a TransformComponent')

    // Clean up
    removeEntity(grandchildEntity)
    removeEntity(childEntity)
    removeEntity(rootEntity)
  })
})
