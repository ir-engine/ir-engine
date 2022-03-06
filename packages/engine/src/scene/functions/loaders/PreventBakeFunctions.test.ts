import assert from 'assert'
import { Object3D } from 'three'

import { ComponentJson } from '@xrengine/common/src/interfaces/SceneInterface'

import { Engine } from '../../../ecs/classes/Engine'
import { Entity } from '../../../ecs/classes/Entity'
import { createWorld, World } from '../../../ecs/classes/World'
import { getComponent } from '../../../ecs/functions/ComponentFunctions'
import { addComponent } from '../../../ecs/functions/ComponentFunctions'
import { createEntity } from '../../../ecs/functions/EntityFunctions'
import { EntityNodeComponent } from '../../components/EntityNodeComponent'
import { PreventBakeTagComponent } from '../../components/PreventBakeTagComponent'
import { deserializePreventBake, SCENE_COMPONENT_PREVENT_BAKE, serializePreventBake } from './PreventBakeFunctions'

class FakePreventBake extends Object3D {}

describe('PreventBakeFunctions', () => {
  let world: World
  let entity: Entity

  beforeEach(() => {
    world = createWorld()
    Engine.currentWorld = world
    entity = createEntity()
  })

  const sceneComponentData = {}

  const sceneComponent: ComponentJson = {
    name: SCENE_COMPONENT_PREVENT_BAKE,
    props: sceneComponentData
  }

  describe('deserializePreventBake()', () => {
    it('does not create PreventBake Component if not in editor', () => {
      Engine.isEditor = false
      addComponent(entity, EntityNodeComponent, { components: [] })
      deserializePreventBake(entity, sceneComponent)

      const preventbakeComponent = getComponent(entity, PreventBakeTagComponent)
      assert(!preventbakeComponent)

      const entityNodeComponent = getComponent(entity, EntityNodeComponent)
      assert(!entityNodeComponent.components.includes(SCENE_COMPONENT_PREVENT_BAKE))
    })

    it('creates PreventBake Component with provided component data', () => {
      Engine.isEditor = true
      addComponent(entity, EntityNodeComponent, { components: [] })
      deserializePreventBake(entity, sceneComponent)

      const preventbakeComponent = getComponent(entity, PreventBakeTagComponent)
      assert(preventbakeComponent)
      assert(Object.keys(preventbakeComponent).length === 0)

      const entityNodeComponent = getComponent(entity, EntityNodeComponent)
      assert(entityNodeComponent.components.includes(SCENE_COMPONENT_PREVENT_BAKE))
    })
  })

  describe('serializePreventBake()', () => {
    it('should properly serialize preventbake', () => {
      deserializePreventBake(entity, sceneComponent)
      assert.deepEqual(serializePreventBake(entity), sceneComponent)
    })

    it('should return undefine if there is no preventbake component', () => {
      assert(serializePreventBake(entity) === undefined)
    })
  })
})
