import { Behavior } from '../../common/interfaces/Behavior';
import { Entity } from '../../ecs/classes/Entity';
import { getComponent, getMutableComponent } from '../../ecs/functions/EntityFunctions';
import { Network } from '../components/Network';
import { addSnapshot, calculateInterpolation } from '../functions/NetworkInterpolationFunctions';
import { worldStateModel } from '../schema/worldStateSchema';
import { TransformComponent } from '../../transform/components/TransformComponent';
import { Input } from '../../input/components/Input';
import { handleInput } from '../../input/behaviors/handleInput';
import { InputType } from '../../input/enums/InputType';

export const handleUpdateFromServer: Behavior = (entity: Entity, args: null, delta) => {
  const queue = getComponent(entity, Network).incomingMessageQueue
  // For each message, handle and process
  while (!queue.empty) {
    const message = queue.pop()
    // Buffer to object
    const worldState = worldStateModel.fromBuffer(message)
    // Add world state to our snapshot vault
    addSnapshot(worldState)
    // Interpolate it
    const { state } = calculateInterpolation('x y z q(quat)', 'transforms')
    console.log("Adding network transforms to Network.instance")
    Network.instance.worldState = worldState
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

    // TODO: A lot of this logic can be combined with handleInputFromClient
    Network.instance.worldState.inputs.forEach(stateData => {

      // Get network object with networkId
      const networkComponent = Network.instance.networkObjects[stateData.networkId].component
      // Get input object attached
      const input = getComponent(networkComponent.entity, Input)

      // Clear current data
      input.data.clear()

      // Apply new input
      for (const button in stateData.buttons) {
        input.data.set(stateData.buttons[button].input,
          {
            type: InputType.BUTTON,
            value: stateData.buttons[button].value,
            lifecycleState: stateData.buttons[button].lifeCycleState
          })
      }

      // Axis 1D input
      for (const axis in stateData.axes1d) {
        input.data.set(stateData.axes1d[axis].input,
          {
            type: InputType.BUTTON,
            value: stateData.axes1d[axis].value,
            lifecycleState: stateData.axes1d[axis].lifeCycleState
          })
      }

      // Axis 2D input
      for (const axis in stateData.axes2d) {
        input.data.set(stateData.axes2d[axis].input,
          {
            type: InputType.BUTTON,
            value: stateData.axes2d[axis].value,
            lifecycleState: stateData.axes2d[axis].lifeCycleState
          })
      }

      // Call behaviors on map
      handleInput(networkComponent.entity, {}, delta)
    })
  }
}