import assert from 'assert'
import { Object3D } from 'three'

import { ComponentJson } from '@xrengine/common/src/interfaces/SceneInterface'

import { Engine } from '../../../ecs/classes/Engine'
import { addComponent, getComponent, hasComponent } from '../../../ecs/functions/ComponentFunctions'
import { createEntity } from '../../../ecs/functions/EntityFunctions'
import { createEngine } from '../../../initializeEngine'
import { Physics } from '../../../physics/classes/Physics'
import { RigidBodyComponent } from '../../../physics/components/RigidBodyComponent'
import { EntityNodeComponent } from '../../components/EntityNodeComponent'
import { Object3DComponent } from '../../components/Object3DComponent'
import { deserializeCollider, SCENE_COMPONENT_COLLIDER, serializeCollider } from './ColliderFunctions'

describe('ColliderFunctions', () => {
  beforeEach(async () => {
    createEngine()
    await Physics.load()
    Engine.instance.currentWorld.physicsWorld = Physics.createWorld()
  })

  const sceneComponentData = {}

  const sceneComponent: ComponentJson = {
    name: SCENE_COMPONENT_COLLIDER,
    props: sceneComponentData
  }

  describe('deserializeCollider()', () => {
    it('does not create RigidBodyComponent if there is no Object3d Component', () => {
      const entity = createEntity()

      deserializeCollider(entity, sceneComponent)

      assert(!hasComponent(entity, RigidBodyComponent))
    })

    it('creates  RigidBodyComponent', () => {
      const entity = createEntity()
      addComponent(entity, Object3DComponent, { value: new Object3D() })

      deserializeCollider(entity, sceneComponent)

      const body = getComponent(entity, RigidBodyComponent).body

      assert(body, 'RigidBodyComponent is not created')
    })

    it('will include this component into EntityNodeComponent', () => {
      const entity = createEntity()
      addComponent(entity, EntityNodeComponent, { components: [] })

      deserializeCollider(entity, sceneComponent)

      const entityNodeComponent = getComponent(entity, EntityNodeComponent)
      assert(entityNodeComponent.components.includes(SCENE_COMPONENT_COLLIDER))
    })
  })

  describe('serializeCollider()', () => {
    it('should properly serialize collider', () => {
      const entity = createEntity()
      addComponent(entity, Object3DComponent, { value: new Object3D() })
      deserializeCollider(entity, sceneComponent)
      assert(serializeCollider(entity) === undefined)
    })

    it('should return undefine if there is no collider component', () => {
      const entity = createEntity()
      assert(serializeCollider(entity) === undefined)
    })
  })
})
