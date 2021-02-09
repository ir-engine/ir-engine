import { Behavior } from '@xr3ngine/engine/src/common/interfaces/Behavior';
import { AnimationClip } from 'three';
import { getComponent, getMutableComponent } from '../../../ecs/functions/EntityFunctions';
import { CharacterStateTypes } from "../CharacterStateTypes";
import { AnimationConfigInterface, CharacterAvatars, defaultAvatarAnimations } from "../CharacterAvatars";
import { CharacterAvatarComponent } from "../components/CharacterAvatarComponent";
import { CharacterComponent } from '../components/CharacterComponent';

export const initializeCharacterState: Behavior = (entity, args: { x?: number, y?: number, z?: number, animationId: number; transitionDuration: number }) => {
	const actor = getMutableComponent<CharacterComponent>(entity, CharacterComponent as any);
	// TODO: Replace with characterinitialized component
	if(!actor.initialized) return;
	if(actor.velocitySimulator === undefined){
		actor.velocitySimulator.init();
	}
	actor.velocitySimulator.damping = actor.defaultVelocitySimulatorDamping;
	actor.velocitySimulator.mass = actor.defaultVelocitySimulatorMass;

	actor.rotationSimulator.damping = actor.defaultRotationSimulatorDamping;
	actor.rotationSimulator.mass = actor.defaultRotationSimulatorMass;

	actor.canFindVehiclesToEnter = true;
	actor.canEnterVehicles = false;
	actor.canLeaveVehicles = true;

	actor.arcadeVelocityIsAdditive = false;
	getMutableComponent<CharacterComponent>(entity, CharacterComponent as any).arcadeVelocityInfluence.set(1, 0, 1);

	actor.timer = 0;
	actor.velocityTarget.z = args.z ?? 0;
	actor.velocityTarget.x = args.x ?? 0;
	actor.velocityTarget.y = args.y ?? 0;

	  // Actor isn't initialized yet, so skip the animation
	  if(!actor?.initialized) return;
	  // if actor model is not yet loaded mixer could be empty
	  if (!actor.mixer) return;
	
	  const avatarId = getComponent(entity, CharacterAvatarComponent)?.avatarId;
	  const avatarAnimations = CharacterAvatars.find(a => a.id === avatarId)?.animations ?? defaultAvatarAnimations;
	
	  const avatarAnimation: AnimationConfigInterface = avatarAnimations[args.animationId];
	
	  if (!avatarAnimation) {
		console.error(`setActorAnimation - animation not found for:[${CharacterStateTypes[args.animationId]}](${args.animationId})`, args.transitionDuration);
		return;
	  }
		
	  // Actor isn't initialized yet, so skip the animation
	  if(!actor.initialized) return;
	  // if actor model is not yet loaded mixer could be empty
	  if (!actor.mixer) return;
	
	  if (actor.currentAnimationAction && avatarAnimation.name == actor.currentAnimationAction.getClip().name) {
		console.warn('setActorAnimation', avatarAnimation.name, ', same animation already playing');
		return;
	  }
	
	  const animationRoot = actor.modelContainer.children[0];
	  if (!animationRoot) {
		console.error('Animation root/model is undefined', animationRoot);
		return;
	  }
	
	  const clip = AnimationClip.findByName(actor.animations, avatarAnimation.name );
	  let newAction = actor.mixer.existingAction(clip, animationRoot);
	  if (!newAction) {
		// get new action
		newAction = actor.mixer.clipAction(clip, animationRoot);
		if (!newAction) {
		  console.warn('setActorAnimation', avatarAnimation.name, ', not found');
		  return;
		}
	  }
	  if (typeof avatarAnimation.loop !== "undefined") {
		newAction.setLoop(avatarAnimation.loop, Infinity);
	  }
	
	  if (actor.currentAnimationAction) {
		actor.currentAnimationAction.fadeOut(args.transitionDuration);
	  }
	
	  newAction
		.reset()
		.setEffectiveTimeScale( 1 )
		.setEffectiveWeight( 1 )
		.fadeIn( args.transitionDuration )
		.play();
	
	  actor.currentAnimationAction = newAction;
	  actor.currentAnimationLength = newAction.getClip().duration;
	
	
	};