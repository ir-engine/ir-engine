import { ComponentJson } from '@xrengine/common/src/interfaces/SceneInterface'
import assert from 'assert'
import { Euler, MathUtils, Quaternion, Vector3 } from 'three'
import { Engine } from '../../../ecs/classes/Engine'
import { createWorld } from '../../../ecs/classes/World'
import { addComponent, getComponent, hasComponent } from '../../../ecs/functions/ComponentFunctions'
import { createEntity } from '../../../ecs/functions/EntityFunctions'
import { ColliderComponent } from '../../../physics/components/ColliderComponent'
import { CollisionComponent } from '../../../physics/components/CollisionComponent'
import { TransformComponent } from '../../../transform/components/TransformComponent'
import { PortalComponent } from '../../components/PortalComponent'
import { TriggerVolumeComponent } from '../../components/TriggerVolumeComponent'
import { deserializePortal } from './PortalFunctions'


describe.skip('PortalFunctions', () => {
  it('deserializePortal', async () => {
    const world = createWorld()
    Engine.currentWorld = world
    Engine.currentWorld = world
    await Engine.currentWorld.physics.createScene({ verbose: true })

    const entity = createEntity()

    const quat = new Quaternion().random()
    const triggerRotation = new Euler().setFromQuaternion(quat, 'XYZ')

    const randomVector3 = new Vector3().random()
    addComponent(entity, TransformComponent, {
      position: randomVector3.clone(),
      rotation: new Quaternion(),
      scale: new Vector3()
    })

    const linkedPortalId = MathUtils.generateUUID()

    const sceneComponentData = {
      modelUrl: '',
      locationName: 'test',
      linkedPortalId,
      displayText: 'Test',
      triggerPosition: { x: 1, y: 1, z: 1 },
      triggerRotation,
      triggerScale: { x: 1, y: 1, z: 1 }
    }
    const sceneComponent: ComponentJson = {
      name: 'portal',
      props: sceneComponentData
    }

    deserializePortal(entity, sceneComponent)

    assert(hasComponent(entity, ColliderComponent))
    assert(hasComponent(entity, CollisionComponent))
    assert(hasComponent(entity, TriggerVolumeComponent))
    assert(hasComponent(entity, PortalComponent))

    // TODO: mesh only created on client
    const portalComponent = getComponent(entity, PortalComponent)
    assert.equal(portalComponent.location, 'test')
    assert.equal(portalComponent.linkedPortalId, linkedPortalId)
    assert.equal(portalComponent.displayText, 'Test')
    assert(Engine.currentWorld.portalQuery().includes(entity))

    // clean up physx
    delete (globalThis as any).PhysX
  })
})