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
