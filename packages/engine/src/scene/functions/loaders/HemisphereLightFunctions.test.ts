import assert from 'assert'
import { Color, HemisphereLight } from 'three'

import { ComponentJson } from '@xrengine/common/src/interfaces/SceneInterface'

import { getComponent, hasComponent } from '../../../ecs/functions/ComponentFunctions'
import { createEntity } from '../../../ecs/functions/EntityFunctions'
import { createEngine } from '../../../initializeEngine'
import { Object3DComponent } from '../../components/Object3DComponent'
import { deserializeHemisphereLight } from './HemisphereLightFunctions'

describe('HemisphereLightFunctions', () => {
  it('deserializeHemisphereLight', async () => {
    createEngine()

    const entity = createEntity()

    const color = new Color('pink')
    const sceneComponentData = {
      skyColor: color.clone(),
      intensity: 5
    }
    const sceneComponent: ComponentJson = {
      name: 'hemisphere-light',
      props: sceneComponentData
    }

    deserializeHemisphereLight(entity, sceneComponent)

    assert(hasComponent(entity, Object3DComponent))
    assert(getComponent(entity, Object3DComponent).value instanceof HemisphereLight)
    assert((getComponent(entity, Object3DComponent).value as HemisphereLight).color instanceof Color)
    assert.deepEqual((getComponent(entity, Object3DComponent).value as HemisphereLight).color, color)
    assert.deepEqual((getComponent(entity, Object3DComponent).value as HemisphereLight).intensity, 5)
  })
})
