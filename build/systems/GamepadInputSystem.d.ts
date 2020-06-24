import { System } from "ecsy";
import { InputState } from "../components/InputState";
import { GamepadInputState } from "../components/GamepadInputState";
export declare class GamepadInputSystem extends System {
    set debug(debug: boolean);
    queries: {
        gamepad: {
            components: (typeof GamepadInputState | typeof InputState)[];
            listen: {
                added: boolean;
                removed: boolean;
            };
            added: any[];
            results: any[];
        };
    };
    execute(delta: number, time: number): void;
    _scan_gamepads(gp: GamepadInputState, inp: InputState): void;
    scan_x(gp: GamepadInputState, x: number, input: InputState): void;
    scan_y(gp: GamepadInputState, y: number, input: InputState): void;
}
