import { MathUtils, Quaternion, Vector3 } from 'three'
import { addComponent, getComponent, hasComponent } from '../../ecs/functions/ComponentFunctions'
import { createEntity } from '../../ecs/functions/EntityFunctions'
import { Object3DComponent } from '../components/Object3DComponent'
import { TransformComponent } from '../../transform/components/TransformComponent'
import assert from 'assert'
import { createWorld } from "../../ecs/classes/World"
import { Engine } from '../../ecs/classes/Engine'
import { loadComponent } from './SceneLoading'
import { InteractableComponent } from '../../interaction/components/InteractableComponent'
import { ComponentJson } from '@xrengine/common/src/interfaces/SceneInterface'


// these need to be rewritten into the new format
describe.skip('SceneLoading.test', () => {


  it.skip('_metadata', async () => {
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
      _data: testData
    }
    const sceneComponent: ComponentJson = {
      name: '_metadata',
      props: sceneComponentData
    }

    loadComponent(entity, sceneComponent)

    assert.equal(world.worldMetadata[testData], `${randomVector3.x},${randomVector3.y},${randomVector3.z}`)
    assert(hasComponent(entity, Object3DComponent))
    assert.equal((getComponent(entity, Object3DComponent).value as any)._data, testData)
    assert(hasComponent(entity, InteractableComponent))
    assert.equal(getComponent(entity, InteractableComponent).action, '_metadata')

  })
})
