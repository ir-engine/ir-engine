import assert from 'assert'
import proxyquire from 'proxyquire'

import { ComponentJson } from '@xrengine/common/src/interfaces/SceneInterface'

import { Entity } from '../../../ecs/classes/Entity'
import { getComponent } from '../../../ecs/functions/ComponentFunctions'
import { createEntity } from '../../../ecs/functions/EntityFunctions'
import { createEngine } from '../../../initializeEngine'
import { Object3DComponent } from '../../components/Object3DComponent'
import { VisibleComponent } from '../../components/VisibleComponent'
import { SCENE_COMPONENT_VISIBLE } from './VisibleFunctions'

describe('VisibleFunctions', () => {
  let entity: Entity
  let visibleFunctions = proxyquire('./VisibleFunctions', {
    '../../../common/functions/isClient': { isClient: true }
  })

  beforeEach(() => {
    createEngine()
    entity = createEntity()
  })

  const sceneComponentData = {}

  const sceneComponent: ComponentJson = {
    name: SCENE_COMPONENT_VISIBLE,
    props: sceneComponentData
  }

  describe('deserializeVisible', () => {
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
