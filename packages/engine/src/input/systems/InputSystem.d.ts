import { System } from "../../ecs/classes/System";
export declare class InputSystem extends System {
    readonly mainControllerId: any;
    readonly secondControllerId: any;
    private _inputComponent;
    private boundListeners;
    constructor();
    init(onVRSupportRequested: any): void;
    execute(delta: number): void;
}
