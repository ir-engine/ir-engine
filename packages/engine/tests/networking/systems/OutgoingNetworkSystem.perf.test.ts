import { Engine } from '../../../src/ecs/classes/Engine'
import assert, { strictEqual } from 'assert'
import { Network } from '../../../src/networking/classes/Network'
import OutgoingNetworkSystem from '../../../src/networking/systems/OutgoingNetworkSystem'
import { createWorld, World } from '../../../src/ecs/classes/World'
import { UserId } from '@xrengine/common/src/interfaces/UserId'
import { createEntity } from '../../../src/ecs/functions/EntityFunctions'
import { addComponent } from '../../../src/ecs/functions/ComponentFunctions'
import { TransformComponent } from '../../../src/transform/components/TransformComponent'
import { Quaternion, Vector3 } from 'three'
import { NetworkObjectComponent } from '../../../src/networking/components/NetworkObjectComponent'
import { NetworkId } from '@xrengine/common/src/interfaces/NetworkId'
import { TestNetwork } from '../TestNetwork'

const Timer = () => {
  const time = {
    then: performance.now(),
    now: performance.now(),
    delta: 0,
    elapsed: 0,
    ticks: 0,
    tick: () => {
      time.now = performance.now()
      time.delta = time.now - time.then
      time.elapsed += time.delta
      time.then = time.now
      time.ticks++
    },
    avg: () => time.elapsed / time.ticks
  }

  return time
}

describe.skip('OutgoingNetworkSystem Performance Tests', async () => {
	
  let world

	beforeEach(() => {
    /* hoist */
		Network.instance = new TestNetwork()
		world = createWorld()
		Engine.currentWorld = world
	})

  it('should serialize 500 entity positions in < 1.2 millisecond on average', async () => {

    /* mock */
    // make this engine user the host (world.isHosting === true)
    Engine.userId = world.hostId

    const
      ents = 500,
      ticks = 100

    for (let i = 0; i < ents; i++) {
      const entity = createEntity()
      addComponent(entity, TransformComponent, {
        position: new Vector3(1,2,3),
        rotation: new Quaternion(),
        scale: new Vector3(),
      })
      addComponent(entity, NetworkObjectComponent, {
        ownerId: i as unknown as UserId,
        ownerIndex: i,
        networkId: 0 as NetworkId,
        prefab: '',
        parameters: {},
      })
    }

    /* run */

    const outgoingNetworkSystem = await OutgoingNetworkSystem(world)

    // give turbofan some iterations to optimize
    outgoingNetworkSystem()
    outgoingNetworkSystem()
    outgoingNetworkSystem()

    const timer = Timer()
  
    for (let i = 0; i < ticks; i++) {
      outgoingNetworkSystem()
      timer.tick()
    }

    const avg = timer.avg()

    /* assert */
    assert(avg < 1.2, `${avg}`)

  })

})