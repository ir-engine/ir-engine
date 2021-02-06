import { NetworkPrefab } from './NetworkPrefab';
/** Interface for Network schema. */
export interface NetworkSchema {
    /** Transporter of the message. */
    transport: any;
    /** List of supported message types. */
    messageTypes: {
        [key: string]: any;
    };
    /** Default prefab for the client. */
    defaultClientPrefab: string | number;
    /** Prefabs for the schema. */
    prefabs: {
        [key: string]: NetworkPrefab;
    };
}
