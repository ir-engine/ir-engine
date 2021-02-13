import { AnimationClip } from 'three';
import { Entity } from "../../../ecs/classes/Entity";
import { getComponent, getMutableComponent } from "../../../ecs/functions/EntityFunctions";
import { setState } from '../../../state/behaviors/setState';
import { StateSchemaValue } from '../../../state/interfaces/StateSchema';
import { initializeCharacterState } from "../behaviors/initializeCharacterState";
import { updateCharacterState } from "../behaviors/updateCharacterState";
import { AnimationConfigInterface, CharacterAvatars, defaultAvatarAnimations } from '../CharacterAvatars';
import { CharacterStateTypes } from "../CharacterStateTypes";
import { CharacterComponent } from '../components/CharacterComponent';

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
        if (!actor.initialized || !actor.mixer) return;
        console.log("Handling jump behavior")
        const animationId = CharacterStateTypes.JUMP;
        const transitionDuration = 0.3;
        // if actor model is not yet loaded mixer could be empty	
        const avatarId = getComponent(entity, CharacterComponent)?.avatarId;
        const avatarAnimations = CharacterAvatars.find(a => a.id === avatarId)?.animations ?? defaultAvatarAnimations;

        const avatarAnimation: AnimationConfigInterface = avatarAnimations[animationId];

        const animationRoot = actor.modelContainer.children[0];

        const clip = AnimationClip.findByName(actor.animations, avatarAnimation.name);

        let newAction = actor.mixer.existingAction(clip, animationRoot);
        if (!newAction) {
          // get new action
          newAction = actor.mixer.clipAction(clip, animationRoot);
          if (!newAction) {
            console.warn('setActorAnimation', avatarAnimation.name, ', not found');
            return;
          }
        }
          newAction.fadeIn(transitionDuration);
        if (typeof avatarAnimation.loop !== "undefined")
          newAction.setLoop(avatarAnimation.loop, Infinity);
          
        // Clear existing animations
        actor.currentAnimationAction.forEach(currentAnimationAction => {
          if(currentAnimationAction.getClip().name === newAction.getClip().name) return;
          console.log("Fading out current animation action");
          currentAnimationAction.fadeOut(transitionDuration);
          currentAnimationAction.setEffectiveWeight(0);
        } )

        newAction
          .reset()
          .setEffectiveWeight(1)
          .fadeIn(transitionDuration)
          .play();
          console.log("New action is ", newAction);

        actor.currentAnimationAction = [newAction];
        actor.currentAnimationLength = newAction.getClip().duration;
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
