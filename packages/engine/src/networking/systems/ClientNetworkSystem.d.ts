import { System } from '../../ecs/classes/System';
import { SystemUpdateType } from '../../ecs/functions/SystemUpdateType';
import { NetworkSchema } from "../interfaces/NetworkSchema";
/** System class for network system of client. */
export declare class ClientNetworkSystem extends System {
    /** Update type of this system. **Default** to
       * {@link ecs/functions/SystemUpdateType.SystemUpdateType.Fixed | Fixed} type. */
    updateType: SystemUpdateType;
    /**
     * Constructs the system. Adds Network Components, initializes transport and initializes server.
     * @param attributes Attributes to be passed to super class constructor.
     */
    constructor(attributes: {
        schema: NetworkSchema;
        app: any;
    });
    /**
     * Executes the system.\
     * Call logic based on whether system is on the server or on the client.
     *
     * @param delta Time since last frame.
     */
    execute: (delta: number) => void;
    /** Queries for the system. */
    static queries: any;
}
