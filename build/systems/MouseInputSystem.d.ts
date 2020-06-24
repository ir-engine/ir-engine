import { System } from "ecsy";
import { InputState } from "../components/InputState";
import { MouseInputState } from "../components/MouseInputState";
export declare class MouseInputSystem extends System {
    debug: boolean;
    mouse: MouseInputState;
    inp: InputState;
    execute(delta: number, time: number): void;
    downHandler: (e: any, mouse: MouseInputState) => void;
    moveHandler: (e: {
        clientX: number;
        clientY: number;
        timeStamp: any;
    }, mouse: MouseInputState) => void;
    upHandler: (e: any, mouse: MouseInputState) => void;
    setMouseState(key: string, value: string, mouse: MouseInputState): void;
    getMouseState(key: string, mouse: MouseInputState): any;
}
