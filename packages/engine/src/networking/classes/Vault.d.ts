import { ID, Snapshot } from '../types/SnapshotDataTypes';
/**
 * Component class for Snapshot interpolation.\
 * Snapshot is based on this {@link https://github.com/geckosio/snapshot-interpolation | library by yandeu}.
 */
export declare class Vault {
    /** Static instance for Component. */
    static instance: Vault;
    /** Span shot vault to store snapshots. */
    vault: Snapshot[];
    /** Size of the vault. */
    vaultSize: number;
    /**
     * Get a Snapshot by its ID.
     * @param id ID of the snapshot.
     * @returns Snapshot of given ID.
     */
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
    /**
     * Add a snapshot to the vault.
     * @param snapshot Snapshot to be added in vault.
     */
    add(snapshot: Snapshot): void;
    /**
     * Get the current capacity (size) of the vault.
     * @returns Current capacity (size) of the vault.
     */
    get size(): number;
    /**
     * Set the max capacity (size) of the vault.
     * @param size New Max capacity of vault.
     */
    setMaxSize(size: number): void;
    /**
     * Get the max capacity (size) of the vault.
     * @returns Max capacity o the vault.
     */
    getMaxSize(): number;
}
