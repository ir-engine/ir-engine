import { CharacterComponent } from '../../../actor/components/CharacterComponent';
import { Behavior } from '../../../common/interfaces/Behavior';
import { getMutableComponent } from '../../../ecs/functions/EntityFunctions';

export const initializeCharacterState: Behavior = (entity): void => {
  const character = getMutableComponent<CharacterComponent>(entity, CharacterComponent);
  character.velocitySimulator.damping = character.defaultVelocitySimulatorDamping;
  character.velocitySimulator.mass = character.defaultVelocitySimulatorMass;

  character.rotationSimulator.damping = character.defaultRotationSimulatorDamping;
  character.rotationSimulator.mass = character.defaultRotationSimulatorMass;

  character.arcadeVelocityIsAdditive = false;
  character.arcadeVelocityInfluence.set(1, 0, 1);

  character.canFindVehiclesToEnter = true;
  character.canEnterVehicles = false;
  character.canLeaveVehicles = true;

  character.timer = 0;
};
