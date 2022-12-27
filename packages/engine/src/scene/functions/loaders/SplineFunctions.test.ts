import assert from 'assert'
import { Vector3 } from 'three'

import { Engine } from '../../../ecs/classes/Engine'
import { Entity } from '../../../ecs/classes/Entity'
import { getComponent, getComponentState, setComponent } from '../../../ecs/functions/ComponentFunctions'
import { createEntity } from '../../../ecs/functions/EntityFunctions'
import { addEntityNodeChild, createEntityNode } from '../../../ecs/functions/EntityTree'
import { createEngine } from '../../../initializeEngine'
import { SplineComponent } from '../../components/SplineComponent'

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
      setComponent(entity, SplineComponent, sceneComponentData)

      const splineComponent = getComponent(entity, SplineComponent)
      assert(splineComponent)
      assert.deepEqual(splineComponent, sceneComponentData)
    })
  })

  describe('serializeSpline()', () => {
    it('should properly serialize spline', () => {
      setComponent(entity, SplineComponent, sceneComponentData)
      assert.deepEqual(SplineComponent.toJSON(entity, getComponentState(entity, SplineComponent)), sceneComponentData)
    })
  })
})
