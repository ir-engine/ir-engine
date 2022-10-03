import assert from 'assert'
import { Vector3 } from 'three'

import { Engine } from '../../../ecs/classes/Engine'
import { Entity } from '../../../ecs/classes/Entity'
import { getComponent } from '../../../ecs/functions/ComponentFunctions'
import { createEntity } from '../../../ecs/functions/EntityFunctions'
import { addEntityNodeChild, createEntityNode } from '../../../ecs/functions/EntityTree'
import { createEngine } from '../../../initializeEngine'
import { SplineComponent } from '../../components/SplineComponent'
import { deserializeSpline, parseSplineProperties, serializeSpline } from './SplineFunctions'

describe('SplineFunctions', () => {
  let entity: Entity

  beforeEach(() => {
    createEngine()
    entity = createEntity()
    const node = createEntityNode(entity)
    const world = Engine.instance.currentWorld
    addEntityNodeChild(node, world.entityTree.rootNode)
  })

  const sceneComponentData = {
    splinePositions: [
      new Vector3(Math.random(), Math.random(), Math.random()),
      new Vector3(Math.random(), Math.random(), Math.random()),
      new Vector3(Math.random(), Math.random(), Math.random())
    ]
  }

  describe('deserializeSpline()', () => {
    it('creates Spline Component with provided component data', () => {
      deserializeSpline(entity, sceneComponentData)

      const splineComponent = getComponent(entity, SplineComponent)
      assert(splineComponent)
      assert.deepEqual(splineComponent, sceneComponentData)
    })
  })

  describe('serializeSpline()', () => {
    it('should properly serialize spline', () => {
      deserializeSpline(entity, sceneComponentData)
      assert.deepEqual(serializeSpline(entity), sceneComponentData)
    })
  })

  describe('parseSplineProperties()', () => {
    const data = it('should return empty array of spline ponits', () => {
      const data = {}
      const componentData = parseSplineProperties(data)
      assert(componentData.splinePositions.length <= 0)
      assert(data !== componentData)
    })

    it('should return Vector3 array of spline ponits', () => {
      const componentData = parseSplineProperties(sceneComponentData)
      assert(componentData.splinePositions.length > 0)
      assert(sceneComponentData !== componentData)
      assert(
        componentData.splinePositions.filter((pos, i) => {
          if (
            pos.x !== sceneComponentData.splinePositions[i].x ||
            pos.y !== sceneComponentData.splinePositions[i].y ||
            pos.z !== sceneComponentData.splinePositions[i].z
          )
            return true
        }).length <= 0
      )
    })
  })
})
