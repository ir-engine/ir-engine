import { System } from "ecsy";
import { KeyboardInputState } from "../components/KeyboardInputState";
export declare class KeyboardInputSystem extends System {
    debug: boolean;
    kb: any;
    inp: any;
    execute(delta: number, time: number): void;
    setKeyState(kb: KeyboardInputState, key: string, value: string): any;
    getKeyState(kb: KeyboardInputState, key: string): any;
    isPressed(kb: KeyboardInputState, name: string): boolean;
}
