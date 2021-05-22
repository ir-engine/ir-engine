import { AnimationClip, Group, Material, MathUtils, Mesh, SkinnedMesh } from "three";
import { getLoader } from "../../assets/functions/LoadGLTF";
import { Behavior } from "../../common/interfaces/Behavior";
import { Engine } from "../../ecs/classes/Engine";
import { System } from "../../ecs/classes/System";
import { getMutableComponent } from "../../ecs/functions/EntityFunctions";
import { SystemUpdateType } from "../../ecs/functions/SystemUpdateType";
import { AnimationComponent } from "../components/AnimationComponent";
import { CharacterComponent } from "../components/CharacterComponent";
import { AnimationConfigInterface } from "../interfaces/AnimationConfigInterface";
import { defaultAvatarAnimations } from "../schema/defaultAvatarAnimations";

const EPSILON = 0.001;
const animationSpeedMultiplier = 0.8;

export class AvatarAnimationSystem extends System {
    static instance: AvatarAnimationSystem;
    updateType = SystemUpdateType.Fixed;
    _animations: AnimationClip[];
    _defaultModel: Group;
    _defaultSkeleton: SkinnedMesh;

    constructor() {
        super()
        AvatarAnimationSystem.instance = this;
    }

    getAnimations(): Promise<AnimationClip[]> {
        return new Promise(resolve => {
            if (this._animations) {
                resolve(this._animations);
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
                    //console.log(clip)
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
            getLoader().load(Engine.publicPath + '/models/avatars/Andy.glb', gltf => {
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

    /**
     * Executes the system. Called each frame by default from the Engine.
     * @param delta Time since last frame.
     */
    execute(delta: number): void {

        this.queryResults.animation.all?.forEach((entity) => {
            // Actor isn't initialized yet, so skip the animation
            const actor = getMutableComponent(entity, CharacterComponent);
            const animationComponent = getMutableComponent(entity, AnimationComponent);
            if (!actor || !actor.initialized || !actor.mixer || !animationComponent || !actor.modelContainer.children.length) return;
            const acceleration = actor.speedMultiplier;
            if (actor.mixer) actor.mixer.update(delta * animationSpeedMultiplier);
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
            animationsValues.forEach(value => {
                //@ts-ignore
                const avatarAnimation: AnimationConfigInterface = avatarAnimations[value.type];

                const clip = AnimationClip.findByName(actor.animations, avatarAnimation.name);
                let action = actor.mixer.existingAction(clip, animationRoot);

                if (!action) {
                    // get new action
                    action = actor.mixer.clipAction(clip, animationRoot);
                    if (action === null) {
                        // console.warn('setActorAnimation [', avatarAnimation.name, '], not found');
                        return;
                    }
                }

                if (typeof avatarAnimation.loop !== "undefined") {
                    action.setLoop(avatarAnimation.loop, Infinity);
                }
                // Push the action to our queue so we can handle it later if necessary
                if (!actor.currentAnimationAction.includes(action))
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

        })
    }
}

AvatarAnimationSystem.queries = {
    animation: {
        components: [AnimationComponent],
        listen: {
            added: true,
            removed: true
        }
    }
};


const animationMapLinear = (absSpeed, axisValue, axisWeight, i) =>

    MathUtils.mapLinear(absSpeed, axisValue[0 + i], axisValue[1 + i], axisWeight[0 + i], axisWeight[1 + i]);
//
export function mathMixesAnimFromSchemaValues(entity, animationsSchema, objectValues, delta: number, acceleration: number) {
    // const actor = getMutableComponent(entity, CharacterComponent);
    // const dontHasHit = actor.isGrounded ? 0 : 1;

    const { actorVelocity, dontHasHit } = objectValues;
    // console.log(actorVelocity, dontHasHit)
    const mathMixesAnimArray = [];
    let absSpeed = Math.min(actorVelocity.length() / delta / acceleration, 1);
    absSpeed < EPSILON ? absSpeed = 0 : '';

    const axisScalar = Math.abs(actorVelocity.x) + Math.abs(actorVelocity.y) + Math.abs(actorVelocity.z);
    for (let i = 0; i < animationsSchema.length; i++) {
        const animation = animationsSchema[i];
        const customProLength = animation.customProperties.length;
        const giveSpeed = actorVelocity[animation.axis] < 0 ? absSpeed * -1 : absSpeed;
        let weight = 0
        let multiplyXYZ = 0;
        if (animation.axis != 'xyz') {
            multiplyXYZ = axisScalar < EPSILON ? 1 : Math.abs(actorVelocity[animation.axis]) / axisScalar;
        }
        for (let mi = 0; mi < animation.value.length - 1; mi++) {
            if (animation.value[mi] <= giveSpeed && giveSpeed <= animation.value[mi + 1]) {
                for (let ip = 0; ip < customProLength; ip++) {
                    weight += animationMapLinear(giveSpeed, animation.value, animation[animation.customProperties[ip]], mi) * (ip == 0 ? 1 - dontHasHit : dontHasHit)
                }
            }
        }

        animation.axis != 'xyz' ? weight *= multiplyXYZ : '';
        weight < EPSILON ? weight = 0 : '';

        mathMixesAnimArray.push({
            type: animation.type,
            name: animation.name,
            weight: weight,
            time: (animation.speed ? animation.speed : 0.5)
        });
    }
    return mathMixesAnimArray;
}


export const changeAnimation: Behavior = (entity, args: {}, deltaTime: number): void => {

    const actor = getMutableComponent<CharacterComponent>(entity, CharacterComponent as any);
    if (!actor.initialized || !actor.mixer) return;
    //@ts-ignore
    const animationId = args.animationId;
    //@ts-ignore
    const transitionDuration = args.transitionDuration;
    // if actor model is not yet loaded mixer could be empty
    const avatarAnimations = defaultAvatarAnimations;

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
        if (currentAnimationAction.getClip().name === newAction.getClip().name) return;
        console.log("Fading out current animation action");
        currentAnimationAction.fadeOut(transitionDuration);
        currentAnimationAction.setEffectiveWeight(0);
    })

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
