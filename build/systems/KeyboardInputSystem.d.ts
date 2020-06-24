import { System } from "ecsy";
import { InputState } from "../components/InputState";
import { KeyboardInputState } from "../components/KeyboardInputState";
export declare class KeyboardInputSystem extends System {
    queries: {
        controls: {
            components: (typeof KeyboardInputState | typeof InputState)[];
            listen: {
                added: boolean;
                removed: boolean;
            };
            added: any[];
            results: any[];
        };
    };
    set debug(debug: boolean);
    execute(delta: number, time: number): void;
}
