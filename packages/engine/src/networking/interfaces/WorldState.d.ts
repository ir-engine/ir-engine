import { LifecycleValue } from "../../common/enums/LifecycleValue";
import { NumericalType } from "../../common/types/NumericalTypes";
import { InputAlias } from "../../input/types/InputAlias";
import { StateEntityGroup } from "../types/SnapshotDataTypes";
/** Interface for handling network input. */
export interface NetworkInputInterface {
    /** ID of network. */
    networkId: number;
    /** Button input received over the network. */
    buttons: Array<{
        input: InputAlias;
        value: NumericalType;
        lifecycleState: LifecycleValue;
    }>;
    /** Axes 1D input received over the network. */
    axes1d: Array<{
        input: InputAlias;
        value: NumericalType;
        lifecycleState: LifecycleValue;
    }>;
    /** Axes 2D input received over the network. */
    axes2d: Array<{
        input: InputAlias;
        value: NumericalType;
        lifecycleState: LifecycleValue;
    }>;
    /** Viewport vector of the client. */
    viewVector: {
        x: number;
        y: number;
        z: number;
    };
}
/** Interface for handling client network input. */
export interface NetworkClientInputInterface extends NetworkInputInterface {
    /** Time of the snapshot. */
    snapShotTime: number;
}
/** Interface for network client input packet. */
export interface PacketNetworkClientInputInterface extends PacketNetworkInputInterface {
    /** Time of the snapshot. */
    snapShotTime: number;
}
/** Interface for Client Data. */
export interface NetworkClientDataInterface {
    /** Id of the user. */
    userId: string;
}
/** Interface for network transform. */
export interface NetworkTransformsInterface {
    /** Id of the network. */
    networkId: number;
    /** Time of the snapshot. */
    snapShotTime: number;
    x: number;
    y: number;
    z: number;
    qX: number;
    qY: number;
    qZ: number;
    qW: number;
}
/** Interface to remove network object. */
export interface NetworkObjectRemoveInterface {
    /** Id of the network. */
    networkId: number;
}
/** Interface for creation of network object. */
export interface NetworkObjectCreateInterface {
    /** Id of the network. */
    networkId: number;
    /** Id of the owner. */
    ownerId: string;
    /** Type of prefab used to create this object. */
    prefabType: string | number;
    x: number;
    y: number;
    z: number;
    qX: number;
    qY: number;
    qZ: number;
    qW: number;
}
/** Interface for world state snapshot. */
export interface WorldStateSnapshot {
    /** Time of the snapshot. */
    time: number;
    /** ID of the snapshot. */
    id: string;
    /** State of the world while this snapshot is taken. */
    state: any[];
}
/** Interface for world state. */
export interface WorldStateInterface {
    /** Current world tick. */
    tick: number;
    /** transform of world. */
    transforms: StateEntityGroup;
    /** Inputs received. */
    inputs: NetworkInputInterface[];
    /** List of the states. */
    states: any[];
    /** List of connected clients. */
    clientsConnected: NetworkClientDataInterface[];
    /** List of disconnected clients. */
    clientsDisconnected: NetworkClientDataInterface[];
    /** List of created objects. */
    createObjects: NetworkObjectCreateInterface[];
    /** List of destroyed objects. */
    destroyObjects: NetworkObjectRemoveInterface[];
}
/** Interface for packet world state. */
export interface PacketWorldState {
    /** Tick of the world. */
    tick: number;
    /** transform of world. */
    transforms: NetworkTransformsInterface[];
    /** Inputs received. */
    inputs: PacketNetworkInputInterface[];
    /** List of the states. */
    states: any[];
    /** List of connected clients. */
    clientsConnected: NetworkClientDataInterface[];
    /** List of disconnected clients. */
    clientsDisconnected: NetworkClientDataInterface[];
    /** List of created objects. */
    createObjects: NetworkObjectCreateInterface[];
    /** List of destroyed objects. */
    destroyObjects: NetworkObjectRemoveInterface[];
}
/** Interface for handling packet network input. */
export interface PacketNetworkInputInterface {
    /** ID of the network. */
    networkId: number;
    /** Button input received over the network. */
    buttons: Array<{
        input: InputAlias;
        value: NumericalType;
        lifecycleState: LifecycleValue;
    }>;
    /** Axes 1D input received over the network. */
    axes1d: Array<{
        input: InputAlias;
        value: NumericalType;
        lifecycleState: LifecycleValue;
    }>;
    /** Axes 2D input received over the network. */
    axes2d: Array<{
        input: InputAlias;
        value: NumericalType;
        lifecycleState: LifecycleValue;
    }>;
    /** Viewport vector of the client. */
    viewVector: {
        x: number;
        y: number;
        z: number;
    };
}
