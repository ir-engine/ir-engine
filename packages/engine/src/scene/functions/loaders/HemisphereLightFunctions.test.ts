import assert from 'assert'
import { ComponentJson } from '@xrengine/common/src/interfaces/SceneInterface'
import { Color, HemisphereLight } from 'three'
import { createEntity } from '../../../ecs/functions/EntityFunctions'
import { createWorld } from '../../../ecs/classes/World'
import { Engine } from '../../../ecs/classes/Engine'
import { deserializeHemisphereLight } from './HemisphereLightFunctions'
import { getComponent, hasComponent } from '../../../ecs/functions/ComponentFunctions'
import { Object3DComponent } from '../../components/Object3DComponent'

describe('HemisphereLightFunctions', () => {
  it('deserializeHemisphereLight', async () => {
    const world = createWorld()
    Engine.currentWorld = world

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
