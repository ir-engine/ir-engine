import assert from 'assert'
import proxyquire from 'proxyquire'
import { Object3D, Quaternion, Vector3 } from 'three'

import { ComponentJson } from '@xrengine/common/src/interfaces/SceneInterface'

import { Engine } from '../../../ecs/classes/Engine'
import { Entity } from '../../../ecs/classes/Entity'
import { addComponent, getComponent, hasComponent } from '../../../ecs/functions/ComponentFunctions'
import { createEntity } from '../../../ecs/functions/EntityFunctions'
import { createEngine } from '../../../initializeEngine'
import { ColliderComponent } from '../../../physics/components/ColliderComponent'
import { CollisionComponent } from '../../../physics/components/CollisionComponent'
import { EntityNodeComponent } from '../../components/EntityNodeComponent'
import { Object3DComponent } from '../../components/Object3DComponent'
import { SCENE_COMPONENT_COLLIDER } from './ColliderFunctions'

let transform2 = {
  translation: new Vector3(Math.random(), Math.random(), Math.random()),
  rotation: new Quaternion(Math.random(), Math.random(), Math.random(), Math.random())
}

describe('ColliderFunctions', () => {
  let entity: Entity
  let body: any
  let colliderFunctions = proxyquire('./ColliderFunctions', {
    '../../../physics/functions/createCollider': {
      createColliderForObject3D: (entity) => {
        if (hasComponent(entity, Object3DComponent)) {
          addComponent(entity, ColliderComponent, { body })
          addComponent(entity, CollisionComponent, { collisions: [] })
        }
      }
    }
  })

  beforeEach(async () => {
    createEngine()
    entity = createEntity()
    await Engine.instance.currentWorld.physics.createScene({ verbose: true })

    body = {
      getGlobalPose: () => transform2,
      setGlobalPose: (t: any) => (transform2 = t),
      _debugNeedsUpdate: false
    }
  })

  afterEach(() => {
    delete (globalThis as any).PhysX
  })

  const sceneComponentData = {}

  const sceneComponent: ComponentJson = {
    name: SCENE_COMPONENT_COLLIDER,
    props: sceneComponentData
  }

  describe('deserializeCollider()', () => {
    it('does not create ColliderComponent and CollisionComponent if there is no Object3d Component', () => {
      colliderFunctions.deserializeCollider(entity, sceneComponent)

      assert(!hasComponent(entity, ColliderComponent))
      assert(!hasComponent(entity, CollisionComponent))
    })

    it('creates ColliderComponent and CollisionComponent', () => {
      addComponent(entity, Object3DComponent, { value: new Object3D() })
      colliderFunctions.deserializeCollider(entity, sceneComponent)

      const collider = getComponent(entity, ColliderComponent)
      const collision = getComponent(entity, CollisionComponent)

      assert(collider && collider.body === body, 'ColliderComponent is not created')
      assert(collision && collision.collisions.length <= 0, 'CollisionComponent is not created')
    })

    it('will include this component into EntityNodeComponent', () => {
      addComponent(entity, EntityNodeComponent, { components: [] })

      colliderFunctions.deserializeCollider(entity, sceneComponent)

      const entityNodeComponent = getComponent(entity, EntityNodeComponent)
      assert(entityNodeComponent.components.includes(SCENE_COMPONENT_COLLIDER))
    })
  })

  describe('serializeCollider()', () => {
    it('should properly serialize collider', () => {
      addComponent(entity, Object3DComponent, { value: new Object3D() })
      colliderFunctions.deserializeCollider(entity, sceneComponent)
      assert.deepEqual(colliderFunctions.serializeCollider(entity), { ...sceneComponent, props: {} })
    })

    it('should return undefine if there is no collider component', () => {
      assert(colliderFunctions.serializeCollider(entity) === undefined)
    })
  })
})
