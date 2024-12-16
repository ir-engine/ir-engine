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

import { createEngine, createEntity, destroyEngine, setComponent } from '@ir-engine/ecs'
import { Vector3 } from 'three'
import { afterEach, assert, beforeEach, describe, it } from 'vitest'
import { createMockXRUI } from '../../../tests/util/MockXRUI'
import { assertFloat } from '../../../tests/util/assert'
import { mockSpatialEngine } from '../../../tests/util/mockSpatialEngine'
import { destroySpatialEngine, destroySpatialViewer } from '../../initializeEngine'
import { IntersectionData } from '../../input/functions/ClientInputHeuristics'
import { VisibleComponent } from '../../renderer/components/VisibleComponent'
import { xruiInputHeuristic } from './XRUISystem'

describe('XRUISystem', () => {
  describe('findXRUI', () => {
    beforeEach(() => {
      createEngine()
      mockSpatialEngine()
    })

    afterEach(() => {
      destroySpatialEngine()
      destroySpatialViewer()
      return destroyEngine()
    })

    it('should add the xruiQuery.entity and intersection.distance to the `@param intersectionData`', () => {
      const testEntity = createEntity()
      setComponent(testEntity, VisibleComponent)
      createMockXRUI(testEntity, 1)

      const data = new Set<IntersectionData>()
      assert.equal(data.size, 0)

      const rayOrigin = new Vector3(0, 0, 0)
      const rayDirection = new Vector3(0, 0, -1).normalize()

      xruiInputHeuristic(data, rayOrigin, rayDirection)
      assert.notEqual(data.size, 0)
      const result = [...data]
      assert.equal(result[0].entity, testEntity)
      assertFloat.approxEq(result[0].distance, 0)
    })

    it("should not do anything if we didn't hit the WebContainer3D", () => {
      const testEntity = createEntity()
      setComponent(testEntity, VisibleComponent)
      createMockXRUI(testEntity, 1)

      const data = new Set<IntersectionData>()
      assert.equal(data.size, 0)

      const rayOrigin = new Vector3(10, 10, 10)
      const rayDirection = new Vector3(0, 0, -1).normalize()

      xruiInputHeuristic(data, rayOrigin, rayDirection)
      assert.equal(data.size, 0)
    })
  })
})
