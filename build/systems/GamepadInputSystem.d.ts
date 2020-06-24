import { System } from "ecsy";
import { InputState } from "../components/InputState";
import { GamepadInputState } from "../components/GamepadInputState";
export declare class GamepadInputSystem extends System {
    debug: boolean;
    execute(delta: number, time: number): void;
    _scan_gamepads(gp: GamepadInputState, inp: InputState): void;
    scan_x(gp: GamepadInputState, x: number, input: InputState): void;
    scan_y(gp: GamepadInputState, y: number, input: InputState): void;
}
