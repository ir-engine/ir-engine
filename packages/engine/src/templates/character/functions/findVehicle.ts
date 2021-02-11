import { CharacterComponent } from '../components/CharacterComponent';
import { getComponent } from '../../../ecs/functions/EntityFunctions';
import { Behavior } from '@xr3ngine/engine/src/common/interfaces/Behavior';
import { Input } from '../../../input/components/Input';
import { BaseInput } from '@xr3ngine/engine/src/input/enums/BaseInput';

// TODO: outdated!? getInCar

export const findVehicle: Behavior = (entity) => {
  const character = getComponent(entity, CharacterComponent);
  const input = getComponent(entity, Input);

  if (character.canFindVehiclesToEnter && input.data.has(BaseInput.INTERACT)) {
    // findVehicleToEnter(entity, { wantsToDrive: true });
  }
  else if (character.canFindVehiclesToEnter && input.data.has(BaseInput.SECONDARY)) {
    // findVehicleToEnter(entity, { wantsToDrive: false });
  }
};
