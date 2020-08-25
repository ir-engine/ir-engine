import { decelerate } from '../../common/defaults/behaviors/decelerate';
import { jumping } from '../../common/defaults/behaviors/jump';
import { StateSchema } from '../interfaces/StateSchema';
import { DefaultStateTypes } from './DefaultStateTypes';
import { initializeCharacterState, updateCharacterState } from '../../actor/classes/characters/character_states/CharacterStateBase';
import { CharacterComponent } from '../../actor/components/CharacterComponent';
import { Behavior } from '../../common/interfaces/Behavior';
import { getMutableComponent } from '../../ecs/functions/EntityFunctions';
import { AnimationClip } from 'three';

export const checkFalling: Behavior = (entity) =>
{
  const character = getMutableComponent<CharacterComponent>(entity, CharacterComponent as any)
  if (!character.rayHasHit) console.log("Change state! Falling!")
  // old { character.setState(new Falling(character)); }
  
}

export const setCharacterAnimation: Behavior = (entity, args: { name: string, transitionDuration: number }) => {
  const character = getMutableComponent<CharacterComponent>(entity, CharacterComponent as any)
  
        // gltf
        let clip = AnimationClip.findByName( character.animations, args.name );
  
        let action = character.mixer.clipAction(clip);
        if (action === null)
        {
          console.error(`Animation ${args.name} not found!`);
          return 0;
        }
  
        character.mixer.stopAllAction();
        action.fadeIn(args.transitionDuration);
        action.play();
  
        return action.getClip().duration;
    }

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
      onAdded: [
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
