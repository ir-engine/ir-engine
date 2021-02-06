import { Object3D } from 'three';
import { Entity } from '../../ecs/classes/Entity';
import { System } from '../../ecs/classes/System';
import { SystemUpdateType } from '../../ecs/functions/SystemUpdateType';
/** System class for Asset loading. */
export default class AssetLoadingSystem extends System {
    /** Update type of the system. **Default** value is
     *    {@link ecs/functions/SystemUpdateType.SystemUpdateType.Fixed | Fixed} type.  */
    updateType: SystemUpdateType;
    /** Map holding loaded Assets. */
    loaded: Map<Entity, Object3D>;
    /** Loading asset count. */
    loadingCount: number;
    /** Constructs Asset loading system. */
    constructor();
    /** Execute the system. */
    execute(): void;
}
