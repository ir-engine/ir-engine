import assert from 'assert'
import proxyquire from 'proxyquire'
import { Object3D } from 'three'

import { Entity } from '../../../ecs/classes/Entity'
import { getComponent } from '../../../ecs/functions/ComponentFunctions'
import { createEntity } from '../../../ecs/functions/EntityFunctions'
import { createEngine } from '../../../initializeEngine'
import { Object3DComponent } from '../../components/Object3DComponent'
import { WaterComponent } from '../../components/WaterComponent'

class FakeWater extends Object3D {}

describe('WaterFunctions', () => {
  let entity: Entity
  let waterFunctions = proxyquire('./WaterFunctions', {
    '../../../common/functions/isClient': { isClient: true },
    '../../classes/Water': { Water: FakeWater }
  })

  beforeEach(() => {
    createEngine()
    entity = createEntity()
  })

  describe('deserializeWater()', () => {
    it('creates Water Component with provided component data', () => {
      waterFunctions.deserializeWater(entity, {})

      const waterComponent = getComponent(entity, WaterComponent)
      assert(waterComponent)
      assert(Object.keys(waterComponent).length === 0)
    })

    it('creates Water Object3D with provided component data', () => {
      waterFunctions.deserializeWater(entity, {})

      const obj3d = getComponent(entity, Object3DComponent)?.value
      assert(obj3d && obj3d instanceof FakeWater, 'Water is not created')
    })
  })
})
