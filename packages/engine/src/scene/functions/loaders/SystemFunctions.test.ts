import assert from 'assert'
import { Object3D } from 'three'

import { ComponentJson } from '@xrengine/common/src/interfaces/SceneInterface'

import { Engine } from '../../../ecs/classes/Engine'
import { Entity } from '../../../ecs/classes/Entity'
import { getComponent } from '../../../ecs/functions/ComponentFunctions'
import { addComponent } from '../../../ecs/functions/ComponentFunctions'
import { createEntity } from '../../../ecs/functions/EntityFunctions'
import { SystemUpdateType } from '../../../ecs/functions/SystemUpdateType'
import { createEngine } from '../../../initializeEngine'
import { EntityNodeComponent } from '../../components/EntityNodeComponent'
import { Object3DComponent } from '../../components/Object3DComponent'
import { PreventBakeTagComponent } from '../../components/PreventBakeTagComponent'
import { SystemComponent } from '../../components/SystemComponent'
import {
  deserializeSystem,
  parseSystemProperties,
  SCENE_COMPONENT_SYSTEM,
  SCENE_COMPONENT_SYSTEM_DEFAULT_VALUES,
  serializeSystem
} from './SystemFunctions'

describe('SystemFunctions', () => {
  let entity: Entity

  beforeEach(() => {
    createEngine()
    entity = createEntity()
  })

  const sceneComponentData = {
    filePath: 'Some random string',
    systemUpdateType: SystemUpdateType.UPDATE,
    enableClient: true,
    enableServer: true,
    args: {}
  }

  const sceneComponent: ComponentJson = {
    name: SCENE_COMPONENT_SYSTEM,
    props: sceneComponentData
  }

  describe('deserializeSystem()', () => {
    it('creates System Component with provided component data', () => {
      deserializeSystem(entity, sceneComponent)

      const systemComponent = getComponent(entity, SystemComponent)
      assert(systemComponent)
      assert.deepEqual(systemComponent, sceneComponentData)
      assert(getComponent(entity, PreventBakeTagComponent))
    })

    it('will include this component into EntityNodeComponent', () => {
      addComponent(entity, EntityNodeComponent, { components: [] })

      deserializeSystem(entity, sceneComponent)

      const entityNodeComponent = getComponent(entity, EntityNodeComponent)
      assert(entityNodeComponent.components.includes(SCENE_COMPONENT_SYSTEM))
    })
  })

  describe.skip('updateSystem', () => {})

  describe('serializeSystem()', () => {
    it('should properly serialize system', () => {
      deserializeSystem(entity, sceneComponent)
      assert.deepEqual(serializeSystem(entity), sceneComponent)
    })

    it('should return undefine if there is no system component', () => {
      assert(serializeSystem(entity) === undefined)
    })
  })

  describe('parseSystemProperties()', () => {
    it('should use default component values', () => {
      const componentData = parseSystemProperties({})
      assert.deepEqual(componentData, SCENE_COMPONENT_SYSTEM_DEFAULT_VALUES)
    })

    it('should use passed values', () => {
      const componentData = parseSystemProperties(sceneComponentData)
      assert.deepEqual(componentData, sceneComponentData)
    })
  })
})
