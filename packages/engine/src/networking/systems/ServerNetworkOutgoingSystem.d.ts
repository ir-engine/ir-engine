import { System } from '../../ecs/classes/System';
import { SystemUpdateType } from '../../ecs/functions/SystemUpdateType';
import { NetworkSchema } from "../interfaces/NetworkSchema";
/** System class to handle outgoing messages. */
export declare class ServerNetworkOutgoingSystem extends System {
    /** Update type of this system. **Default** to
     * {@link ecs/functions/SystemUpdateType.SystemUpdateType.Fixed | Fixed} type. */
    updateType: SystemUpdateType;
    /**
     * Constructs the system.
     * @param attributes Attributes to be passed to super class constructor.
     */
    constructor(attributes: {
        schema: NetworkSchema;
        app: any;
    });
    /** Call execution on server */
    execute: (delta: number) => void;
    /** System queries. */
    static queries: any;
}
