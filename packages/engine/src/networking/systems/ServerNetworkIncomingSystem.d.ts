import { System } from '../../ecs/classes/System';
import { SystemUpdateType } from '../../ecs/functions/SystemUpdateType';
import { NetworkSchema } from "../interfaces/NetworkSchema";
/** System class to handle incoming messages. */
export declare class ServerNetworkIncomingSystem extends System {
    /** Input component of the system. */
    private _inputComponent;
    /** Update type of this system. **Default** to
       * {@link ecs/functions/SystemUpdateType.SystemUpdateType.Fixed | Fixed} type. */
    updateType: SystemUpdateType;
    /** Indication of whether the system is on server or on client. */
    isServer: any;
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
    /** Queries of the system. */
    static queries: any;
}
