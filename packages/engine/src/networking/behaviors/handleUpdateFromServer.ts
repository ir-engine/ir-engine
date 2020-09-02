import { Behavior } from '../../common/interfaces/Behavior';
import { Entity } from '../../ecs/classes/Entity';
import { getComponent, getMutableComponent } from '../../ecs/functions/EntityFunctions';
import { Network } from '../components/Network';
import { addSnapshot, calculateInterpolation } from '../functions/NetworkInterpolationFunctions';
import { worldStateModel } from '../schema/worldStateSchema';
import { TransformComponent } from '../../transform/components/TransformComponent';

// TODO: Could be optimized
export const handleUpdateFromServer: Behavior = (entity: Entity) => {
  const queue = getComponent(entity, Network).incomingMessageQueue
  // For each message, handle and process
  while(!queue.empty){
    const message = queue.pop()
    // Buffer to object
    const worldState = worldStateModel.fromBuffer(message)
    // Add world state to our snapshot vault
    addSnapshot(worldState)
    // Interpolate it
    const { state } = calculateInterpolation('x y z q(quat)', 'transforms')
    console.log("Adding network transforms to Network.instance")
    Network.instance.worldState.transforms = state

  // Update transforms
  Network.instance.worldState.transforms.forEach(transformData => {
    // Get network component from data
    const networkComponent = Network.instance.networkObjects[transformData.networkId].component
    const transform = getMutableComponent(networkComponent.entity, TransformComponent)
    // Apply pos to object
    transform.position.set(
      transformData.x,
      transformData.y,
      transformData.z
    )
    // Apply rot to object
    transform.rotation.set(
      transformData.q.x,
      transformData.q.y,
      transformData.q.z,
      transformData.q.w
    )
    console.log("Updated transform on ", transformData.networkId)
  })
  
  //  TODO: Update input and state

    Network.instance.worldState.states.forEach(stateData => {

    })

      // Get state
    // Get network object
    // Get state from snapshot with object ID
    // If state is same as before, ignore (but that would be weird if it's getting sent) -- might be getting checked in addState already
  }
