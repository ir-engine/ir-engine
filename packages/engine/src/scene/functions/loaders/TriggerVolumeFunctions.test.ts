import { ComponentJson } from '@xrengine/common/src/interfaces/SceneInterface'
import assert from 'assert'
import { MathUtils, Quaternion, Vector3 } from 'three'
import { Engine } from '../../../ecs/classes/Engine'
import { createWorld } from '../../../ecs/classes/World'
import { addComponent, getComponent, hasComponent } from '../../../ecs/functions/ComponentFunctions'
import { createEntity } from '../../../ecs/functions/EntityFunctions'
import { ColliderComponent } from '../../../physics/components/ColliderComponent'
import { CollisionComponent } from '../../../physics/components/CollisionComponent'
import { TransformComponent } from '../../../transform/components/TransformComponent'
import { TriggerVolumeComponent } from '../../components/TriggerVolumeComponent'
import { deserializeTriggerVolume } from './TriggerVolumeFunctions'

describe('TriggerVolumeFunctions', () => {
  it('deserializeTriggerVolume', async () => {
    const world = createWorld()
    Engine.currentWorld = world
    Engine.currentWorld = world
    await Engine.currentWorld.physics.createScene({ verbose: true })

    const entity = createEntity()

    const randomVector3 = new Vector3().random()
    addComponent(entity, TransformComponent, {
      position: randomVector3.clone(),
      rotation: new Quaternion(),
      scale: new Vector3()
    })

    const target = MathUtils.generateUUID()

    const sceneComponentData = {
      active: true,
      target,
      onEnter: 'myEnter',
      onExit: 'myExit'
    }
    const sceneComponent: ComponentJson = {
      name: 'trigger-volume',
      props: sceneComponentData
    }

    deserializeTriggerVolume(entity, sceneComponent)

    assert(hasComponent(entity, TriggerVolumeComponent))
    assert.deepEqual(getComponent(entity, TriggerVolumeComponent), { ...sceneComponentData })
    assert.equal(getComponent(entity, TriggerVolumeComponent).target, target)
    assert(hasComponent(entity, ColliderComponent))
    assert(hasComponent(entity, CollisionComponent))

    // clean up physx
    delete (globalThis as any).PhysX
  })
})