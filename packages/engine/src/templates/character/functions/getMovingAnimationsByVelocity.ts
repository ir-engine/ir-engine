import { Vector3, MathUtils } from "three";
import { CharacterAnimationsIds } from "../CharacterAnimationsIds";
import { RUN_SPEED, WALK_SPEED } from "../components/CharacterComponent";

const {
    WALK_FORWARD, WALK_BACKWARD, WALK_STRAFE_LEFT, WALK_STRAFE_RIGHT,
    RUN_FORWARD, RUN_BACKWARD, RUN_STRAFE_LEFT, RUN_STRAFE_RIGHT
} = CharacterAnimationsIds;

interface AnimationWithTimeScaleAndWeight {
    name: string,
    weight: number,
    timeScale: number
}

interface AnimationWeightScaleInterface {
    weight: number
    timeScale: number
}

interface InterfaceMovingAnimationsWeights {
    [key:number]: AnimationWeightScaleInterface
}

const animationAxisSpeed = [
    { animationId: WALK_FORWARD, axis: 'z', range: [ 0, 1 ], run: false },
    { animationId: WALK_BACKWARD, axis: 'z', range: [ -1, 0 ], run: false },
    { animationId: WALK_STRAFE_LEFT, axis: 'x', range: [ 0, 1 ], run: false },
    { animationId: WALK_STRAFE_RIGHT, axis: 'x', range: [ -1, 0 ], run: false },
    { animationId: RUN_FORWARD, axis: 'z', range: [ 0, 1 ], run: true },
    { animationId: RUN_BACKWARD, axis: 'z', range: [ -1, 0 ], run: true },
    { animationId: RUN_STRAFE_LEFT, axis: 'x', range: [ 0, 1 ], run: true },
    { animationId: RUN_STRAFE_RIGHT, axis: 'x', range: [ -1, 0 ], run: true },
];

export const getMovingAnimationsByVelocity = (localSpaceVelocity: Vector3): Map<number, AnimationWeightScaleInterface> => {
    const animations = new Map<number, AnimationWeightScaleInterface>();
    const direction = localSpaceVelocity.clone().normalize();

    animationAxisSpeed.forEach(animationConfig => {
        const { animationId, axis, range, run: isRun } = animationConfig;

        let timeScale = 1;
        let weight = Math.abs(MathUtils.clamp(direction[axis], range[0], range[1]));
        if (weight) {
            /*
             if animation is not playing (weight === 0), there is no need to calculate all this
             */
            // calc influence of each animation by it's weight
            const absSpeed = Math.abs(localSpaceVelocity[axis]);
            const runWeight = MathUtils.smoothstep(absSpeed, WALK_SPEED, RUN_SPEED);
            const walkWeight = 1 - runWeight;
            weight *= isRun ? runWeight : walkWeight;
            timeScale = absSpeed / (isRun? RUN_SPEED : WALK_SPEED);
        }

        animations.set(animationId, { weight, timeScale });
    });

    return animations;
};