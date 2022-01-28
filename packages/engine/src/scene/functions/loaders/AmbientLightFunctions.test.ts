import assert from 'assert'
import { ComponentJson } from '@xrengine/common/src/interfaces/SceneInterface'
import { AmbientLight, Color, MathUtils } from 'three'
import { createEntity } from '../../../ecs/functions/EntityFunctions'
import { createWorld } from '../../../ecs/classes/World'
import { Engine } from '../../../ecs/classes/Engine'
import { getComponent, hasComponent } from '../../../ecs/functions/ComponentFunctions'
import { deserializeAmbientLight } from './AmbientLightFunctions'
import { Object3DComponent } from '../../components/Object3DComponent'

describe('AmbientLightFunctions', () => {
  it('deserializeAmbientLight', () => {
    const world = createWorld()
    Engine.currentWorld = world

    const entity = createEntity()
    const color = new Color('red')
    const sceneComponentData = {
      color: color.clone(),
      intensity: 5
    }
    const sceneComponent: ComponentJson = {
      name: 'ambient-light',
      props: sceneComponentData
    }

    deserializeAmbientLight(entity, sceneComponent)

    assert(hasComponent(entity, Object3DComponent))
    assert(getComponent(entity, Object3DComponent).value instanceof AmbientLight)
    assert((getComponent(entity, Object3DComponent).value as AmbientLight).color instanceof Color)
    assert.deepEqual((getComponent(entity, Object3DComponent).value as AmbientLight).color.toArray(), color.toArray())
    assert.deepEqual((getComponent(entity, Object3DComponent).value as AmbientLight).intensity, 5)
  })
})
