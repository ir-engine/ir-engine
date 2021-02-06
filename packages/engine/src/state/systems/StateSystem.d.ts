import { Behavior } from '../../common/interfaces/Behavior';
import { System } from '../../ecs/classes/System';
import { SystemUpdateType } from '../../ecs/functions/SystemUpdateType';
export declare class StateSystem extends System {
    updateType: SystemUpdateType;
    private _state;
    private readonly _args;
    execute(delta: number): void;
}
export declare const callBehaviors: Behavior;
