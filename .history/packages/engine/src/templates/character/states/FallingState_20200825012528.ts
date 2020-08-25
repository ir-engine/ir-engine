import { StateSchemaValue } from '../../interfaces/StateSchema';
import { initializeCharacterState, updateCharacterState } from '../behaviors/CharacterBaseBehaviors';
import { CharacterComponent } from '../../../actor/components/CharacterComponent';
import { DefaultStateGroups, setCharacterAnimation, checkFalling } from '../CharacterStateSchema';
// Idle Behavior

export const FallingState: StateSchemaValue = {
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
      behavior: setCharacterAnimation,
      args: {
        name: 'idle',
        transitionDuration: 0.1
      }
    }
  ],
  onUpdate: [{ behavior: updateCharacterState }, { behavior: checkFalling }]
};
