import { System } from "ecsy";
export default class StateSystem extends System {
    private _state;
    private _args;
    execute(delta: number, time: number): void;
    private callBehaviors;
}
