import assert from 'assert'
import { Object3D } from 'three'

import { ComponentJson } from '@xrengine/common/src/interfaces/SceneInterface'

import { Engine } from '../../../ecs/classes/Engine'
import { addComponent, getComponent, hasComponent } from '../../../ecs/functions/ComponentFunctions'
import { createEntity } from '../../../ecs/functions/EntityFunctions'
import { createEngine } from '../../../initializeEngine'
import { Physics } from '../../../physics/classes/Physics'
import { RigidBodyComponent } from '../../../physics/components/RigidBodyComponent'
import { Object3DComponent } from '../../components/Object3DComponent'
import { deserializeCollider, SCENE_COMPONENT_COLLIDER } from './ColliderFunctions'

describe('ColliderFunctions', () => {
  beforeEach(async () => {
    createEngine()
    await Physics.load()
    Engine.instance.currentWorld.physicsWorld = Physics.createWorld()
  })

  describe('deserializeCollider()', () => {
    it('does not create RigidBodyComponent if there is no Object3d Component', () => {
      const entity = createEntity()

      deserializeCollider(entity, {})

      assert(!hasComponent(entity, RigidBodyComponent))
    })

    it('creates  RigidBodyComponent', () => {
      const entity = createEntity()
      addComponent(entity, Object3DComponent, { value: new Object3D() })

      deserializeCollider(entity, {})

      const body = getComponent(entity, RigidBodyComponent).body

      assert(body, 'RigidBodyComponent is not created')
    })
  })
})
