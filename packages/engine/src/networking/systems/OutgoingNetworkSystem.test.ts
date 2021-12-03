import assert, { strictEqual } from 'assert'
import { Engine } from '../../../src/ecs/classes/Engine'
import { forwardIncomingActionsFromOthersIfHost, queueAllOutgoingPoses, queueEntityTransform, queueUnchangedPosesClient, queueUnchangedPosesServer, rerouteActions, rerouteOutgoingActionsBoundForSelf } from '../../../src/networking/systems/OutgoingNetworkSystem'
import { createWorld } from '../../../src/ecs/classes/World'
import { ActionRecipients } from '../../../src/networking/interfaces/Action'
import { UserId } from '@xrengine/common/src/interfaces/UserId'
import { NetworkWorldAction } from '../../../src/networking/functions/NetworkWorldAction'
import { createEntity } from '../../../src/ecs/functions/EntityFunctions'
import { addComponent } from '../../../src/ecs/functions/ComponentFunctions'
import { TransformComponent } from '../../../src/transform/components/TransformComponent'
import { Quaternion, Vector3 } from 'three'
import { NetworkObjectComponent } from '../../../src/networking/components/NetworkObjectComponent'
import { NetworkId } from '@xrengine/common/src/interfaces/NetworkId'
import { NetworkObjectOwnedTag } from '../../../src/networking/components/NetworkObjectOwnedTag'

describe('OutgoingNetworkSystem Unit Tests', () => {

  describe('forwardIncomingActionsFromOthersIfHost', () => {
  
    it('should forward incoming actions if the action is from a remote userId', () => {
      /* mock */
      const world = createWorld()

      // make this engine user the host
      // world.isHosting === true
      Engine.userId = world.hostId

      const action = NetworkWorldAction.spawnObject({
        userId: '0' as UserId,
        prefab: '',
        parameters: {},
        $tick: 0,
        // make action come from another user
        $from: '2' as UserId,
        // being sent to this server
        $to: 'server' as ActionRecipients,
      })
      
      world.incomingActions.add(action)

      /* run */
      forwardIncomingActionsFromOthersIfHost(world)

      /* assert */
      // verify incoming action was removed from incomingActions
      strictEqual(world.incomingActions.has(action), false)
      // and added to outgoingActions
      strictEqual(world.outgoingActions.has(action), true)
    })

    it('should clear incomingActions if hosting', () => {
      /* mock */
      const world = createWorld()

      // make this engine user the host
      // world.isHosting === true
      Engine.userId = world.hostId

      const action = NetworkWorldAction.spawnObject({
        userId: '2' as UserId,
        prefab: '',
        parameters: {},
        $tick: 0,
        // make action come from another user
        $from: '2' as UserId,
        // being sent to this server
        $to: 'server' as ActionRecipients,
      })
      
      world.incomingActions.add(action)

      /* run */
      forwardIncomingActionsFromOthersIfHost(world)

      /* assert */

      // verify incomingActions are cleared if we ARE a host
      strictEqual(world.incomingActions.size, 0)
    })

    it('should clear incomingActions if not hosting', () => {
      /* mock */
      const world = createWorld()

      // this engine user is not the host
      // world.isHosting === false
      Engine.userId = '0' as UserId

      const tick = 0

      world.fixedTick = tick

      const action = NetworkWorldAction.spawnObject({
        userId: '2' as UserId,
        prefab: '',
        parameters: {},
        $tick: tick,
        // make action come from another user
        $from: '2' as UserId,
        // being sent to this server
        $to: 'server' as ActionRecipients,
      })
      
      world.incomingActions.add(action)

      /* run */
      forwardIncomingActionsFromOthersIfHost(world)

      /* assert */

      // verify incomingActions are cleared if we are NOT a host
      strictEqual(world.incomingActions.size, 0)
    })

  })

  describe('rerouteOutgoingActionsBoundForSelf', () => {

    it('should reroute outgoing actions from this host back to itself (loopback)', () => {

      /* mock */
      const world = createWorld()

      const action = NetworkWorldAction.spawnObject({
        userId: '0' as UserId,
        prefab: '',
        parameters: {},
        $tick: 0,
        // make action come from this host
        $from: Engine.userId,
        // being sent to self
        $to: 'local' as ActionRecipients,
      })
      
      world.outgoingActions.add(action)

      /* run */
      rerouteOutgoingActionsBoundForSelf(world)

      /* assert */
      // verify incoming action was removed from outgoingActions
      strictEqual(world.outgoingActions.has(action), false)
      // and added to incomingActions
      strictEqual(world.incomingActions.has(action), true)

    })

    it('should apply outgoing actions to self and others if hosting and action is from this host', () => {

      /* mock */
      const world = createWorld()

      // make this engine user the host
      // world.isHosting === true
      Engine.userId = world.hostId

      const action = NetworkWorldAction.spawnObject({
        userId: '0' as UserId,
        prefab: '',
        parameters: {},
        $tick: 0,
        // make action come from this host
        $from: Engine.userId,
        // being sent to other
        $to: '1' as ActionRecipients,
      })
      
      world.outgoingActions.add(action)

      /* run */
      rerouteOutgoingActionsBoundForSelf(world)

      /* assert */
      // verify incoming action was NOT removed from outgoingActions (applies action to other clients)
      strictEqual(world.outgoingActions.has(action), true)
      // and added to incomingActions (applies action to self)
      strictEqual(world.incomingActions.has(action), true)

    })

  })

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
          userId: '1' as UserId,
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
          userId: i as unknown as UserId,
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
        userId: '0' as UserId,
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
