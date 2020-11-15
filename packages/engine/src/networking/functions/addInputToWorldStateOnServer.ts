import { Entity } from '../../ecs/classes/Entity';
import { Behavior } from '../../common/interfaces/Behavior';
import { Input } from '../../input/components/Input';
import { getComponent } from '../../ecs/functions/EntityFunctions';
import { NetworkObject } from '../components/NetworkObject';
import { InputType } from '../../input/enums/InputType';
import { Network } from '../components/Network';
import { LifecycleValue } from '../../common/enums/LifecycleValue';
import _ from 'lodash';

export const addInputToWorldStateOnServer: Behavior = (entity: Entity) => {
  const input = getComponent(entity, Input);
  const networkId = getComponent(entity, NetworkObject).networkId;
  
  // If there's no input, don't send the frame, unless the last frame had input
  if (input.data.size < 1 && _.isEqual(input.data, input.lastData))
    return

  // Create a schema for input to send
  const inputs = {
    networkId: networkId,
    buttons: {},
    axes1d: {},
    axes2d: {}
  };

  let numInputs;

  // Add all values in input component to schema
  input.data.forEach((value, key) => {
    switch (value.type) {
      case InputType.BUTTON:
        inputs.buttons[key] = { input: key, value: value.value, lifecycleState: value.lifecycleState };
        numInputs++;
        break;
      case InputType.ONEDIM:
        if (value.lifecycleState !== LifecycleValue.UNCHANGED) {
          inputs.axes1d[key] = { input: key, value: value.value, lifecycleState: value.lifecycleState };
          numInputs++;
        }
        break;
      case InputType.TWODIM:
        if (value.lifecycleState !== LifecycleValue.UNCHANGED) {
          inputs.axes2d[key] = { input: key, valueX: value.value[0], valueY: value.value[1], lifecycleState: value.lifecycleState };
          numInputs++;
        }
        break;
      default:
        console.error("Input type has no network handler (maybe we should add one?)");
    }
  })

  // Add inputs to world state
  Network.instance.worldState.inputs.push(inputs);
  console.log("Input data is")
  console.log(input.data)
  console.log("Inputs are")
  console.log(inputs);
};
