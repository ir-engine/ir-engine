import assert from 'assert'

import { ComponentJson } from '@xrengine/common/src/interfaces/SceneInterface'

import { Engine } from '../../../ecs/classes/Engine'
import { Entity } from '../../../ecs/classes/Entity'
import { getComponent } from '../../../ecs/functions/ComponentFunctions'
import { addComponent } from '../../../ecs/functions/ComponentFunctions'
import { createEntity } from '../../../ecs/functions/EntityFunctions'
import { createEngine } from '../../../initializeEngine'
import { EntityNodeComponent } from '../../components/EntityNodeComponent'
import { PreventBakeTagComponent } from '../../components/PreventBakeTagComponent'
import { deserializePreventBake, SCENE_COMPONENT_PREVENT_BAKE, serializePreventBake } from './PreventBakeFunctions'

describe('PreventBakeFunctions', () => {
  let entity: Entity

  beforeEach(() => {
    createEngine()
    entity = createEntity()
  })

  const sceneComponentData = {}

  const sceneComponent: ComponentJson = {
    name: SCENE_COMPONENT_PREVENT_BAKE,
    props: sceneComponentData
  }

  describe('deserializePreventBake()', () => {
    it('will include this component into EntityNodeComponent', () => {
      addComponent(entity, EntityNodeComponent, { components: [] })

      deserializePreventBake(entity, sceneComponent)

      const entityNodeComponent = getComponent(entity, EntityNodeComponent)
      assert(entityNodeComponent.components.includes(SCENE_COMPONENT_PREVENT_BAKE))
    })

    it('creates PreventBake Component with provided component data', () => {
      Engine.instance.isEditor = true
      addComponent(entity, EntityNodeComponent, { components: [] })
      deserializePreventBake(entity, sceneComponent)

      const preventbakeComponent = getComponent(entity, PreventBakeTagComponent)
      assert(preventbakeComponent)
      assert(Object.keys(preventbakeComponent).length === 0)
    })
  })

  describe('serializePreventBake()', () => {
    it('should properly serialize preventbake', () => {
      Engine.instance.isEditor = true
      deserializePreventBake(entity, sceneComponent)
      assert.deepEqual(serializePreventBake(entity), sceneComponent)
    })

    it('should return undefine if there is no preventbake component', () => {
      Engine.instance.isEditor = true
      assert(serializePreventBake(entity) === undefined)
    })
  })
})
