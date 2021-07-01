import { AnimationClip, Group, Material, Mesh, SkinnedMesh } from "three";
import { getLoader } from "../assets/functions/LoadGLTF";
import { isClient } from "../common/functions/isClient";
import { Engine } from "../ecs/classes/Engine";
import { Entity } from "../ecs/classes/Entity";
import { getMutableComponent } from "../ecs/functions/EntityFunctions";
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

	renderAnimations = (characterEntity: Entity, delta: number) => {
		if (!isClient) return;

		const actor = getMutableComponent(characterEntity, CharacterComponent);
		const animationComponent = getMutableComponent(characterEntity, AnimationComponent);

		// If actor is not initialized then return
		if (!actor.mixer || !actor.modelContainer.children.length) return;

		const modifiedDelta = delta * actor.speedMultiplier;
		actor.mixer.update(modifiedDelta);

		animationComponent.animationGraph.render(actor, animationComponent, modifiedDelta);
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
			getLoader().load(Engine.publicPath + '/models/avatars/Sonny.glb', gltf => {
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
