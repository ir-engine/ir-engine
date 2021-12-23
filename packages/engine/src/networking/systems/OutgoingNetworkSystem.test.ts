import assert, { strictEqual } from 'assert'
import { Engine } from '../../../src/ecs/classes/Engine'
import { queueEntityTransform, queueUnchangedPosesClient, queueUnchangedPosesServer, resetNetworkState } from '../../../src/networking/systems/OutgoingNetworkSystem'
import { createWorld } from '../../../src/ecs/classes/World'
import { UserId } from '@xrengine/common/src/interfaces/UserId'
import { createEntity } from '../../../src/ecs/functions/EntityFunctions'
import { addComponent } from '../../../src/ecs/functions/ComponentFunctions'
import { TransformComponent } from '../../../src/transform/components/TransformComponent'
import { Quaternion, Vector3 } from 'three'
import { NetworkObjectComponent } from '../../../src/networking/components/NetworkObjectComponent'
import { NetworkId } from '@xrengine/common/src/interfaces/NetworkId'
import { NetworkObjectOwnedTag } from '../../../src/networking/components/NetworkObjectOwnedTag'
import { worldToModel } from '../../ikrig/functions/IKFunctions'
import { WorldStateModel } from '../schema/networkSchema'
import { Network } from '../classes/Network'
import { deepEqual } from '../../common/functions/deepEqual'

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

describe('outgoingNetworkState', () => {


  it('should resetNetworkState', () => {
      
    /* mock */
    const world = createWorld()
    Engine.currentWorld = world

    strictEqual(world.fixedTick >= 0, true)
    world.fixedTick = 42

    const state = world.outgoingNetworkState = {
      tick: 0,
      time: Date.now(),
      pose: [{
        ownerId: 'id' as UserId,
        networkId: 100 as NetworkId,
        position: [1,2,3],
        rotation: [1,2,3,4],
        linearVelocity: [0],
        angularVelocity: [0]
      }],
      controllerPose: [{} as any],
      handsPose: [{} as any]
    }

    resetNetworkState(world)

    strictEqual(state.tick, 42)
    strictEqual(state.pose.length, 0)
    strictEqual(state.controllerPose.length, 0)
    strictEqual(state.handsPose.length, 0)
    
  })

  it('should serialize and deserialize correctly', () => {
      
    /* mock */
    const world = createWorld()
    Engine.currentWorld = world

    const now = Date.now()
    world.outgoingNetworkState = {
      tick: 42,
      time: now,
      pose: [{
        ownerId: 'id' as UserId,
        networkId: 100 as NetworkId,
        position: [1,2,3],
        rotation: [1,2,3,4],
        linearVelocity: [0],
        angularVelocity: [0]
      }],
      controllerPose: [{} as any],
      handsPose: [{} as any]
    }
    
    const buffer = WorldStateModel.toBuffer(world.outgoingNetworkState)
    const state = WorldStateModel.fromBuffer(buffer)

    strictEqual(state.tick, 42)
    strictEqual(state.time, now)
    strictEqual(state.pose[0].ownerId, 'id')
    strictEqual(state.pose[0].networkId, 100)
    deepEqual(state.pose[0].position, [1,2,3])
    deepEqual(state.pose[0].rotation, [1,2,3,4])
    strictEqual(state.pose[0].networkId, 100)
    strictEqual(world.outgoingNetworkState.pose.length, 0)
    
  })


})