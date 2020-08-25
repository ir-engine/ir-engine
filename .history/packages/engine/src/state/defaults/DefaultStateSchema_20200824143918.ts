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
      [DefaultStateTypes.SPRINT]: null,
      [DefaultStateTypes.WALK_END]: null,
      [DefaultStateTypes.WALK_START_BACK_LEFT]: null,
      [DefaultStateTypes.WALK_START_BACK_RIGHT]: null,
      [DefaultStateTypes.WALK_START_FORWARD]: null,
      [DefaultStateTypes.WALK_START_LEFT]: null,
      [DefaultStateTypes.WALK_START_RIGHT]: null
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
