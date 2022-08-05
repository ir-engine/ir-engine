import assert from 'assert'
import { Euler, MathUtils, Quaternion, Vector3 } from 'three'

import { ComponentJson } from '@xrengine/common/src/interfaces/SceneInterface'

import { Engine } from '../../../ecs/classes/Engine'
import { addComponent, getComponent, hasComponent } from '../../../ecs/functions/ComponentFunctions'
import { createEntity } from '../../../ecs/functions/EntityFunctions'
import { createEngine } from '../../../initializeEngine'
import { Physics } from '../../../physics/classes/Physics'
import { TransformComponent } from '../../../transform/components/TransformComponent'
import { NameComponent } from '../../components/NameComponent'
import { PortalComponent, PortalComponentType } from '../../components/PortalComponent'
import { deserializePortal } from './PortalFunctions'

describe('PortalFunctions', () => {
  beforeEach(async () => {
    createEngine()
    await Physics.load()
    Engine.instance.currentWorld.physicsWorld = Physics.createWorld()
  })

  it('deserializePortal', async () => {
    const entity = createEntity()

    const quat = new Quaternion().random()
    const triggerRotation = new Euler().setFromQuaternion(quat, 'XYZ')

    const randomVector3 = new Vector3().random()

    addComponent(entity, NameComponent, { name: 'test-portal' })

    addComponent(entity, TransformComponent, {
      position: randomVector3.clone(),
      rotation: new Quaternion(),
      scale: new Vector3()
    })

    const linkedPortalId = MathUtils.generateUUID()

    const sceneComponentData = {
      helper: null!,
      redirect: false,
      location: 'test',
      effectType: '',
      previewType: '',
      previewImageURL: '',
      linkedPortalId,
      triggerPosition: new Vector3(1, 1, 1),
      triggerRotation,
      triggerScale: new Vector3(1, 1, 1),
      spawnPosition: new Vector3(2, 3, 4),
      spawnRotation: new Quaternion(),
      remoteSpawnPosition: new Vector3(),
      remoteSpawnRotation: new Quaternion()
    } as PortalComponentType

    const sceneComponent: ComponentJson = {
      name: 'portal',
      props: sceneComponentData
    }

    deserializePortal(entity, sceneComponent)

    assert(hasComponent(entity, PortalComponent))

    // TODO: mesh only created on client
    const portalComponent = getComponent(entity, PortalComponent)
    assert.equal(portalComponent.location, 'test')
    assert.equal(portalComponent.linkedPortalId, linkedPortalId)
    assert(Engine.instance.currentWorld.portalQuery().includes(entity))
  })
})
