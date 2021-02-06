import { System } from "../../ecs/classes/System";
export declare class DebugHelpersSystem extends System {
    private helpersByEntity;
    constructor();
    execute(delta: number, time: number): void;
}
