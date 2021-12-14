import { Engine } from '../../../src/ecs/classes/Engine'
import assert, { strictEqual } from 'assert'
import { Network } from '../../../src/networking/classes/Network'
import OutgoingNetworkSystem, { queueEntityTransform, queueUnchangedPosesClient, queueUnchangedPosesServer } from '../../../src/networking/systems/OutgoingNetworkSystem'
import { createWorld } from '../../../src/ecs/classes/World'
import { UserId } from '@xrengine/common/src/interfaces/UserId'
import { WorldStateModel } from '../../../src/networking/schema/networkSchema'
import { createEntity } from '../../../src/ecs/functions/EntityFunctions'
import { addComponent } from '../../../src/ecs/functions/ComponentFunctions'
import { TransformComponent } from '../../../src/transform/components/TransformComponent'
import { Quaternion, Vector3 } from 'three'
import { NetworkObjectComponent } from '../../../src/networking/components/NetworkObjectComponent'
import { NetworkId } from '@xrengine/common/src/interfaces/NetworkId'
import { TestNetwork } from '../TestNetwork'
import { NetworkObjectOwnedTag } from '../../../src/networking/components/NetworkObjectOwnedTag'

describe('OutgoingNetworkSystem Unit Tests', () => {
  
  describe('queueUnchangedPosesServer', () => {
    it('should queue all state changes on server', () => {
      
      /* mock */
      const world = createWorld()
      Engine.currentWorld = world

      world.outgoingNetworkState = {
        tick: 0,
        time: Date.now(),
        pose: [],
        controllerPose: [],
        handsPose: []
      }

      // make this engine user the host (world.isHosting === true)
      Engine.userId = world.hostId

      for (let i = 0; i < 2; i++) {
        const entity = createEntity()
        const transform = addComponent(entity, TransformComponent, {
          position: new Vector3(1,2,3),
          rotation: new Quaternion(),
          scale: new Vector3(),
        })
        const networkObject = addComponent(entity, NetworkObjectComponent, {
          // remote owner
          ownerId: '1' as UserId,
          networkId: 0 as NetworkId,
          prefab: '',
          parameters: {},
        })
      }

      /* run */
      queueUnchangedPosesServer(world)

      /* assert */
      // verify all poses were queued
      const { outgoingNetworkState } = world
      strictEqual(outgoingNetworkState.pose.length, 2)
    })
  })

  describe('queueUnchangedPosesClient', () => {
    it('should queue only client avatar state changes on client', () => {
      
      /* mock */
      const world = createWorld()
      Engine.currentWorld = world

      world.outgoingNetworkState = {
        tick: 0,
        time: Date.now(),
        pose: [],
        controllerPose: [],
        handsPose: []
      }

      for (let i = 0; i < 8; i++) {
        const entity = createEntity()

        // make every other entity owned by this instance
        if (i % 2) {
          const ownedNetworkTag = addComponent(entity, NetworkObjectOwnedTag, {})
        }

        const transform = addComponent(entity, TransformComponent, {
          position: new Vector3(1,2,3),
          rotation: new Quaternion(),
          scale: new Vector3(),
        })
        const networkObject = addComponent(entity, NetworkObjectComponent, {
          // remote owner
          ownerId: i as unknown as UserId,
          networkId: i as NetworkId,
          prefab: '',
          parameters: {},
        })
      }


      /* run */
      queueUnchangedPosesClient(world)

      /* assert */
      // verify only every odd entity pose was queued
      const { outgoingNetworkState } = world
      strictEqual(outgoingNetworkState.pose.length, 4)
      strictEqual(outgoingNetworkState.pose[0].networkId, 1)
      strictEqual(outgoingNetworkState.pose[1].networkId, 3)
      strictEqual(outgoingNetworkState.pose[2].networkId, 5)
      strictEqual(outgoingNetworkState.pose[3].networkId, 7)
    })
  })

  describe('queueEntityTransform', () => {

    it('should queue entities with network & transform components', () => {
      
      /* mock */
      const world = createWorld()
      Engine.currentWorld = world

      world.outgoingNetworkState = {
        tick: 0,
        time: Date.now(),
        pose: [],
        controllerPose: [],
        handsPose: []
      }
      
      const entity = createEntity()

      const transform = addComponent(entity, TransformComponent, {
        position: new Vector3(1,2,3),
        rotation: new Quaternion(),
        scale: new Vector3(),
      })
      const networkObject = addComponent(entity, NetworkObjectComponent, {
        ownerId: '0' as UserId,
        networkId: 0 as NetworkId,
        prefab: '',
        parameters: {},
      })
      
      /* run */
      queueEntityTransform(world, entity)

      /* assert */
      // verify only 1 client pose was queued
      const { outgoingNetworkState } = world
      strictEqual(outgoingNetworkState.pose.length, 1)

    })

    it('should NOT queue entities without network & transform components', () => {
      
      /* mock */
      const world = createWorld()
      Engine.currentWorld = world

      world.outgoingNetworkState = {
        tick: 0,
        time: Date.now(),
        pose: [],
        controllerPose: [],
        handsPose: []
      }
      
      const entity = createEntity()

      const transform = addComponent(entity, TransformComponent, {
        position: new Vector3(1,2,3),
        rotation: new Quaternion(),
        scale: new Vector3(),
      })
      
      /* run */
      queueEntityTransform(world, entity)

      /* assert */
      // verify 0 client poses were queued
      const { outgoingNetworkState } = world
      strictEqual(outgoingNetworkState.pose.length, 0)

    })
  })
})

describe('OutgoingNetworkSystem Integration Tests', async () => {
	
  let world

	beforeEach(() => {
    /* hoist */
		Network.instance = new TestNetwork()
		world = createWorld()
		Engine.currentWorld = world
	})

  it('should serialize and send poses', async () => {
    /* mock */
    // make this engine user the host (world.isHosting === true)
    Engine.userId = world.hostId
    Engine.hasJoinedWorld = true

		const entity = createEntity()
		const transform = addComponent(entity, TransformComponent, {
			position: new Vector3(1,2,3),
			rotation: new Quaternion(),
			scale: new Vector3(),
		})
		const networkObject = addComponent(entity, NetworkObjectComponent, {
      // the host is the owner
			ownerId: Engine.userId as UserId,
			networkId: 0 as NetworkId,
			prefab: '',
			parameters: {},
		})

    /* run */
    // todo: passing world into the constructor makes the system stateful
    // ideally we want stateless systems
    const outgoingNetworkSystem = await OutgoingNetworkSystem(world)

    outgoingNetworkSystem()

    /* assert */
    const datum = (Network.instance as TestNetwork).transport.getSentData()
    strictEqual(datum.length, 1)

    const data0 = WorldStateModel.fromBuffer(datum[0])
    strictEqual(data0.pose[0].position[0], 1)
    strictEqual(data0.pose[0].position[1], 2)
    strictEqual(data0.pose[0].position[2], 3)
  })

})