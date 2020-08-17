import { System } from "../../ecs/classes/System";
export declare class StateSystem extends System {
    init(): void;
    private _state;
    private _args;
    execute(delta: number, time: number): void;
    private callBehaviors;
}
