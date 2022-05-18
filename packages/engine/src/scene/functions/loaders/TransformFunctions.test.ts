import assert from 'assert'
import { Euler, Quaternion, Vector3 } from 'three'

import { ComponentJson } from '@xrengine/common/src/interfaces/SceneInterface'

import { Engine } from '../../../ecs/classes/Engine'
import { Entity } from '../../../ecs/classes/Entity'
import { getComponent } from '../../../ecs/functions/ComponentFunctions'
import { addComponent } from '../../../ecs/functions/ComponentFunctions'
import { createEntity } from '../../../ecs/functions/EntityFunctions'
import { createEngine } from '../../../initializeEngine'
import { TransformComponent } from '../../../transform/components/TransformComponent'
import { EntityNodeComponent } from '../../components/EntityNodeComponent'
import {
  deserializeTransform,
  parseTransformProperties,
  SCENE_COMPONENT_TRANSFORM,
  SCENE_COMPONENT_TRANSFORM_DEFAULT_VALUES,
  serializeTransform
} from './TransformFunctions'

const EPSILON = 10e-8

describe('TransformFunctions', () => {
  let entity: Entity

  beforeEach(() => {
    createEngine()
    entity = createEntity()
  })

  const sceneComponentData = {
    position: new Vector3(Math.random(), Math.random(), Math.random()),
    rotation: new Euler(Math.random(), Math.random(), Math.random()),
    scale: new Vector3(Math.random(), Math.random(), Math.random())
  }

  const sceneComponent: ComponentJson = {
    name: SCENE_COMPONENT_TRANSFORM,
    props: sceneComponentData
  }

  describe('deserializeTransform()', () => {
    it('creates Transform Component with provided component data', () => {
      deserializeTransform(entity, sceneComponent)

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

    it('will include this component into EntityNodeComponent', () => {
      addComponent(entity, EntityNodeComponent, { components: [] })

      deserializeTransform(entity, sceneComponent)

      const entityNodeComponent = getComponent(entity, EntityNodeComponent)
      assert(entityNodeComponent.components.includes(SCENE_COMPONENT_TRANSFORM))
    })
  })

  describe.skip('updateTransform', () => {})

  describe('serializeTransform()', () => {
    it('should properly serialize transform', () => {
      deserializeTransform(entity, sceneComponent)
      const result = serializeTransform(entity)

      assert(Math.abs(result?.props.position.x - sceneComponentData.position.x) < EPSILON)
      assert(Math.abs(result?.props.position.y - sceneComponentData.position.y) < EPSILON)
      assert(Math.abs(result?.props.position.z - sceneComponentData.position.z) < EPSILON)

      assert(Math.abs(result?.props.rotation.x - sceneComponentData.rotation.x) < EPSILON)
      assert(Math.abs(result?.props.rotation.y - sceneComponentData.rotation.y) < EPSILON)
      assert(Math.abs(result?.props.rotation.z - sceneComponentData.rotation.z) < EPSILON)

      assert(Math.abs(result?.props.scale.x - sceneComponentData.scale.x) < EPSILON)
      assert(Math.abs(result?.props.scale.y - sceneComponentData.scale.y) < EPSILON)
      assert(Math.abs(result?.props.scale.z - sceneComponentData.scale.z) < EPSILON)
    })

    it('should return undefine if there is no transform component', () => {
      assert(serializeTransform(entity) === undefined)
    })
  })

  describe('parseTransformProperties()', () => {
    it('should use default component values', () => {
      const componentData = parseTransformProperties({})
      assert.deepEqual(componentData.position, SCENE_COMPONENT_TRANSFORM_DEFAULT_VALUES.position)
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
      assert.deepEqual(componentData.scale, SCENE_COMPONENT_TRANSFORM_DEFAULT_VALUES.scale)
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
