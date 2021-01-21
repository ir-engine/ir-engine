import { Vector3, MathUtils } from "three";
import { CharacterAnimationsIds } from "../CharacterAnimationsIds";
import { RUN_SPEED, RUN_START_SPEED, WALK_SPEED, WALK_START_SPEED } from "../components/CharacterComponent";

const {
    WALK_FORWARD, WALK_BACKWARD, WALK_STRAFE_LEFT, WALK_STRAFE_RIGHT,
    RUN_FORWARD, RUN_BACKWARD, RUN_STRAFE_LEFT, RUN_STRAFE_RIGHT
} = CharacterAnimationsIds;

interface AnimationWeightScaleInterface {
    weight: number
    timeScale: number
}

// speed - what speed is represented by walk animation
// TODO: move speed into animation config
const animationAxisSpeed = [
    { animationId: WALK_FORWARD, axis: 'z', speed: 2.2, range: [ 0, 1 ], run: false },
    { animationId: WALK_BACKWARD, axis: 'z', speed: 1.5, range: [ -1, 0 ], run: false },
    { animationId: WALK_STRAFE_LEFT, axis: 'x', speed: 2.2, range: [ 0, 1 ], run: false },
    { animationId: WALK_STRAFE_RIGHT, axis: 'x', speed: 2.2, range: [ -1, 0 ], run: false },
    { animationId: RUN_FORWARD, axis: 'z', speed: 6, range: [ 0, 1 ], run: true },
    { animationId: RUN_BACKWARD, axis: 'z', speed: 5, range: [ -1, 0 ], run: true },
    { animationId: RUN_STRAFE_LEFT, axis: 'x', speed: 6, range: [ 0, 1 ], run: true },
    { animationId: RUN_STRAFE_RIGHT, axis: 'x', speed: 6, range: [ -1, 0 ], run: true },
];

function getWeights(absSpeed): { idle: number, walk: number, run: number } {
    const speeds = {
        idle: 1,
        walk: 0,
        run: 0
    };

    if (absSpeed > 0) {
        speeds.idle = 0;
        // idle|   idle  +  walk     |    walk      |    walk + run     |   run
        // 0   | > WALK_START_SPEED  | > WALK_SPEED | > RUN_START_SPEED | > RUN_SPEED
        if (absSpeed <= WALK_START_SPEED) {
            speeds.walk = MathUtils.smoothstep(absSpeed, 0, WALK_START_SPEED);
            speeds.idle = 1 - speeds.walk;
        } else if (absSpeed <= WALK_SPEED) {
            speeds.walk = 1;
        } else if (absSpeed <= RUN_START_SPEED) {
            speeds.run = MathUtils.smoothstep(absSpeed, WALK_SPEED, RUN_START_SPEED);
            speeds.walk = 1 - speeds.run;
        } else {
            speeds.run = 1;
        }
    }

    return speeds;
}

export const getMovingAnimationsByVelocity = (localSpaceVelocity: Vector3): Map<number, AnimationWeightScaleInterface> => {
    const animations = new Map<number, AnimationWeightScaleInterface>();
    const direction = localSpaceVelocity.clone().normalize();

    const stateWeights = getWeights(localSpaceVelocity.length());

    animationAxisSpeed.forEach(animationWeightsConfig => {
        const { animationId, axis, speed, range, run: isRun } = animationWeightsConfig;

        let timeScale = 1;
        let weight = Math.abs(MathUtils.clamp(direction[axis], range[0], range[1]));
        if (weight) {
            /*
             if animation is not playing (weight === 0), there is no need to calculate all this
             */
            // calc influence of each animation by it's weight
            const absSpeed = Math.abs(localSpaceVelocity[axis]);

            weight *= isRun ? stateWeights.run : stateWeights.walk;
            timeScale = absSpeed / speed;
            if (timeScale < 0.001) {
                weight = 0;
                timeScale = 0;
            }
        }

        animations.set(animationId, { weight, timeScale });
    });

    animations.set(CharacterAnimationsIds.IDLE, { weight: stateWeights.idle, timeScale: 1 });

    // console.log('active anims', Array.from(animations).filter(value => {
    //     const [ animationId, weights ] = value;
    //     return weights.weight > 0.001;
    // }).map(value => CharacterAnimationsIds[value[0]] + '(' + (value[1].weight.toFixed(3)) + ')').join(','));

    return animations;
};