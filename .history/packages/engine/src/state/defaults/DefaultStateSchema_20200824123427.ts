import { decelerate } from '../../common/defaults/behaviors/decelerate';
import { jumping } from '../../common/defaults/behaviors/jump';
import { StateSchema } from '../interfaces/StateSchema';
import { DefaultStateTypes } from './DefaultStateTypes';
import { initializeCharacterState, updateCharacterState } from '../../actor/classes/characters/character_states/CharacterStateBase';

export const DefaultStateGroups = {
  MOVEMENT: 0,
  MOVEMENT_MODIFIERS: 1
};

export const DefaultStateSchema: StateSchema = {
  groups: {
    [DefaultStateGroups.MOVEMENT]: {
      exclusive: true,
      default: DefaultStateTypes.IDLE,
      states: [DefaultStateTypes.IDLE, DefaultStateTypes.MOVING]
    },
    [DefaultStateGroups.MOVEMENT_MODIFIERS]: {
      exclusive: true,
      states: [DefaultStateTypes.CROUCHING, DefaultStateTypes.SPRINTING, DefaultStateTypes.JUMPING]
    }
  },
  states: {
    [DefaultStateTypes.IDLE]: {
      group: DefaultStateGroups.MOVEMENT,

      animation: {
        name: 'idle',
        transitionDuration: 0.1
      },
      componentProperties: {
        component: CharacterComponent,
        properties: {
          velocitySimulator.damping: 0.6;
		      velocitySimulator.mass: 10;
          character.setArcadeVelocityTarget(0),
          canFindVehiclesToEnter: true,
          canEnterVehicles: true,
           canLeaveVehicles: false,
        }
      }
      onAdded: [{ behavior: initializeCharacterState }],
       onUpdate: [{ behavior: updateCharacterState }]
    },
    [DefaultStateTypes.MOVING]: {
      group: DefaultStateGroups.MOVEMENT
    },
    [DefaultStateTypes.JUMPING]: { group: DefaultStateGroups.MOVEMENT_MODIFIERS, onUpdate: { behavior: jumping } },
    [DefaultStateTypes.CROUCHING]: {
      group: DefaultStateGroups.MOVEMENT_MODIFIERS,
      blockedBy: DefaultStateTypes.JUMPING
    },
    [DefaultStateTypes.SPRINTING]: { group: DefaultStateGroups.MOVEMENT_MODIFIERS }
  }
};
