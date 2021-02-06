import { Component } from '../../ecs/classes/Component';
/** Component class for network objects. */
export declare class NetworkObject extends Component<NetworkObject> {
    /** Network id of the object. */
    networkId: number;
    /** Owner id of the object. */
    ownerId: string;
    /** Map of components associated with this object. */
    componentMap: any;
    /** Snapshot time of the object. */
    snapShotTime: any;
}
