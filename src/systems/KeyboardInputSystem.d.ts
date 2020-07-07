import { System, Entity } from "ecsy";
import Switch from "../enums/Switch";
export default class KeyboardInputSystem extends System {
    private _userInput;
    execute(): void;
    mapKeyToAction(entity: Entity, key: string, value: Switch): any;
}
