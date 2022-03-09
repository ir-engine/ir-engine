import assert from 'assert'
import proxyquire from 'proxyquire'
import { Object3D } from 'three'

import { ComponentJson } from '@xrengine/common/src/interfaces/SceneInterface'

import { Engine } from '../../../ecs/classes/Engine'
import { Entity } from '../../../ecs/classes/Entity'
import { createWorld, World } from '../../../ecs/classes/World'
import { getComponent } from '../../../ecs/functions/ComponentFunctions'
import { addComponent } from '../../../ecs/functions/ComponentFunctions'
import { createEntity } from '../../../ecs/functions/EntityFunctions'
import { EntityNodeComponent } from '../../components/EntityNodeComponent'
import { Object3DComponent } from '../../components/Object3DComponent'
import { WaterComponent } from '../../components/WaterComponent'
import { SCENE_COMPONENT_WATER } from './WaterFunctions'

class FakeWater extends Object3D {}

describe('WaterFunctions', () => {
  let world: World
  let entity: Entity
  let waterFunctions = proxyquire('./WaterFunctions', {
    '../../../common/functions/isClient': { isClient: true },
    '../../classes/Water': { Water: FakeWater }
  })

  beforeEach(() => {
    world = createWorld()
    Engine.currentWorld = world
    entity = createEntity()
  })

  const sceneComponentData = {}

  const sceneComponent: ComponentJson = {
    name: SCENE_COMPONENT_WATER,
    props: sceneComponentData
  }

  describe('deserializeWater()', () => {
    it('does not create Water Component while not on client side', () => {
      const _waterFunctions = proxyquire('./WaterFunctions', {
        '../../../common/functions/isClient': { isClient: false }
      })
      _waterFunctions.deserializeWater(entity, sceneComponent)

      const waterComponent = getComponent(entity, WaterComponent)
      assert(!waterComponent)
    })

    it('creates Water Component with provided component data', () => {
      waterFunctions.deserializeWater(entity, sceneComponent)

      const waterComponent = getComponent(entity, WaterComponent)
      assert(waterComponent)
      assert(Object.keys(waterComponent).length === 0)
    })

    it('creates Water Object3D with provided component data', () => {
      waterFunctions.deserializeWater(entity, sceneComponent)

      const obj3d = getComponent(entity, Object3DComponent)?.value
      assert(obj3d && obj3d instanceof FakeWater, 'Water is not created')
    })

    describe('Editor vs Location', () => {
      it('creates Water in Location', () => {
        addComponent(entity, EntityNodeComponent, { components: [] })

        waterFunctions.deserializeWater(entity, sceneComponent)

        const entityNodeComponent = getComponent(entity, EntityNodeComponent)
        assert(!entityNodeComponent.components.includes(SCENE_COMPONENT_WATER))
      })

      it('creates Water in Editor', () => {
        Engine.isEditor = true

        addComponent(entity, EntityNodeComponent, { components: [] })

        waterFunctions.deserializeWater(entity, sceneComponent)

        const entityNodeComponent = getComponent(entity, EntityNodeComponent)
        assert(entityNodeComponent.components.includes(SCENE_COMPONENT_WATER))

        const obj3d = getComponent(entity, Object3DComponent)?.value
        assert(obj3d && obj3d.userData.disableOutline, 'Water outline is not disabled')
        Engine.isEditor = false
      })
    })
  })

  describe.skip('updateWater()', () => {})

  describe('serializeWater()', () => {
    it('should properly serialize water', () => {
      waterFunctions.deserializeWater(entity, sceneComponent)
      assert.deepEqual(waterFunctions.serializeWater(entity), sceneComponent)
    })

    it('should return undefine if there is no water component', () => {
      assert(waterFunctions.serializeWater(entity) === undefined)
    })
  })
})
