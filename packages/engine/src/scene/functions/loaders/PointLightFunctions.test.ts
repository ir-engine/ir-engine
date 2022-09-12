import assert from 'assert'
import { Color, PointLight } from 'three'

import { getComponent, hasComponent } from '../../../ecs/functions/ComponentFunctions'
import { createEntity } from '../../../ecs/functions/EntityFunctions'
import { createEngine } from '../../../initializeEngine'
import { PointLightComponent } from '../../components/PointLightComponent'
import { deserializePointLight, updatePointLight } from './PointLightFunctions'

describe('PointLightFunctions', () => {
  it('deserializePointLight', () => {
    createEngine()

    const entity = createEntity()
    const color = new Color('pink')
    const sceneComponentData = {
      color: color.clone(),
      intensity: 5
    }

    deserializePointLight(entity, sceneComponentData)
    updatePointLight(entity)

    assert(hasComponent(entity, PointLightComponent))
    assert(getComponent(entity, PointLightComponent).light instanceof PointLight)
    assert(getComponent(entity, PointLightComponent).light!.color instanceof Color)
    assert.deepEqual(getComponent(entity, PointLightComponent).light!.color.toArray(), color.toArray())
    assert.deepEqual(getComponent(entity, PointLightComponent).light!.intensity, 5)
  })
})
