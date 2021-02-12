import { StateSchemaValue } from '../../../state/interfaces/StateSchema';
import { initializeCharacterState } from "../behaviors/initializeCharacterState";
import { onAnimationEnded } from "../behaviors/onAnimationEnded";
import { updateCharacterState } from "../behaviors/updateCharacterState";
import { CharacterStateTypes } from "../CharacterStateTypes";
import { CharacterComponent } from '../components/CharacterComponent';
import { Behavior } from "@xr3ngine/engine/src/common/interfaces/Behavior";
import { Entity } from "../../../ecs/classes/Entity";
import { getComponent, getMutableComponent } from "../../../ecs/functions/EntityFunctions";
import { setDropState } from '../behaviors/setDropState';
import { setState } from '../../../state/behaviors/setState';
import { AnimationClip } from 'three';
import { CharacterAvatars, defaultAvatarAnimations, AnimationConfigInterface } from '../CharacterAvatars';



export const JumpState: StateSchemaValue = {
  componentProperties: [{
    component: CharacterComponent,
    properties: {
      ['velocitySimulator.mass']: 100,
      ['alreadyJumped']: false,
      ['wantsToJump']: true
    }
  }],
  onEntry: [
    {
      behavior: initializeCharacterState
    },
    {

      behavior: (entity: Entity) => {
        const actor = getMutableComponent<CharacterComponent>(entity, CharacterComponent as any);
        if (!actor.initialized) return;
        // const animationId = CharacterStateTypes.JUMP;
        // const transitionDuration = 0.3;
        // // if actor model is not yet loaded mixer could be empty	
        // const avatarId = getComponent(entity, CharacterComponent)?.avatarId;
        // const avatarAnimations = CharacterAvatars.find(a => a.id === avatarId)?.animations ?? defaultAvatarAnimations;

        // const avatarAnimation: AnimationConfigInterface = avatarAnimations[animationId];

        // // TODO: Check if current animation actons contains
        // if (actor.currentAnimationAction && avatarAnimation.name == actor.currentAnimationAction.getClip().name) {
        //   console.warn('setActorAnimation', avatarAnimation.name, ', same animation already playing');
        //   return;
        // }

        // const animationRoot = actor.modelContainer.children[0];

        // const clip = AnimationClip.findByName(actor.animations, avatarAnimation.name);
        // let newAction = actor.mixer.existingAction(clip, animationRoot);
        // if (!newAction) {
        //   // get new action
        //   newAction = actor.mixer.clipAction(clip, animationRoot);
        //   if (!newAction) {
        //     console.warn('setActorAnimation', avatarAnimation.name, ', not found');
        //     return;
        //   }
        // }
        // if (typeof avatarAnimation.loop !== "undefined")
        //   newAction.setLoop(avatarAnimation.loop, Infinity);

        // if (actor.currentAnimationAction) {
        //   actor.currentAnimationAction.fadeOut(transitionDuration);
        // }

        // newAction
        //   .reset()
        //   .setEffectiveWeight(1)
        //   .fadeIn(transitionDuration)
        //   .play();

        // actor.currentAnimationAction = newAction;
        // actor.currentAnimationLength = newAction.getClip().duration;
      },
      args: {}
    }
  ],
  onUpdate: [
    {
      behavior: updateCharacterState
    },
    {
      behavior: (entity: Entity, args: null, delta: any): void => {
        const actor = getMutableComponent<CharacterComponent>(entity, CharacterComponent as any);

        // Physically jump
        if (!actor.alreadyJumped) {
          const actor: CharacterComponent = getMutableComponent<CharacterComponent>(entity, CharacterComponent as any);
          actor.initJumpSpeed = 1;
          actor.alreadyJumped = true;
          actor.rotationSimulator.damping = 0.3;
          actor.arcadeVelocityIsAdditive = true;
        }
        else if (actor.timer > .25) {
          const hitGroundOrStopped = actor.rayHasHit || actor.groundImpactVelocity.y < -5;
          if (!hitGroundOrStopped) return;
          // console.log("Setting drop state");
          console.log("TRYING TO SET DROP STATE: DEFAULT")
          actor.wantsToJump = false;
          actor.alreadyJumped = false;

          setState(entity, { state: CharacterStateTypes.DEFAULT });
        }
      }
    },
    //   {
    //     behavior: onAnimationEnded,
    //     args: { transitionToState: CharacterStateTypes.DEFAULT }
    //   }
  ]
};
