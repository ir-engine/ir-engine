import { decelerate } from '../../common/defaults/behaviors/decelerate';
import { jumping } from '../../common/defaults/behaviors/jump';
import { StateSchema } from '../interfaces/StateSchema';
import { DefaultStateTypes } from './DefaultStateTypes';
import { CharacterComponent } from '../../actor/components/CharacterComponent';
import { Behavior } from '../../common/interfaces/Behavior';
import { getMutableComponent, getComponent } from '../../ecs/functions/EntityFunctions';
import { AnimationClip } from 'three';
import { IdleState } from './CharacterStates/IdleState';
import { WalkState } from './WalkState';
import { DropIdleState } from './CharacterStates/DropIdleState';
import { DropRollingState } from './CharacterStates/DropRollingState';
import { DropRunningState } from './CharacterStates/DropRunningState';
import { FallingState } from './CharacterStates/FallingState';
import { IdleRotateLeftState } from './CharacterStates/IdleRotateLeftState';
import { IdleRotateRightState } from './CharacterStates/IdleRotateRightState';
import { JumpIdleState } from './CharacterStates/JumpIdleState';
import { JumpRunningState } from './CharacterStates/JumpRunningState';
import { SprintState } from './CharacterStates/SprintState';
import { StartWalkForwardState } from './CharacterStates/StartWalkForwardState';
import { StartWalkLeftState } from './CharacterStates/StartWalkLeftState';
import { StartWalkRightState } from './CharacterStates/StartWalkRightState';
import { EndWalkState } from './CharacterStates/EndWalkState';
import { StartWalkBackRightState } from './CharacterStates/StartWalkBackRightState';
import { StartWalkBackLeftState } from './CharacterStates/StartWalkBackLeftState';


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

    export const CharacterStates = {
      [DefaultStateTypes.DROP_IDLE]: DropIdleState,
      [DefaultStateTypes.DROP_ROLLING]: DropRollingState,
      [DefaultStateTypes.DROP_RUNNING]: DropRunningState,
      [DefaultStateTypes.FALLING]: FallingState,
      [DefaultStateTypes.IDLE]: IdleState,
      [DefaultStateTypes.WALK]: WalkState,
      [DefaultStateTypes.IDLE_ROTATE_LEFT]: IdleRotateLeftState,
      [DefaultStateTypes.IDLE_ROTATE_RIGHT]: IdleRotateRightState,
      [DefaultStateTypes.JUMP_IDLE]: JumpIdleState,
      [DefaultStateTypes.JUMP_RUNNING]: JumpRunningState,
      [DefaultStateTypes.SPRINT]: SprintState,
      [DefaultStateTypes.WALK_END]: EndWalkState,
      [DefaultStateTypes.WALK_START_BACK_LEFT]: StartWalkBackLeftState,
      [DefaultStateTypes.WALK_START_BACK_RIGHT]: StartWalkBackRightState,
      [DefaultStateTypes.WALK_START_FORWARD]: StartWalkForwardState,
      [DefaultStateTypes.WALK_START_LEFT]: StartWalkLeftState,
      [DefaultStateTypes.WALK_START_RIGHT]: StartWalkRightState
    }

export const DefaultStateSchema: StateSchema = {
  groups: {
    // We explicitly list all states in the group so they can override each other
    [DefaultStateGroups.MOVEMENT]: {
      exclusive: true,
      default: DefaultStateTypes.IDLE,
      states: Object.keys(CharacterStates)
    }
  },
  states: CharacterStates
};
