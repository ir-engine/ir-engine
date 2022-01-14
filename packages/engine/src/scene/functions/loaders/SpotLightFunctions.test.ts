import assert from 'assert'
import { ComponentJson } from "@xrengine/common/src/interfaces/SceneInterface"
import { Color, SpotLight } from "three"
import { createEntity } from "../../../ecs/functions/EntityFunctions"
import { createWorld } from "../../../ecs/classes/World"
import { Engine } from "../../../ecs/classes/Engine"
import { deserializeSpotLight } from './SpotLightFunctions'
import { Object3DComponent } from '../../components/Object3DComponent'
import { getComponent, hasComponent } from '../../../ecs/functions/ComponentFunctions'

describe('SpotLightFunctions', () => {
  it('deserializeSpotLight', () => {
    const world = createWorld()
    Engine.currentWorld = world

    const entity = createEntity()

    const color = new Color('brown')
    const sceneComponentData = {
      color: color.clone(),
      intensity: 5
    }
    const sceneComponent: ComponentJson = {
      name: 'spot-light',
      props: sceneComponentData
    }

    deserializeSpotLight(entity, sceneComponent)

    assert(hasComponent(entity, Object3DComponent))
    assert(getComponent(entity, Object3DComponent).value instanceof SpotLight)
    assert((getComponent(entity, Object3DComponent).value as SpotLight).color instanceof Color)
    assert.deepEqual((getComponent(entity, Object3DComponent).value as SpotLight).color.toArray(), color.toArray())
    assert.deepEqual((getComponent(entity, Object3DComponent).value as SpotLight).intensity, 5)

  })
})