import { AnimationAction, AnimationClip, LoopOnce, LoopRepeat, MathUtils } from "three"
import { AnimationManager } from "../AnimationManager";
import { CharacterComponent } from "../components/CharacterComponent";
import { Animation, AnimationType, CalculateWeightsParams, CharacterAnimations, CharacterStates, MovementType } from "./Util";

/** Class to hold state of an animation for entity */
export class AnimationState {
    /** Name of the animation state */
	name: string;

    /** Type of the animation state */
    type: AnimationType = AnimationType.STATIC;

    /** State to which transition can happen */
	nextStates: (typeof AnimationState)[] = [];

    /** Animations of this state */
	animations: Animation[] = [];

    /** Time elapsed after unmounting of this state. */
    timeElapsedAfterUnmount?: number = 0;

    /** Duration for which transition from this state is paused */
    pauseTransitionDuration?: number;

    /** Duration after which weigts of all the animation in this state becomes zero. This duration will cosidered after unmounting started for this state */
    unmountDuration = 1;

    /** After finising the animation automatically transition to the given state */
    autoTransitionTo?: string;

    /** Calculates the weight of all the animations in the state based on the params provided
     * @param params Params which will be used to calculate wieghts
     */
	calculateWeights?: (params: CalculateWeightsParams) => void;

    /** Returns the total sum of weights all the animation at current time */
    getTotalWeightsOfAnimations = () => {
        let weight = 0;
        this.animations.forEach(a => weight += isNaN(a.weight) ? 0 : a.weight);

        return weight;
    }

    /** Mounts the state
     * @param actor Actor component for which animation state will be mounted
     * @param movement Movement of the actor in this frame
     */
    mount = (actor: CharacterComponent, movement: MovementType) => {
        // Calculate the weights of the animations
        if (this.calculateWeights) this.calculateWeights({ movement, isMounting: true });

		this.animations.forEach(animation => {

            // Take the clip from the loaded animations
            if (!animation.clip) {
                animation.clip = AnimationClip.findByName(AnimationManager.instance._animations, animation.name);

                if (!animation.clip) return;
            }

            // get action from the animation mixer
            animation.action = actor.mixer.clipAction(animation.clip);

            animation.action.setEffectiveWeight(animation.weight);
            animation.action.setEffectiveTimeScale(animation.timeScale || 1);


            // Apply state specific decorations to the action
            if (animation.decorateAction) animation.decorateAction(animation.action);


            // Run the action
            if (!animation.action.isRunning() && animation.weight > 0) {
                animation.action.play();
            }
		});
    }

    /** Updates the animations and adjusts the weight
     * @param movement Movement of the actor in this frame
     */
    update = (movement: MovementType) => {
        if (this.calculateWeights) this.calculateWeights({ movement });

        this.animations.forEach(animation => {
            if (!animation.clip) return;

            animation.action.setEffectiveWeight(animation.weight);
            animation.action.setEffectiveTimeScale(animation.timeScale || 1);

            if (!animation.action.isRunning() && animation.weight > 0) {
                animation.action.play();
            }
        });
    }

    /** Unmounts the state
     * @param stopImmediately Whether to stop all the animation immediately of not
     */
    unmount = (stopImmediately?: boolean) => {
        this.animations.forEach(animation => {
            // Set weight at the time when the unmounting of the state started.
            // Weight of the animation will be decrease starting from this weight.
            if (!animation.weightWhenUnmount) animation.weightWhenUnmount = animation.weight;

            // Get the interpolated weight and apply to the action
            animation.weight = stopImmediately ? 0 : MathUtils.clamp(0, MathUtils.mapLinear(this.timeElapsedAfterUnmount, 0, this.unmountDuration, animation.weightWhenUnmount, 0), 1);
            animation.action.setEffectiveWeight(animation.weight);

            if (animation.weight <= 0) {
                // Reset the animation of the action
                animation.action.reset();
                animation.weightWhenUnmount = 0;

                // Stop the action
                if (animation.action.isRunning()) {
                    animation.action.stop();
                }
            }
        });
    }
}

export class EnteringVehicleState extends AnimationState {
    name = CharacterStates.ENTERING_VEHICLE;
    type = AnimationType.STATIC;
    nextStates = [];
    pauseTransitionDuration = 3000;
    animations: Animation[] = [
        {
            name: CharacterAnimations.ENTERING_VEHICLE_DRIVER,
            weight: 0,
            timeScale: 1,
            loopType: LoopOnce,
            decorateAction: function(action: AnimationAction) {
                action.setLoop(this.loopType, this.loopCount);
                action.clampWhenFinished = true;
            },
        },
        {
            name: CharacterAnimations.ENTERING_VEHICLE_PASSENGER,
            weight: 0,
            timeScale: 1,
            loopType: LoopOnce,
            decorateAction: function(action: AnimationAction) {
                action.setLoop(this.loopType, this.loopCount);
                action.clampWhenFinished = true;
            },
        },
    ];
    calculateWeights = (params: CalculateWeightsParams) => {
        if (params.isDriver) {
            this.animations[0].weight = 1;
            this.animations[1].weight = 0;
        } else {
            this.animations[0].weight = 1;
            this.animations[1].weight = 0;
        }
    }
}

