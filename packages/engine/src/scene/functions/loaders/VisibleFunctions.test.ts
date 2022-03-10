import assert from 'assert'
import proxyquire from 'proxyquire'

import { ComponentJson } from '@xrengine/common/src/interfaces/SceneInterface'

import { Engine } from '../../../ecs/classes/Engine'
import { Entity } from '../../../ecs/classes/Entity'
import { createWorld, World } from '../../../ecs/classes/World'
import { getComponent } from '../../../ecs/functions/ComponentFunctions'
import { addComponent } from '../../../ecs/functions/ComponentFunctions'
import { createEntity } from '../../../ecs/functions/EntityFunctions'
import { EntityNodeComponent } from '../../components/EntityNodeComponent'
import { Object3DComponent } from '../../components/Object3DComponent'
import { VisibleComponent } from '../../components/VisibleComponent'
import { SCENE_COMPONENT_VISIBLE } from './VisibleFunctions'

describe('VisibleFunctions', () => {
  let world: World
  let entity: Entity
  let visibleFunctions = proxyquire('./VisibleFunctions', {
    '../../../common/functions/isClient': { isClient: true }
  })

  beforeEach(() => {
    world = createWorld()
    Engine.currentWorld = world
    entity = createEntity()
  })

  const sceneComponentData = {}

  const sceneComponent: ComponentJson = {
    name: SCENE_COMPONENT_VISIBLE,
    props: sceneComponentData
  }

  describe('deserializeVisible', () => {
    it('does not create Visible Component while not on client side', () => {
      const _visibleFunctions = proxyquire('./VisibleFunctions', {
        '../../../common/functions/isClient': { isClient: false }
      })
      _visibleFunctions.deserializeVisible(entity, sceneComponent)

      const visibleComponent = getComponent(entity, VisibleComponent)
      assert(!visibleComponent)
    })

    it('creates Visible Component with provided component data', () => {
      visibleFunctions.deserializeVisible(entity, sceneComponent)

      const visibleComponent = getComponent(entity, VisibleComponent)
      assert(visibleComponent)
      assert(Object.keys(visibleComponent).length === 0)
    })

    it('does not create/change Object3D', () => {
      visibleFunctions.deserializeVisible(entity, sceneComponent)
      assert(!getComponent(entity, Object3DComponent)?.value)
    })

    describe('Editor vs Location', () => {
      it('creates Visible in Location', () => {
        addComponent(entity, EntityNodeComponent, { components: [] })

        visibleFunctions.deserializeVisible(entity, sceneComponent)

        const entityNodeComponent = getComponent(entity, EntityNodeComponent)
        assert(!entityNodeComponent.components.includes(SCENE_COMPONENT_VISIBLE))
      })

      it('creates Visible in Editor', () => {
        Engine.isEditor = true

        addComponent(entity, EntityNodeComponent, { components: [] })

        visibleFunctions.deserializeVisible(entity, sceneComponent)

        const entityNodeComponent = getComponent(entity, EntityNodeComponent)
        assert(entityNodeComponent.components.includes(SCENE_COMPONENT_VISIBLE))
        Engine.isEditor = false
      })
    })
  })

  describe('serializeVisible()', () => {
    it('should properly serialize Visible', () => {
      visibleFunctions.deserializeVisible(entity, sceneComponent)
      assert.deepEqual(visibleFunctions.serializeVisible(entity), sceneComponent)
    })

    it('should return undefine if there is no Visible component', () => {
      assert(visibleFunctions.serializeVisible(entity) === undefined)
    })
  })
})
