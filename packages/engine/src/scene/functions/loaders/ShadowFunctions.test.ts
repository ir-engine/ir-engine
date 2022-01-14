import { ComponentJson } from '@xrengine/common/src/interfaces/SceneInterface'
import assert from 'assert'
import { Engine } from '../../../ecs/classes/Engine'
import { createWorld } from '../../../ecs/classes/World'
import { getComponent, hasComponent } from '../../../ecs/functions/ComponentFunctions'
import { createEntity } from '../../../ecs/functions/EntityFunctions'
import { ShadowComponent } from '../../components/ShadowComponent'
import { deserializeShadow } from './ShadowFunctions'

describe('ShadowFunctions', () => {
  it('deserializeShadow', () => {
    const world = createWorld()
    Engine.currentWorld = world
    const entity = createEntity()

    const sceneComponentData = {
      cast: true,
      receive: true
    }
    const sceneComponent: ComponentJson = {
      name: 'shadow',
      props: sceneComponentData
    }

    deserializeShadow(entity, sceneComponent)

    assert(hasComponent(entity, ShadowComponent))
    assert(getComponent(entity, ShadowComponent).castShadow)
    assert(getComponent(entity, ShadowComponent).receiveShadow)
  })
})