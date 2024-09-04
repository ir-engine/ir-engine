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

import { createEngine } from '@ir-engine/ecs'
import { TransformComponent } from '@ir-engine/spatial'
import assert from 'assert'
import { Quaternion, Vector3 } from 'three'
import { LayoutComponent } from './LayoutComponent'

describe('LayoutComponent', () => {
  let engine, entity

  beforeEach(() => {
    engine = createEngine()
    entity = engine.createEntity()
    engine.addComponent(entity, LayoutComponent)
    engine.addComponent(entity, TransformComponent)
  })

  test('should initialize with default values', () => {
    const layout = engine.getComponent(entity, LayoutComponent)
    assert.strictEqual(layout.position.value, null)
    assert.strictEqual(layout.size.value, null)
    assert.strictEqual(layout.sizeMode.value, null)
    assert.deepStrictEqual(layout.effectiveSize.value, new Vector3())
  })

  test('should compute effective position', () => {
    const layout = engine.getComponent(entity, LayoutComponent)
    layout.position.set(new Vector3(1, 2, 3))
    engine.update() // Trigger reactor
    assert.deepStrictEqual(layout.effectivePosition.value, new Vector3(1, 2, 3))
  })

  test('should compute effective size based on sizeMode', () => {
    const layout = engine.getComponent(entity, LayoutComponent)
    layout.size.set(new Vector3(0.5, 100, 0.75))
    layout.sizeMode.set({ x: 'proportional', y: 'literal', z: 'proportional' })

    // Create a parent entity with a LayoutComponent
    const parentEntity = engine.createEntity()
    engine.addComponent(parentEntity, LayoutComponent)
    const parentLayout = engine.getComponent(parentEntity, LayoutComponent)
    parentLayout.effectiveSize.set(new Vector3(1000, 1000, 1000))

    // Set the parent-child relationship
    engine.setParent(entity, parentEntity)

    engine.update() // Trigger reactor
    assert.deepStrictEqual(layout.effectiveSize.value, new Vector3(500, 100, 750))
  })

  test('should compute effective rotation', () => {
    const layout = engine.getComponent(entity, LayoutComponent)
    const rotation = new Quaternion().setFromAxisAngle(new Vector3(0, 1, 0), Math.PI / 2)
    layout.rotation.set(rotation)
    engine.update() // Trigger reactor
    assert.deepStrictEqual(layout.effectiveRotation.value, rotation)
  })

  test('should use default values when properties are null', () => {
    const layout = engine.getComponent(entity, LayoutComponent)
    engine.update() // Trigger reactor
    assert.deepStrictEqual(layout.effectivePosition.value, layout.defaults.position.value)
    assert.deepStrictEqual(layout.effectiveRotation.value, layout.defaults.rotation.value)
    assert.deepStrictEqual(layout.effectiveSize.value, layout.defaults.size.value)
  })
})
