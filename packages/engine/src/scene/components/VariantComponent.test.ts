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
  createEngine,
  createEntity,
  destroyEngine,
  getChildrenWithComponents,
  getComponent,
  getOptionalComponent,
  removeEntity,
  setComponent,
  UndefinedEntity
} from '@ir-engine/ecs'
import { assertArray } from '@ir-engine/spatial/tests/util/assert'
import { afterEach, assert, beforeEach, describe, it } from 'vitest'
import { GLTFComponent } from '../../gltf/GLTFComponent'
import { deviceMetadataSchema, distanceMetadataSchema, VariantComponent } from './VariantComponent'

const VariantComponentDefaults = {
  levels: [] as Array<{
    src: string
    metadata: typeof distanceMetadataSchema | typeof deviceMetadataSchema
    heuristic: number
    currentLevel: number
  }>
}

function assertVariantComponentEqual(data, expected) {
  assertArray.eq(data.levels, expected.levels)
}
describe('VariantComponent', () => {
  describe('onInit', () => {
    let testEntity = UndefinedEntity

    beforeEach(async () => {
      createEngine()
      testEntity = createEntity()
      setComponent(testEntity, VariantComponent)
    })

    afterEach(() => {
      removeEntity(testEntity)
      return destroyEngine()
    })

    it('should initialize the component with the expected default values', () => {
      const data = getComponent(testEntity, VariantComponent)
      assertVariantComponentEqual(data, VariantComponentDefaults)
    })
  }) // << onInit

  describe('reactor', () => {
    let testEntity = UndefinedEntity

    beforeEach(async () => {
      createEngine()
      testEntity = createEntity()
      setComponent(testEntity, VariantComponent)
    })

    afterEach(() => {
      removeEntity(testEntity)
      return destroyEngine()
    })

    it('should have a child entity with a GLTFComponent', () => {
      const childEntity = getChildrenWithComponents(testEntity, [GLTFComponent]).at(0)
      assert.notEqual(childEntity, UndefinedEntity)
    })

    it('should not have a GLTFComponent', () => {
      const gltfComponent = getOptionalComponent(testEntity, GLTFComponent)
      assert.equal(gltfComponent, undefined)
    })
  }) // << reactor
})
