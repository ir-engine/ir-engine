import { AnimationClip, AnimationMixer, Group, Material, Mesh, SkinnedMesh, Vector3 } from "three";
import { getLoader } from "../assets/functions/LoadGLTF";
import { isClient } from "../common/functions/isClient";
import { Engine } from "../ecs/classes/Engine";
import { Entity } from "../ecs/classes/Entity";
import { getMutableComponent } from "../ecs/functions/EntityFunctions";
import { AnimationState, AnimationStateGraph, CharacterStates, Animation, AnimationType } from "./animations/AnimationState";
import { getMovementValues, getMovementValuesNew, MovementType } from "./animations/MovingAnimations";
import { AnimationComponent } from "./components/AnimationComponent";
import { CharacterComponent } from "./components/CharacterComponent";

export class AnimationManager {
	static instance: AnimationManager;

	constructor() {
		AnimationManager.instance = this;
	}

	_animations: AnimationClip[];
	_defaultModel: Group;
	_defaultSkeleton: SkinnedMesh;
	speedMultiplier: number = 1;
	EPSILON = 0.001;
	prevVelocity = new Vector3();

	updateAnimationAction = (animation: Animation, mixer: AnimationMixer, stopAction?: boolean) => {
		if (!animation.clip) {
			animation.clip = AnimationClip.findByName(this._animations, animation.name);

			if (!animation.clip) return;
		}

		let action = mixer.clipAction(animation.clip);

		action.setEffectiveWeight(stopAction ? 0 : animation.weight);
		action.setEffectiveTimeScale(animation.timeScale || 1);

		if (animation.decorateAction) animation.decorateAction(action);

		if (!action.isRunning() && animation.weight > 0) {
			action.play();
		} else if (stopAction) {
			action.reset().fadeOut(1);

			if (action.isRunning()) action.stop();
		}
	}

	transitionState = (actor: CharacterComponent, animationComponent: AnimationComponent, newState: string, movement?: MovementType) => {
		let oldState = null;

		if (newState !== animationComponent.currentState.name) {
			oldState = animationComponent.currentState;
			animationComponent.currentState = AnimationStateGraph[newState];
		}

		if (oldState && oldState.name !== AnimationStateGraph[CharacterStates.DEFAULT].name) {
			oldState.animations.forEach(a => {
				this.updateAnimationAction(a, actor.mixer, true);
			});
		}

		if (animationComponent.currentState.calculateWeights) animationComponent.currentState.calculateWeights(movement);

		let idleWeight = 1;
		animationComponent.currentState.animations.forEach(a => {
			idleWeight -= a.weight;
			this.updateAnimationAction(a, actor.mixer);
		});


		if (newState !== AnimationStateGraph[CharacterStates.DEFAULT].name) {
			AnimationStateGraph[CharacterStates.DEFAULT].animations[0].weight = idleWeight;
			this.updateAnimationAction(AnimationStateGraph[CharacterStates.DEFAULT].animations[0], actor.mixer);
		}
	}

	updateVelocityBasedAnimations = (characterEntity: Entity, delta: number) => {
		if (!isClient) return;

		const actor = getMutableComponent(characterEntity, CharacterComponent);
		const animationComponent = getMutableComponent(characterEntity, AnimationComponent);

		// If actor is not initialized then return
		if (!actor.mixer || !actor.modelContainer.children.length) return;

		const modifiedDelta = delta * actor.speedMultiplier;
		actor.mixer.update(modifiedDelta);

		// If Some animation has prevented other animations to be played then return
		if (animationComponent.areOtherAnimationsPaused) return;

		// TODO: move below line to add component
		if (!animationComponent.currentState) animationComponent.currentState = AnimationStateGraph[CharacterStates.IDLE];

		const movement = getMovementValuesNew(actor, modifiedDelta, this.EPSILON);

		if (movement.velocity.equals(this.prevVelocity)) return;

		if (movement.velocity.length() > this.EPSILON * 3) {
			this.transitionState(actor, animationComponent, actor.isWalking ? CharacterStates.WALK : CharacterStates.RUN, movement)
		} else {
			if (animationComponent.currentState.name !== CharacterStates.IDLE) {
				this.transitionState(actor, animationComponent, CharacterStates.IDLE, movement)
			}
		}

		this.prevVelocity.copy(movement.velocity);
	}

	getAnimationDuration(name: string): number {
		const animation = this._animations.find(a => a.name === name)
		return animation ? animation.duration : 0;
	}

	getAnimations(): Promise<AnimationClip[]> {
		return new Promise(resolve => {
			if (this._animations) {
				resolve(this._animations);
			}
			if (!isClient) {
				resolve([]);
			}
			getLoader().load(Engine.publicPath + '/models/avatars/Animations.glb', gltf => {
				gltf.scene.traverse((child) => {
					if (child.type === "SkinnedMesh" && !this._defaultSkeleton) {
						this._defaultSkeleton = child;
					}
				});

				this._animations = gltf.animations;
				this._animations?.forEach(clip => {
					// TODO: make list of morph targets names
					clip.tracks = clip.tracks.filter(track => !track.name.match(/^CC_Base_/));
				});
				resolve(this._animations);
			});
		});
	}
	getDefaultModel(): Promise<Group> {
		return new Promise(resolve => {
			if (this._defaultModel) {
				resolve(this._defaultModel);
			}
			if (!isClient) {
				resolve(new Group());
			}
			getLoader().load(Engine.publicPath + '/models/avatars/Animations.glb', gltf => {
				console.log('default model loaded');
				this._defaultModel = gltf.scene;
				this._defaultModel.traverse((obj: Mesh) => {
					if (obj.material) {
						(obj.material as Material).transparent = true;
						(obj.material as Material).opacity = 0.5;
					}
				});
				resolve(this._defaultModel);
			});
		});
	}
}
