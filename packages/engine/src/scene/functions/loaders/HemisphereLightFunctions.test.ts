import assert from 'assert'
import { Color, HemisphereLight } from 'three'

import { getComponent, hasComponent } from '../../../ecs/functions/ComponentFunctions'
import { createEntity } from '../../../ecs/functions/EntityFunctions'
import { createEngine } from '../../../initializeEngine'
import { HemisphereLightComponent } from '../../components/HemisphereLightComponent'
import { deserializeHemisphereLight, updateHemisphereLight } from './HemisphereLightFunctions'

describe('HemisphereLightFunctions', () => {
  it('deserializeHemisphereLight', async () => {
    createEngine()

    const entity = createEntity()

    const color = new Color('pink')
    const sceneComponentData = {
      skyColor: color.clone(),
      intensity: 5
    }

    deserializeHemisphereLight(entity, sceneComponentData)
    updateHemisphereLight(entity)

    assert(hasComponent(entity, HemisphereLightComponent))
    assert(getComponent(entity, HemisphereLightComponent).light instanceof HemisphereLight)
    assert(getComponent(entity, HemisphereLightComponent).light!.color instanceof Color)
    assert.deepEqual(getComponent(entity, HemisphereLightComponent).light!.color, color)
    assert.deepEqual(getComponent(entity, HemisphereLightComponent).light!.intensity, 5)
  })
})
