import { System } from "ecsy";
import { InputState } from "../components/InputState";
import { MouseInputState } from "../components/MouseInputState";
export declare class MouseInputSystem extends System {
    queries: {
        mouse: {
            components: (typeof MouseInputState | typeof InputState)[];
            listen: {
                added: boolean;
                removed: boolean;
            };
            added: any[];
            results: any[];
            removed: any[];
        };
    };
    set debug(debug: boolean);
    execute(delta: number, time: number): void;
}
