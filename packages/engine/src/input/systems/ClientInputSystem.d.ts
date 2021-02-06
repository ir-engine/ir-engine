import { System } from '../../ecs/classes/System';
import { SystemUpdateType } from "../../ecs/functions/SystemUpdateType";
export declare class InputSystem extends System {
    updateType: SystemUpdateType;
    private _inputComponent;
    private localUserMediaStream;
    private useWebXR;
    mainControllerId: any;
    secondControllerId: any;
    private readonly boundListeners;
    private entityListeners;
    constructor({ useWebXR }: {
        useWebXR: any;
    });
    dispose(): void;
    /**
     *
     * @param {Number} delta Time since last frame
     */
    execute(delta: number): void;
}