export class ExitingVehicleState extends AnimationState {
    name = CharacterStates.EXITING_VEHICLE;
    type = AnimationType.STATIC;
    nextStates = [];
    pauseTransitionDuration = 3000;
    animations: Animation[] = [
        {
            name: CharacterAnimations.EXITING_VEHICLE_DRIVER,
            weight: 0,
            timeScale: 1,
            loopType: LoopOnce,
            decorateAction: function(action: AnimationAction) {
                action.setLoop(this.loopType, this.loopCount);
                action.clampWhenFinished = true;
            },
        },
        {
            name: CharacterAnimations.EXITING_VEHICLE_PASSENGER,
            weight: 0,
            timeScale: 1,
            loopType: LoopOnce,
            decorateAction: function(action: AnimationAction) {
                action.setLoop(this.loopType, this.loopCount);
                action.clampWhenFinished = true;
            },
        },
    ];
    calculateWeights = (params: CalculateWeightsParams) => {
        if (params.isDriver) {
            this.animations[0].weight = 1;
            this.animations[1].weight = 0;
        } else {
            this.animations[0].weight = 1;
            this.animations[1].weight = 0;
        }
    }
}

export class IdleState extends AnimationState {
    name = CharacterStates.IDLE;
    type = AnimationType.VELOCITY_BASED;
    nextStates = [];
    animations: Animation[] = [
        { name: CharacterAnimations.IDLE, weight: 1, timeScale: 0.6, loopType: LoopRepeat, loopCount: Infinity }
    ];

    calculateWeights = (params: CalculateWeightsParams) => {
        if (params.isMounting) {
            this.animations.forEach(a => a.weight = 1);
        }
    };
}

export class WalkState extends AnimationState {
    name = CharacterStates.WALK;
    type = AnimationType.VELOCITY_BASED;
    nextStates = [];
    animations: Animation[] = [
        { name: CharacterAnimations.WALK_FORWARD, weight: 0, timeScale: 0.6, loopType: LoopRepeat, loopCount: Infinity },
        { name: CharacterAnimations.WALK_BACKWARD, weight: 0, timeScale: 0.6, loopType: LoopRepeat, loopCount: Infinity },
        { name: CharacterAnimations.WALK_STRAFE_LEFT, weight: 0, timeScale: 0.6, loopType: LoopRepeat, loopCount: Infinity },
        { name: CharacterAnimations.WALK_STRAFE_RIGHT, weight: 0, timeScale: 0.6, loopType: LoopRepeat, loopCount: Infinity },
    ];

    calculateWeights = (params: CalculateWeightsParams): void => {
        const { velocity, distanceFromGround } = params.movement;

        const maxWeight = distanceFromGround ? 0.5 : 1; // In Air wieght

        if (velocity.x > 0) {
            this.animations[2].weight = MathUtils.mapLinear(velocity.x, 0, 0.02, 0, maxWeight);
            this.animations[3].weight = 0;
        } else {
            this.animations[3].weight = MathUtils.mapLinear(velocity.x, 0, -0.02, 0, maxWeight);
            this.animations[2].weight = 0;
        }

        if (velocity.z > 0) {
            this.animations[0].weight = MathUtils.mapLinear(velocity.z, 0, 0.02, 0, maxWeight);
            this.animations[1].weight = 0;
        } else {
            this.animations[1].weight = MathUtils.mapLinear(velocity.z, 0, -0.02, 0, maxWeight);
            this.animations[0].weight = 0;
        }
    }
}

export class RunState extends AnimationState {
    name = CharacterStates.RUN;
    type = AnimationType.VELOCITY_BASED;
    nextStates = [];
    animations: Animation[] = [
        { name: CharacterAnimations.RUN_FORWARD, weight: 0, timeScale: 0.5, loopType: LoopRepeat, loopCount: Infinity },
        { name: CharacterAnimations.RUN_BACKWARD, weight: 0, timeScale: 0.5, loopType: LoopRepeat, loopCount: Infinity },
        { name: CharacterAnimations.RUN_STRAFE_LEFT, weight: 0, timeScale: 0.5, loopType: LoopRepeat, loopCount: Infinity },
        { name: CharacterAnimations.RUN_STRAFE_RIGHT, weight: 0, timeScale: 0.5, loopType: LoopRepeat, loopCount: Infinity },
    ];

    calculateWeights = (params: CalculateWeightsParams): void => {
        const { velocity, distanceFromGround } = params.movement;

        const maxWeight = distanceFromGround ? 0.5 : 1; // In Air wieght

        if (velocity.x > 0) {
            this.animations[2].weight = MathUtils.mapLinear(velocity.x, 0, 0.08, 0, maxWeight);
            this.animations[3].weight = 0;
        } else {
            this.animations[3].weight = MathUtils.mapLinear(velocity.x, 0, -0.08, 0, maxWeight);
            this.animations[2].weight = 0;
        }

        if (velocity.z > 0) {
            this.animations[0].weight = MathUtils.mapLinear(velocity.z, 0, 0.08, 0, maxWeight);
            this.animations[1].weight = 0;
        } else {
            this.animations[1].weight = MathUtils.mapLinear(velocity.z, 0, -0.08, 0, maxWeight);
            this.animations[0].weight = 0;
        }
    }
}
