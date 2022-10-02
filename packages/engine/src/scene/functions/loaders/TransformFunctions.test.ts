import assert from 'assert'
import { Euler, Quaternion, Vector3 } from 'three'

import { Engine } from '../../../ecs/classes/Engine'
import { Entity } from '../../../ecs/classes/Entity'
import { getComponent } from '../../../ecs/functions/ComponentFunctions'
import { createEntity } from '../../../ecs/functions/EntityFunctions'
import { addEntityNodeChild, createEntityNode } from '../../../ecs/functions/EntityTree'
import { createEngine } from '../../../initializeEngine'
import {
  SCENE_COMPONENT_TRANSFORM_DEFAULT_VALUES,
  TransformComponent
} from '../../../transform/components/TransformComponent'
import { deserializeTransform, parseTransformProperties, serializeTransform } from './TransformFunctions'

const EPSILON = 10e-8

describe('TransformFunctions', () => {
  let entity: Entity

  beforeEach(() => {
    createEngine()
    entity = createEntity()
    const node = createEntityNode(entity)
    const world = Engine.instance.currentWorld
    addEntityNodeChild(node, world.entityTree.rootNode)
  })

  const sceneComponentData = {
    position: new Vector3(Math.random(), Math.random(), Math.random()),
    rotation: new Euler(Math.random(), Math.random(), Math.random()),
    scale: new Vector3(Math.random(), Math.random(), Math.random())
  }

  describe('deserializeTransform()', () => {
    it('creates Transform Component with provided component data', () => {
      deserializeTransform(entity, sceneComponentData)

      const transformComponent = getComponent(entity, TransformComponent)
      assert(transformComponent)
      assert(Math.abs(transformComponent.position.x - sceneComponentData.position.x) < EPSILON)
      assert(Math.abs(transformComponent.position.y - sceneComponentData.position.y) < EPSILON)
      assert(Math.abs(transformComponent.position.z - sceneComponentData.position.z) < EPSILON)

      const rot = new Quaternion().setFromEuler(sceneComponentData.rotation)
      assert(Math.abs(transformComponent.rotation.x - rot.x) < EPSILON)
      assert(Math.abs(transformComponent.rotation.y - rot.y) < EPSILON)
      assert(Math.abs(transformComponent.rotation.z - rot.z) < EPSILON)
      assert(Math.abs(transformComponent.rotation.w - rot.w) < EPSILON)

      assert(Math.abs(transformComponent.scale.x - sceneComponentData.scale.x) < EPSILON)
      assert(Math.abs(transformComponent.scale.y - sceneComponentData.scale.y) < EPSILON)
      assert(Math.abs(transformComponent.scale.z - sceneComponentData.scale.z) < EPSILON)
    })
  })

  describe('serializeTransform()', () => {
    it('should properly serialize transform', () => {
      deserializeTransform(entity, sceneComponentData)
      const result = serializeTransform(entity)

      assert(Math.abs(result.position.x - sceneComponentData.position.x) < EPSILON)
      assert(Math.abs(result.position.y - sceneComponentData.position.y) < EPSILON)
      assert(Math.abs(result.position.z - sceneComponentData.position.z) < EPSILON)

      assert(Math.abs(result.rotation.x - sceneComponentData.rotation.x) < EPSILON)
      assert(Math.abs(result.rotation.y - sceneComponentData.rotation.y) < EPSILON)
      assert(Math.abs(result.rotation.z - sceneComponentData.rotation.z) < EPSILON)

      assert(Math.abs(result.scale.x - sceneComponentData.scale.x) < EPSILON)
      assert(Math.abs(result.scale.y - sceneComponentData.scale.y) < EPSILON)
      assert(Math.abs(result.scale.z - sceneComponentData.scale.z) < EPSILON)
    })
  })

  describe('parseTransformProperties()', () => {
    it('should use default component values', () => {
      const componentData = parseTransformProperties({})
      assert.deepEqual(
        JSON.parse(JSON.stringify(componentData.position)),
        SCENE_COMPONENT_TRANSFORM_DEFAULT_VALUES.position
      )
      assert.deepEqual(
        componentData.rotation,
        new Quaternion().setFromEuler(
          new Euler(
            SCENE_COMPONENT_TRANSFORM_DEFAULT_VALUES.rotation.x,
            SCENE_COMPONENT_TRANSFORM_DEFAULT_VALUES.rotation.y,
            SCENE_COMPONENT_TRANSFORM_DEFAULT_VALUES.rotation.z
          )
        )
      )
      assert.deepEqual(JSON.parse(JSON.stringify(componentData.scale)), SCENE_COMPONENT_TRANSFORM_DEFAULT_VALUES.scale)
    })

    it('should use passed values', () => {
      const componentData = parseTransformProperties({ ...sceneComponentData })
      assert.deepEqual(componentData.position, sceneComponentData.position)
      assert.deepEqual(
        componentData.rotation,
        new Quaternion().setFromEuler(
          new Euler(sceneComponentData.rotation.x, sceneComponentData.rotation.y, sceneComponentData.rotation.z)
        )
      )
      assert.deepEqual(componentData.scale, sceneComponentData.scale)
    })
  })
})
