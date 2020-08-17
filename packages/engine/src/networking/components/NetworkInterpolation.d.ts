import { Component } from "../../ecs/classes/Component";
import { ID, Snapshot } from "../types/SnapshotDataTypes";
/** A save place to store your snapshots. */
export declare class NetworkGameState extends Component<any> {
    static instance: NetworkGameState;
    vault: Snapshot[];
    vaultSize: number;
    timeOffset: number;
    _interpolationBuffer: number;
    /** The current server time based on the current snapshot interpolation. */
    serverTime: number;
    constructor();
    get interpolationBuffer(): {
        /** Get the Interpolation Buffer time in milliseconds. */
        get: () => number;
        /** Set the Interpolation Buffer time in milliseconds. */
        set: (milliseconds: number) => void;
    };
    /** Get a Snapshot by its ID. */
    getById(id: ID): Snapshot;
    /** Get the latest snapshot */
    get(): Snapshot | undefined;
    /** Get the two snapshots around a specific time */
    get(time: number): {
        older: Snapshot;
        newer: Snapshot;
    } | undefined;
    /** Get the closest snapshot to e specific time */
    get(time: number, closest: boolean): Snapshot | undefined;
    /** Add a snapshot to the vault. */
    add(snapshot: Snapshot): void;
    /** Get the current capacity (size) of the vault. */
    get size(): number;
    /** Set the max capacity (size) of the vault. */
    setMaxSize(size: number): void;
    /** Get the max capacity (size) of the vault. */
    getMaxSize(): number;
}
