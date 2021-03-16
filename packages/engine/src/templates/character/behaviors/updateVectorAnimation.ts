import { AnimationClip, MathUtils } from "three";
import { Entity } from "../../../ecs/classes/Entity";
import { Behavior } from '@xr3ngine/engine/src/common/interfaces/Behavior';
import { hasComponent, getComponent, getMutableComponent } from '../../../ecs/functions/EntityFunctions';

import { Input } from '../../../input/components/Input';
import { BinaryValue } from "@xr3ngine/engine/src/common/enums/BinaryValue";
import { BaseInput } from '@xr3ngine/engine/src/input/enums/BaseInput';

import { AnimationConfigInterface, CharacterAvatars, defaultAvatarAnimations } from "../CharacterAvatars";
import { CharacterStateTypes } from '../CharacterStateTypes';
import { CharacterComponent, RUN_SPEED, WALK_SPEED } from '../components/CharacterComponent';
import { isServer } from '../../../common/functions/isServer';

interface AnimationWeightScaleInterface {
  weight: number
}
/*
function safeFloat(float) {
  float < 0.00001 && float > - 0.00001 ? float = 0:'';
  float > 1 && float > 0 ? float = 1:'';
  float < -1 && float < 0 ? float = -1:'';
}
*/
//
function animationMapLinear( absSpeed, axisValue, axisWeight, i ) {
  return MathUtils.mapLinear(absSpeed, axisValue[0+i], axisValue[1+i], axisWeight[0+i], axisWeight[1+i]);
}
//
function mathMixesAnimFromSchemaValues( entity, animationsSchema, objectValues, deltaTime) {
  const { actorVelocity, dontHasHit } = objectValues;
  const mathMixesAnimArray = [];

  let absSpeed = actorVelocity.length() * 60 / RUN_SPEED;
  absSpeed < 0.1 ? absSpeed = 0:'';
  absSpeed = Math.min(absSpeed, 1);
  //safeFloat(actorVelocity.x);
//  safeFloat(actorVelocity.y);
//  safeFloat(actorVelocity.z);
  const axisScalar = Math.abs(actorVelocity.x) + Math.abs(actorVelocity.y) + Math.abs(actorVelocity.z);
  for (let i = 0; i < animationsSchema.length; i++) {
    const animation = animationsSchema[i];
    const customProLength = animation.customProperties.length;
    const giveSpeed = actorVelocity[animation.axis] < 0 ? absSpeed*-1 : absSpeed;
    let weight = 0
    let multiplyXYZ = 0;
    if (animation.axis != 'xyz') {
      multiplyXYZ = axisScalar < 0.00001 ? 1 : Math.abs(actorVelocity[animation.axis]) / axisScalar;
    }
    for (let mi = 0; mi < animation.value.length-1; mi++) {
      if(animation.value[mi] <= giveSpeed && giveSpeed <= animation.value[mi+1]) {
          for (let ip = 0; ip < customProLength; ip++) {
            weight += animationMapLinear(giveSpeed, animation.value, animation[animation.customProperties[ip]], mi) * (ip == 0 ? 1 -dontHasHit : dontHasHit)
          }
      }
    };

    animation.axis != 'xyz' ? weight*= multiplyXYZ:'';
    weight < 0.0001 ? weight = 0:'';

    mathMixesAnimArray.push({
      type: animation.type,
      name: animation.name,
      weight: weight,
      time: (animation.speed ? animation.speed: 0.5)
    });
  }
  return mathMixesAnimArray;
}
// FOR DEBUG ANIMATION weight
/*
let test = 0;
function consoleGrafics(obj) {
  let nMaxL = 25 - obj.name.length;
  let str = obj.name;
  for (let i = 0; i < nMaxL; i++) {
    str += ' '
  }
  for (let i = 0; i < Math.ceil(obj.weight*20); i++) {
    str += '#'
  }
  return str
}
*/
//
export const updateVectorAnimation: Behavior = (entity, args: { animationsSchema: any, updateAnimationsValues: any }, deltaTime: number): void => {
  if (isServer) return;
  	// Actor isn't initialized yet, so skip the animation
	const actor = getMutableComponent(entity, CharacterComponent);
	if (!actor || !actor.initialized || !actor.mixer) return;

  if (actor.mixer) actor.mixer.update(deltaTime);

  if(args.animationsSchema.length == 3) return;
	// Get the magnitude of current velocity
	const animations = new Map<number, AnimationWeightScaleInterface>();
	const avatarId = actor.avatarId;
	const avatarAnimations = CharacterAvatars.find(a => a.id === avatarId)?.animations ?? defaultAvatarAnimations;
	const animationRoot = actor.modelContainer.children[0];
  // update values for animations
  const objectValues = args.updateAnimationsValues(entity, args.animationsSchema, deltaTime);
  // math to correct all animations
  const animationsValues = mathMixesAnimFromSchemaValues(entity, args.animationsSchema, objectValues, deltaTime);

/*
    //console.clear();
    for (let ia = 0; ia < animationsValues.length; ia++) {
      console.warn(consoleGrafics(animationsValues[ia]))
    }
*/

	// apply values to animations
	animationsValues.forEach( value => {
      //@ts-ignore
			const avatarAnimation: AnimationConfigInterface = avatarAnimations[value.type];

			const clip = AnimationClip.findByName(actor.animations, avatarAnimation.name);
			let action = actor.mixer.existingAction(clip, animationRoot);

			if (!action) {
				// get new action
				action = actor.mixer.clipAction(clip, animationRoot);
				if (action === null) {
					console.warn('setActorAnimation [', avatarAnimation.name, '], not found');
					return;
				}
			}

			if (typeof avatarAnimation.loop !== "undefined") {
				action.setLoop(avatarAnimation.loop, Infinity);
			}
			// Push the action to our queue so we can handle it later if necessary
			if(!actor.currentAnimationAction.includes(action))
				actor.currentAnimationAction.push(action);

			// just set weight and scale
			action.setEffectiveWeight(value.weight);
      action.setEffectiveTimeScale(value.time);

			if (value.weight > 0 && !action.isRunning()) {
				action.play();
			} else if (value.weight === 0 && action.isRunning()) {
				action.stop();
			}
	});
};

