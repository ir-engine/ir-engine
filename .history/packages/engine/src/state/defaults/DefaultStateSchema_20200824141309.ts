import { decelerate } from '../../common/defaults/behaviors/decelerate';
import { jumping } from '../../common/defaults/behaviors/jump';
import { StateSchema, StateSchemaValue } from '../interfaces/StateSchema';
import { DefaultStateTypes } from './DefaultStateTypes';
import { initializeCharacterState, updateCharacterState } from '../../actor/classes/characters/character_states/CharacterStateBase';
import { CharacterComponent } from '../../actor/components/CharacterComponent';
import { Behavior } from '../../common/interfaces/Behavior';
import { getMutableComponent, getComponent } from '../../ecs/functions/EntityFunctions';
import { AnimationClip } from 'three';
import { setCameraRelativeOrientationTarget } from '../../actor/behaviors/CharacterMovementBehaviors';


export const DefaultStateGroups = {
  MOVEMENT: 0,
  MOVEMENT_MODIFIERS: 1
};



export const checkFalling: Behavior = (entity) =>
{
  const character = getComponent<CharacterComponent>(entity, CharacterComponent as any)
  if (!character.rayHasHit) console.log("Change state! Falling!")
  // old { character.setState(new Falling(character)); }
}

export const setCharacterAnimation: Behavior = (entity, args: { name: string, transitionDuration: number }) => {
  const character = getMutableComponent<CharacterComponent>(entity, CharacterComponent as any)

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
  
        character.currentAnimationLength = action.getClip().duration;
    }

    // Idle Behavior
    export const IdleState: StateSchemaValue = {
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
    }

    const WalkState: StateSchemaValue = {
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
      
    }

export const DefaultStateSchema: StateSchema = {
  groups: {
    [DefaultStateGroups.MOVEMENT]: {
      exclusive: true,
      default: DefaultStateTypes.IDLE,
      states: [DefaultStateTypes.IDLE, DefaultStateTypes.DROP_ROLLING, 
        DefaultStateTypes.DROP_RUNNING,
        DefaultStateTypes.FALLING,
        DefaultStateTypes.IDLE,
        DefaultStateTypes.WALK,
        DefaultStateTypes.IDLE_ROTATE_LEFT,
        DefaultStateTypes.IDLE_ROTATE_RIGHT,
        DefaultStateTypes.JUMP_IDLE,
        DefaultStateTypes.JUMP_RUNNING,
        DefaultStateTypes.SPRINT,
        DefaultStateTypes.WALK_END,
        DefaultStateTypes.WALK_START_BACK_LEFT,
        DefaultStateTypes.WALK_START_BACK_RIGHT,
        DefaultStateTypes.WALK_START_FORWARD,
        DefaultStateTypes.WALK_START_BACK_RIGHT,

      ]
    }
  },
  states: {
    [DefaultStateTypes.DROP_IDLE]: null,
    [DefaultStateTypes.DROP_ROLLING]: null,
    [DefaultStateTypes.DROP_RUNNING]: null,

    [DefaultStateTypes.FALLING]: null,
    
    [DefaultStateTypes.IDLE]: IdleState,

    [DefaultStateTypes.WALK]: WalkState,


    [DefaultStateTypes.IDLE_ROTATE_LEFT]: null,
    [DefaultStateTypes.IDLE_ROTATE_RIGHT]: null,

    [DefaultStateTypes.JUMP_IDLE]: null,
    [DefaultStateTypes.JUMP_RUNNING]: null,

    [DefaultStateTypes.SPRINT]: null

    [DefaultStateTypes.WALK_END]: null,

    [DefaultStateTypes.WALK_START_BACK_LEFT]: null
    [DefaultStateTypes.WALK_START_BACK_RIGHT]: null

    [DefaultStateTypes.WALK_START_FORWARD]: null
    [DefaultStateTypes.WALK_START_LEFT]: null
    [DefaultStateTypes.WALK_START_RIGHT]: null
  }
};
