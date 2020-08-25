import { StateSchema } from '../../state/interfaces/StateSchema';
import { CharacterStateTypes } from './CharacterStateTypes';
import { CharacterComponent } from '../../character/components/CharacterComponent';
import { Behavior } from '../../common/interfaces/Behavior';
import { getMutableComponent, getComponent } from '../../ecs/functions/EntityFunctions';
import { AnimationClip } from 'three';
import { IdleState } from './states/IdleState';
import { WalkState } from './states/WalkState';
import { DropIdleState } from './states/DropIdleState';
import { DropRollingState } from './states/DropRollingState';
import { DropRunningState } from './states/DropRunningState';
import { FallingState } from './states/FallingState';
import { IdleRotateLeftState } from './states/IdleRotateLeftState';
import { IdleRotateRightState } from './states/IdleRotateRightState';
import { JumpIdleState } from './states/JumpIdleState';
import { JumpRunningState } from './states/JumpRunningState';
import { SprintState } from './states/SprintState';
import { StartWalkForwardState } from './states/StartWalkForwardState';
import { StartWalkLeftState } from './states/StartWalkLeftState';
import { StartWalkRightState } from './states/StartWalkRightState';
import { EndWalkState } from './states/EndWalkState';
import { StartWalkBackRightState } from './states/StartWalkBackRightState';
import { StartWalkBackLeftState } from './states/StartWalkBackLeftState';
import { CharacterStateGroups } from './CharacterStateGroups';
import { addState } from '../../state/behaviors/StateBehaviors';

export const checkFalling: Behavior = (entity) =>
{
  const character = getComponent<CharacterComponent>(entity, CharacterComponent as any)
  if (!character.rayHasHit) addState(entity, { state: FallingState })
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
      [CharacterStateTypes.DROP_IDLE]: DropIdleState,
      [CharacterStateTypes.DROP_ROLLING]: DropRollingState,
      [CharacterStateTypes.DROP_RUNNING]: DropRunningState,
      [CharacterStateTypes.FALLING]: FallingState,
      [CharacterStateTypes.IDLE]: IdleState,
      [CharacterStateTypes.WALK]: WalkState,
      [CharacterStateTypes.IDLE_ROTATE_LEFT]: IdleRotateLeftState,
      [CharacterStateTypes.IDLE_ROTATE_RIGHT]: IdleRotateRightState,
      [CharacterStateTypes.JUMP_IDLE]: JumpIdleState,
      [CharacterStateTypes.JUMP_RUNNING]: JumpRunningState,
      [CharacterStateTypes.SPRINT]: SprintState,
      [CharacterStateTypes.WALK_END]: EndWalkState,
      [CharacterStateTypes.WALK_START_BACK_LEFT]: StartWalkBackLeftState,
      [CharacterStateTypes.WALK_START_BACK_RIGHT]: StartWalkBackRightState,
      [CharacterStateTypes.WALK_START_FORWARD]: StartWalkForwardState,
      [CharacterStateTypes.WALK_START_LEFT]: StartWalkLeftState,
      [CharacterStateTypes.WALK_START_RIGHT]: StartWalkRightState
    }

export const CharacterStateSchema: StateSchema = {
  groups: {
    // We explicitly list all states in the group so they can override each other
    [CharacterStateGroups.MOVEMENT]: {
      exclusive: true,
      default: CharacterStateTypes.IDLE,
      states: Object.keys(CharacterStates)
    }
  },
  states: CharacterStates
};