export const clearAnimOnChange: Behavior = (entity: Entity, args: { animationsSchema: any }, deltaTime: number): void => {
  const actor = getComponent<CharacterComponent>(entity, CharacterComponent as any);
// Walking animation names
// If animation is not in this array, remove
  // Actor isn't initialized yet, so skip the animation
  if (!actor || !actor.initialized || !actor.mixer) return;
  const avatarAnimations = CharacterAvatars.find(a => a.id === actor.avatarId)?.animations ?? defaultAvatarAnimations;
  const movementAnimationNames = args.animationsSchema.map(val => val.name);
    // Clear existing animations
    actor.currentAnimationAction.forEach(currentAnimationAction => {
      if(movementAnimationNames.filter(movAnim => movAnim === currentAnimationAction.getClip().name).length > 0)
        return;
      //currentAnimationAction.fadeOut(.3);
      // currentAnimationAction.setEffectiveWeight(0);
    } )
};



export const changeAnimation: Behavior = (entity, args: {}, deltaTime: number): void => {

	const actor = getMutableComponent<CharacterComponent>(entity, CharacterComponent as any);
	if (!actor.initialized || !actor.mixer) return;
	//@ts-ignore
	const animationId = args.animationId;
	//@ts-ignore
	const transitionDuration = args.transitionDuration;
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
		.setEffectiveTimeScale(1)
		.fadeIn(0.01)
		.play();
		console.log("New action is ", newAction);

	actor.currentAnimationAction = [newAction];
	actor.currentAnimationLength = newAction.getClip().duration;

};
