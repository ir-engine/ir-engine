import { Entity } from '../../ecs/classes/Entity';
import { Behavior } from '../../common/interfaces/Behavior';
import { Input } from '../../input/components/Input';
import { getComponent } from '../../ecs/functions/EntityFunctions';
import { NetworkObject } from '../components/NetworkObject';
import { InputType } from '../../input/enums/InputType';
import { Network } from '../components/Network';
import { LifecycleValue } from '../../common/enums/LifecycleValue';

export const addInputToWorldState: Behavior = (entity: Entity) => {
  // Get all input receivers
  const input = getComponent(entity, Input);

  // If there's no input, don't send the frame
  if (input.data.size < 1) return;

  const networkId = getComponent(entity, NetworkObject).networkId;

  // Create a schema for input to send
  const inputs = {
    networkId: networkId,
    buttons: {},
    axes1d: {},
    axes2d: {}
  };

  let numInputs;

  // Add all values in input component to schema
  for (const key in input.data.keys()) {
    switch (input.data.keys[key].type) {
      case InputType.BUTTON:
        inputs.buttons[key] = { input: key, value: input.data.keys[key].value, lifecycleState: input.data.keys[key].lifecycleState };
        numInputs++;
        break;
      case InputType.ONEDIM:
        if (input.data.keys[key].lifecycleState !== LifecycleValue.UNCHANGED) {
          inputs.axes1d[key] = { input: key, value: input.data.keys[key].value, lifecycleState: input.data.keys[key].lifecycleState };
          numInputs++;
        }
        break;
      case InputType.TWODIM:
        if (input.data.keys[key].lifecycleState !== LifecycleValue.UNCHANGED) {
          inputs.axes2d[key] = { input: key, valueX: input.data.keys[key].value[0], valueY: input.data.keys[key].value[1], lifecycleState: input.data.keys[key].lifecycleState };
          numInputs++;
        }
        break;
      default:
        console.error("Input type has no network handler (maybe we should add one?)");
    }
  }

  // Add inputs to world state
  Network.instance.worldState.inputs.push(inputs);
};
