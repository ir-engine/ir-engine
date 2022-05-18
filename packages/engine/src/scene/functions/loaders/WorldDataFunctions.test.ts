import { ComponentJson } from '@xrengine/common/src/interfaces/SceneInterface'
import { MathUtils, Quaternion, Vector3 } from 'three'
import { createEntity } from '../../../ecs/functions/EntityFunctions'
import assert from 'assert'
import { createWorld } from '../../../ecs/classes/World'
import { Engine } from '../../../ecs/classes/Engine'
import { deserializeWorldData } from './WorldDataFunctions'
import { addComponent, getComponent, hasComponent } from '../../../ecs/functions/ComponentFunctions'
import { TransformComponent } from '../../../transform/components/TransformComponent'
import { Object3DComponent } from '../../components/Object3DComponent'
import { InteractableComponent } from '../../../interaction/components/InteractableComponent'

describe('WorldDataFunctions', () => {
  describe('deserializeWorldData', () => {
    const world = createWorld()
    Engine.currentWorld = world
    const entity = createEntity()
    const randomVector3 = new Vector3().random()
    addComponent(entity, TransformComponent, {
      position: randomVector3.clone(),
      rotation: new Quaternion(),
      scale: new Vector3(1, 1, 1)
    })

    const testData = MathUtils.generateUUID()
    const sceneComponentData = {
      data: testData
    }
    const sceneComponent: ComponentJson = {
      name: '_metadata',
      props: sceneComponentData
    }

    deserializeWorldData(entity, sceneComponent)

    assert.equal(world.worldMetadata[testData], `${randomVector3.x},${randomVector3.y},${randomVector3.z}`)
    assert(hasComponent(entity, Object3DComponent))
    assert.equal((getComponent(entity, Object3DComponent).value as any)._data, testData)
    assert(hasComponent(entity, InteractableComponent))
    assert.equal(getComponent(entity, InteractableComponent).action, '_metadata')
    assert.equal(getComponent(entity, InteractableComponent).interactionUserData, testData)
  })
})
