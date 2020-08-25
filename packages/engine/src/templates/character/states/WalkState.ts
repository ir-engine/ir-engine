import { StateSchemaValue } from '../interfaces/StateSchema';
import { DefaultStateTypes } from './DefaultStateTypes';
import { initializeCharacterState, updateCharacterState } from '../../actor/classes/characters/character_states/CharacterStateBase';
import { CharacterComponent } from '../../actor/components/CharacterComponent';
import { setCameraRelativeOrientationTarget } from '../../actor/behaviors/CharacterMovementBehaviors';
import { DefaultStateGroups, setCharacterAnimation, checkFalling } from './DefaultStateSchema';

export const WalkState: StateSchemaValue = {
  group: DefaultStateGroups.MOVEMENT,
  componentProperties: {
    component: CharacterComponent,
    properties: {
      ['timer']: 0,
      ['velocitySimulator.damping']: 0.6,
      ['velocitySimulator.mass']: 10,
      ['velocityTarget']: { x: 0, y: 0, z: 0 },
      ['canFindVehiclesToEnter']: true,
      ['canEnterVehicles']: true,
      ['canLeaveVehicles']: false
    }
  },
  onEntry: [
    {
      behavior: initializeCharacterState
    },
    {
      from: DefaultStateTypes.IDLE,
      behavior: setCharacterAnimation,
      args: {
        name: 'run',
        transitionDuration: 0.1
      }
    }
  ],
  onUpdate: [{ behavior: updateCharacterState }, { behavior: setCameraRelativeOrientationTarget }, { behavior: checkFalling }],
};
