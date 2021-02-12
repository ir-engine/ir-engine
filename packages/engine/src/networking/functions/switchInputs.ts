import {getComponent, removeComponent, addComponent, hasComponent, removeEntity, getMutableComponent} from '../../ecs/functions/EntityFunctions';
import {Input} from '../../input/components/Input';
import {InputType} from '../../input/enums/InputType';
import {Network} from '../classes/Network';

import { PlayerInCar } from '@xr3ngine/engine/src/physics/components/PlayerInCar';
import { LifecycleValue } from '../../common/enums/LifecycleValue';
/**
 * Apply State received over the network to the client.
 * @param worldStateBuffer State of the world received over the network.
 * @param delta Time since last frame.
 */

export function clearFreezeInputs( clientInput ) {

  let clearId = null;
  if (hasComponent(Network.instance.networkObjects[clientInput.networkId].component.entity, PlayerInCar)) {
    clearId = clientInput.networkId;
  } else {
    clearId = clientInput.switchInputs;
  }

  const input = getMutableComponent(Network.instance.networkObjects[clearId].component.entity, Input);
  // Clear current data
  input.data.clear();
  // Apply LifecycleValue.ENDED
  for (let i = 0; i < clientInput.buttons.length; i++)
    input.data.set(clientInput.buttons[i].input,
      {
        type: InputType.BUTTON,
        value: clientInput.buttons[i].value,
        lifecycleState: LifecycleValue.ENDED
      });

  // Axis 1D input
  for (let i = 0; i < clientInput.axes1d.length; i++)
    input.data.set(clientInput.axes1d[i].input,
      {
        type: InputType.ONEDIM,
        value: clientInput.axes1d[i].value,
        lifecycleState: LifecycleValue.ENDED
      });

  // Axis 2D input
  for (let i = 0; i < clientInput.axes2d.length; i++)
    input.data.set(clientInput.axes2d[i].input,
      {
        type: InputType.TWODIM,
        value: clientInput.axes2d[i].value,
        lifecycleState: LifecycleValue.ENDED
      });
};

export function switchInputs( clientInput ) {
  //console.warn('test switchInputs');
  if (hasComponent(Network.instance.networkObjects[clientInput.networkId].component.entity, PlayerInCar)) {
    return getComponent(Network.instance.networkObjects[clientInput.networkId].component.entity, PlayerInCar).networkCarId;
  } else {
    return clientInput.networkId;
  }
};
