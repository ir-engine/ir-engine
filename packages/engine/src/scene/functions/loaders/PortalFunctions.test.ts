import assert from 'assert'
import { Euler, MathUtils, Quaternion, Vector3 } from 'three'

import { Engine } from '../../../ecs/classes/Engine'
import { addComponent, getComponent, hasComponent } from '../../../ecs/functions/ComponentFunctions'
import { createEntity } from '../../../ecs/functions/EntityFunctions'
import { addEntityNodeChild, createEntityNode } from '../../../ecs/functions/EntityTree'
import { createEngine } from '../../../initializeEngine'
import { Physics } from '../../../physics/classes/Physics'
import { setTransformComponent } from '../../../transform/components/TransformComponent'
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
    const node = createEntityNode(entity)
    const world = Engine.instance.currentWorld
    addEntityNodeChild(node, world.entityTree.rootNode)

    const quat = new Quaternion().random()
    const triggerRotation = new Euler().setFromQuaternion(quat, 'XYZ')

    const randomVector3 = new Vector3().random()

    addComponent(entity, NameComponent, { name: 'test-portal' })

    setTransformComponent(entity, randomVector3)

    const linkedPortalId = MathUtils.generateUUID()

    const sceneComponentData = {
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

    deserializePortal(entity, sceneComponentData)

    assert(hasComponent(entity, PortalComponent))

    // TODO: mesh only created on client
    const portalComponent = getComponent(entity, PortalComponent)
    assert.equal(portalComponent.location, 'test')
    assert.equal(portalComponent.linkedPortalId, linkedPortalId)
  })
})
