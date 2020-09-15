import { CharacterComponent } from '../components/CharacterComponent';
import { getComponent } from '../../../ecs/functions/EntityFunctions';
import { Behavior } from '../../../common/interfaces/Behavior';
import { Input } from '../../../input/components/Input';
import { DefaultInput } from '../../shared/DefaultInput';

// TODO: outdated!? getInCar

export const findVehicle: Behavior = (entity) => {
  const character = getComponent(entity, CharacterComponent);
  const input = getComponent(entity, Input);

  if (character.canFindVehiclesToEnter && input.data.has(DefaultInput.INTERACT)) {
    // findVehicleToEnter(entity, { wantsToDrive: true });
  }
  else if (character.canFindVehiclesToEnter && input.data.has(DefaultInput.SECONDARY)) {
    // findVehicleToEnter(entity, { wantsToDrive: false });
  }
};
