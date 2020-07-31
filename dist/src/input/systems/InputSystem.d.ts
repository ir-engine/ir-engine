import { System } from "ecsy";
import Behavior from "../../common/interfaces/Behavior";
export default class InputSystem extends System {
    private _inputComponent;
    execute(delta: number): void;
}
export declare const handleInput: Behavior;
