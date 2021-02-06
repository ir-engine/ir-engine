import { System, SystemAttributes } from '../../ecs/classes/System';
import { SystemUpdateType } from '../../ecs/functions/SystemUpdateType';
/** System Class for Highlight system.\
 * This system will highlight the entity with {@link effects/components/HighlightComponent.HighlightComponent | Highlight} Component attached.
 */
export declare class HighlightSystem extends System {
    /** Update type of the system. **Default** value is
     * {@link ecs/functions/SystemUpdateType.SystemUpdateType.Fixed | Fixed} type.
     */
    updateType: SystemUpdateType;
    /** Constructs Highlight system. */
    constructor(attributes?: SystemAttributes);
    /** Executes the system. */
    execute(deltaTime: any, time: any): void;
}
