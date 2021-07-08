import { AnimationClip, MathUtils } from "three";
import { AnimationConfigInterface, defaultAvatarAnimations } from "../CharacterAvatars";
import { CharacterComponent } from '../components/CharacterComponent';
import { AnimationComponent } from "../components/AnimationComponent";
import { isClient } from "../../common/functions/isClient";
import { Behavior } from "../../common/interfaces/Behavior";
import { getMutableComponent } from "../../ecs/functions/EntityFunctions";
import { AnimationManager } from "../AnimationManager";
/*
function safeFloat(float) {
  float < 0.00001 && float > - 0.00001 ? float = 0:'';
  float > 1 && float > 0 ? float = 1:'';
  float < -1 && float < 0 ? float = -1:'';
}
*/
const EPSILON = 0.001;
const animationSpeedMultiplier = 1.3;
//
function animationMapLinear( absSpeed, axisValue, axisWeight, i ) {
  return MathUtils.mapLinear(absSpeed, axisValue[0+i], axisValue[1+i], axisWeight[0+i], axisWeight[1+i]);
}
//
function mathMixesAnimFromSchemaValues(entity, animationsSchema, objectValues, delta: number, acceleration: number) {
	// const actor = getMutableComponent(entity, CharacterComponent);
  // const dontHasHit = actor.isGrounded ? 0 : 1;

  const { actorVelocity, dontHasHit } = objectValues;
  // console.log(actorVelocity, dontHasHit)
  const mathMixesAnimArray = [];
  let absSpeed = Math.min( actorVelocity.length() / delta / acceleration, 1);
  absSpeed < EPSILON ? absSpeed = 0:'';

  const axisScalar = Math.abs(actorVelocity.x) + Math.abs(actorVelocity.y) + Math.abs(actorVelocity.z);
  for (let i = 0; i < animationsSchema.length; i++) {
    const animation = animationsSchema[i];
    const customProLength = animation.customProperties.length;
    const giveSpeed = actorVelocity[animation.axis] < 0 ? absSpeed*-1 : absSpeed;
    let weight = 0
    let multiplyXYZ = 0;
    if (animation.axis != 'xyz') {
      multiplyXYZ = axisScalar < EPSILON ? 1 : Math.abs(actorVelocity[animation.axis]) / axisScalar;
    }
    for (let mi = 0; mi < animation.value.length-1; mi++) {
      if(animation.value[mi] <= giveSpeed && giveSpeed <= animation.value[mi+1]) {
          for (let ip = 0; ip < customProLength; ip++) {
            weight += animationMapLinear(giveSpeed, animation.value, animation[animation.customProperties[ip]], mi) * (ip == 0 ? 1 -dontHasHit : dontHasHit)
          }
      }
    }

    animation.axis != 'xyz' ? weight*= multiplyXYZ:'';
    weight < EPSILON ? weight = 0:'';

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
export const updateVectorAnimation = (entity, delta: number): void => {
  if (!isClient) return;
  // Actor isn't initialized yet, so skip the animation
	const actor = getMutableComponent(entity, CharacterComponent);
	const animationComponent = getMutableComponent(entity, AnimationComponent);
	if (!animationComponent.mixer || !actor.modelContainer.children.length) return;
  const acceleration = animationComponent.speedMultiplier;
  if (animationComponent.mixer) animationComponent.mixer.update(delta * animationSpeedMultiplier);
//  if(animationComponent.animationsSchema.length == 3) return;
	// Get the magnitude of current velocity
	const avatarAnimations = defaultAvatarAnimations;
	const animationRoot = actor.modelContainer.children[0];
  // update values for animations
  const objectValues = animationComponent.updateAnimationsValues(entity, animationComponent.animationsSchema, delta * animationSpeedMultiplier);
  // math to correct all animations
  const animationsValues = mathMixesAnimFromSchemaValues(entity, animationComponent.animationsSchema, objectValues, delta, acceleration);
/*
    console.clear();
    for (let ia = 0; ia < animationsValues.length; ia++) {
      console.warn(consoleGrafics(animationsValues[ia]))
    }
*/

	// apply values to animations
	animationsValues.forEach( value => {
      //@ts-ignore
			const avatarAnimation: AnimationConfigInterface = avatarAnimations[value.type];

			const clip = AnimationClip.findByName(AnimationManager.instance._animations, avatarAnimation.name);
			let action = animationComponent.mixer.existingAction(clip, animationRoot);

			if (!action) {
				// get new action
				action = animationComponent.mixer.clipAction(clip, animationRoot);
				if (action === null) {
					// console.warn('setActorAnimation [', avatarAnimation.name, '], not found');
					return;
				}
			}

			if (typeof avatarAnimation.loop !== "undefined") {
				action.setLoop(avatarAnimation.loop, Infinity);
			}
			// Push the action to our queue so we can handle it later if necessary
			if(!animationComponent.currentAnimationAction.includes(action))
      animationComponent.currentAnimationAction.push(action);

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

export const changeAnimation: Behavior = (entity, args: {}, deltaTime: number): void => {

  if(!isClient) return;
	const actor = getMutableComponent(entity, CharacterComponent);
  const animationComponent = getMutableComponent(entity, AnimationComponent);
	if (!animationComponent.mixer) return;
	//@ts-ignore
	const animationId = args.animationId;
	//@ts-ignore
	const transitionDuration = args.transitionDuration;
	// if actor model is not yet loaded mixer could be empty
	const avatarAnimations = defaultAvatarAnimations;

	const avatarAnimation: AnimationConfigInterface = avatarAnimations[animationId];

	const animationRoot = actor.modelContainer.children[0];

	const clip = AnimationClip.findByName(AnimationManager.instance._animations, avatarAnimation.name);

	let newAction = animationComponent.mixer.existingAction(clip, animationRoot);
	if (!newAction) {
		// get new action
		newAction = animationComponent.mixer.clipAction(clip, animationRoot);
		if (!newAction) {
			console.warn('setActorAnimation', avatarAnimation.name, ', not found');
			return;
		}
	}
		newAction.fadeIn(transitionDuration);
	if (typeof avatarAnimation.loop !== "undefined")
		newAction.setLoop(avatarAnimation.loop, Infinity);

	// Clear existing animations
	animationComponent.currentAnimationAction.forEach(currentAnimationAction => {
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

  animationComponent.currentAnimationAction = [newAction];
  animationComponent.currentAnimationLength = newAction.getClip().duration;

};
