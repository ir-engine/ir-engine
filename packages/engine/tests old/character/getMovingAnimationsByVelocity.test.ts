import { getMovingAnimationsByVelocity } from "../../../src/character/functions/getMovingAnimationsByVelocity";
import { MathUtils, Vector3 } from "three";
import { WALK_SPEED, RUN_SPEED } from "../../../src/character/components/CharacterComponent";
import { expect } from "@jest/globals";
import { CharacterAnimations } from "../../../src/character/CharacterAnimations";

describe('getMovingAnimationsByVelocity', () => {
    test("no move", () => {
        const animations = getMovingAnimationsByVelocity(new Vector3(0, 0, 0));
        animations.forEach(value => {
            expect(value.weight).toBe(0);
        });
    });
    test("forward", () => {
        const animations = getMovingAnimationsByVelocity(new Vector3(0, 0, WALK_SPEED));
        const walkAnimationConfig = animations.get(CharacterAnimations.WALK_FORWARD);
        expect(walkAnimationConfig.weight).toBe(1);
        expect(walkAnimationConfig.timeScale).toBe(1);
        animations.forEach((value, key) => {
            if (key === CharacterAnimations.WALK_FORWARD) {
                return;
            }
            expect(value.weight).toBe(0);
        });
    });

    test("forward run", () => {
        const animations = getMovingAnimationsByVelocity(new Vector3(0, 0, RUN_SPEED));
        const runAnimationConfig = animations.get(CharacterAnimations.RUN_FORWARD);
        expect(runAnimationConfig.weight).toBe(1);
        expect(runAnimationConfig.timeScale).toBe(1);
        animations.forEach((value, key) => {
            if (key === CharacterAnimations.RUN_FORWARD) {
                return;
            }
            expect(value.weight).toBe(0);
        });
    });

    test("forward mid walk to run", () => {
        const speed = MathUtils.lerp(WALK_SPEED, RUN_SPEED, 0.7);
        const animations = getMovingAnimationsByVelocity(new Vector3(0, 0, speed));
        const runAnimationConfig = animations.get(CharacterAnimations.RUN_FORWARD);
        expect(runAnimationConfig.weight).toBe(0.7839999999999996); // don't understand why smoothstep return this value...
        // expect(runAnimationConfig.timeScale).toBe(1);
        const walkAnimationConfig = animations.get(CharacterAnimations.WALK_FORWARD);
        expect(walkAnimationConfig.weight).toBe(1 - runAnimationConfig.weight);
        // expect(walkAnimationConfig.timeScale).toBe(1);
        animations.forEach((value, key) => {
            if (key === CharacterAnimations.WALK_FORWARD || key === CharacterAnimations.RUN_FORWARD) {
                return;
            }
            expect(value.weight).toBe(0);
        });
    });

    test("backward left mid walk to run", () => {
        const expectedValues = {
            [CharacterAnimations.WALK_FORWARD]: { weight: 0 },
            [CharacterAnimations.WALK_BACKWARD]: { weight: 0.15273506473629456 },
            [CharacterAnimations.WALK_STRAFE_LEFT]: { weight: 0.15273506473629456 },
            [CharacterAnimations.WALK_STRAFE_RIGHT]: { weight: 0 },
            [CharacterAnimations.RUN_FORWARD]: { weight: 0 },
            [CharacterAnimations.RUN_BACKWARD]: { weight: 0.554371716450253 },
            [CharacterAnimations.RUN_STRAFE_LEFT]: { weight: 0.554371716450253 },
            [CharacterAnimations.RUN_STRAFE_RIGHT]: { weight: 0 },
        };
        const speed = MathUtils.lerp(WALK_SPEED, RUN_SPEED, 0.7);
        const animations = getMovingAnimationsByVelocity(new Vector3(speed, 0, -speed));
        const values = {};
        animations.forEach((value, key) => {
            values[key] = { weight: value.weight };
        });
        expect(values).toMatchObject(expectedValues);
    });
});