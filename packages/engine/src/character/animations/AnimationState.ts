import { AnimationAction, AnimationActionLoopStyles, AnimationClip, LoopOnce, LoopRepeat, MathUtils } from "three"
import { MovementType } from "./MovingAnimations";

export enum AnimationType {
    STATIC,
    VELOCITY_BASED,
}

export interface Animation {
	name: string;
	weight: number;
    loopType: AnimationActionLoopStyles;
    loopCount?: number;
    timeScale?: number;
    clip?: AnimationClip;
    decorateAction?: (action: AnimationAction) => void;
}

export interface AnimationState {
	name: string;
    type: AnimationType;
	nextStates: AnimationState[];
	animations: Animation[];
	calculateWeights?: (movement: MovementType) => void;
}

export const CharacterStates = {
    DEFAULT: 'DEFAULT',
    IDLE: 'IDLE',
    WALK: 'WALK',
    RUN: 'RUN',
    JUMP: 'JUMP',
    INTERACTING: 'INTERACTING',
    ENTERING_VEHICLE: 'ENTERING_VEHICLE',
    EXITING_VEHICLE_DRIVER: 'EXITING_VEHICLE_DRIVER',
    EXITING_VEHICLE_PASSENGER: 'EXITING_VEHICLE_PASSENGER',
}

class EnteringVehicleState implements AnimationState {
    name = CharacterStates.ENTERING_VEHICLE;
    type = AnimationType.STATIC;
    nextStates = [];
    animations: Animation[] = [
        { name: 'vehicle_enter_driver', weight: 0, timeScale: 1, loopType: LoopOnce, decorateAction: function(action: AnimationAction) {
            action.setLoop(this.loopType, this.loopCount);
            action.clampWhenFinished = true;
        } },
        { name: 'vehicle_enter_passenger', weight: 0, timeScale: 1, loopType: LoopOnce, }
    ];
}

class IdleState implements AnimationState {
    name = CharacterStates.IDLE;
    type = AnimationType.VELOCITY_BASED;
    nextStates = [];
    animations: Animation[] = [
        { name: 'idle', weight: 1, timeScale: 0.6, loopType: LoopRepeat, loopCount: Infinity }
    ];
}

class WalkState implements AnimationState {
    name = CharacterStates.WALK;
    type = AnimationType.VELOCITY_BASED;
    nextStates = [];
    animations: Animation[] = [
        { name: 'walk_forward', weight: 0, timeScale: 0.6, loopType: LoopRepeat, loopCount: Infinity },
        { name: 'walk_backward', weight: 0, timeScale: 0.6, loopType: LoopRepeat, loopCount: Infinity },
        { name: 'walk_left', weight: 0, timeScale: 0.6, loopType: LoopRepeat, loopCount: Infinity },
        { name: 'walk_right', weight: 0, timeScale: 0.6, loopType: LoopRepeat, loopCount: Infinity },
    ];

    calculateWeights = (movement: MovementType): void => {
        const { velocity, distanceFromGround } = movement;

        const maxWeight = distanceFromGround ? 0.5 : 1; // In Air wieght

        if (velocity.x > 0) {
            this.animations[2].weight = MathUtils.mapLinear(velocity.x, 0, 0.04, 0, maxWeight);
            this.animations[3].weight = 0;
        } else {
            this.animations[3].weight = MathUtils.mapLinear(velocity.x, 0, -0.04, 0, maxWeight);
            this.animations[2].weight = 0;
        }

        if (velocity.z > 0) {
            this.animations[0].weight = MathUtils.mapLinear(velocity.z, 0, 0.04, 0, maxWeight);
            this.animations[1].weight = 0;
        } else {
            this.animations[1].weight = MathUtils.mapLinear(velocity.z, 0, -0.04, 0, maxWeight);
            this.animations[0].weight = 0;
        }
    }
}

class RunState implements AnimationState {
    name = CharacterStates.RUN;
    type = AnimationType.VELOCITY_BASED;
    nextStates = [];
    animations: Animation[] = [
        { name: 'run_forward', weight: 0, timeScale: 0.5, loopType: LoopRepeat, loopCount: Infinity },
        { name: 'run_backward', weight: 0, timeScale: 0.5, loopType: LoopRepeat, loopCount: Infinity },
        { name: 'run_left', weight: 0, timeScale: 0.5, loopType: LoopRepeat, loopCount: Infinity },
        { name: 'run_right', weight: 0, timeScale: 0.5, loopType: LoopRepeat, loopCount: Infinity },
    ];

    calculateWeights = (movement: MovementType): void => {
        const { velocity, distanceFromGround } = movement;

        const maxWeight = distanceFromGround ? 0.5 : 1; // In Air wieght

        if (velocity.x > 0) {
            this.animations[2].weight = MathUtils.mapLinear(velocity.x, 0, 0.1, 0, maxWeight);
            this.animations[3].weight = 0;
        } else {
            this.animations[3].weight = MathUtils.mapLinear(velocity.x, 0, -0.1, 0, maxWeight);
            this.animations[2].weight = 0;
        }

        if (velocity.z > 0) {
            this.animations[0].weight = MathUtils.mapLinear(velocity.z, 0, 0.1, 0, maxWeight);
            this.animations[1].weight = 0;
        } else {
            this.animations[1].weight = MathUtils.mapLinear(velocity.z, 0, -0.1, 0, maxWeight);
            this.animations[0].weight = 0;
        }
    }
}

type AnimationStateGraphType = {
    [key: string]: AnimationState;
}

export const AnimationStateGraph: AnimationStateGraphType = {
    [CharacterStates.IDLE]: new IdleState(),
    [CharacterStates.WALK]: new WalkState(),
    [CharacterStates.RUN]: new RunState(),
    [CharacterStates.DEFAULT]: new IdleState(),
    [CharacterStates.ENTERING_VEHICLE]: new EnteringVehicleState(),
}

AnimationStateGraph[CharacterStates.IDLE].nextStates.push(...[
    AnimationStateGraph[CharacterStates.RUN],
    AnimationStateGraph[CharacterStates.WALK],
]);

AnimationStateGraph[CharacterStates.RUN].nextStates.push(...[
    AnimationStateGraph[CharacterStates.IDLE],
    AnimationStateGraph[CharacterStates.WALK],
]);

AnimationStateGraph[CharacterStates.WALK].nextStates.push(...[
    AnimationStateGraph[CharacterStates.RUN],
    AnimationStateGraph[CharacterStates.IDLE],
]);