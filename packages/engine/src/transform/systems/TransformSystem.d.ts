import { System } from '../../ecs/classes/System';
import { SystemUpdateType } from '../../ecs/functions/SystemUpdateType';
export declare class TransformSystem extends System {
    updateType: SystemUpdateType;
    execute(delta: any): void;
}
