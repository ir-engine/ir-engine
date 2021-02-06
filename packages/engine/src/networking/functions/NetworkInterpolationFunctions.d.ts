import { InterpolatedSnapshot, Snapshot, StateEntityGroup } from '../types/SnapshotDataTypes';
/** Get snapshot factory. */
export declare function snapshot(): any;
/**
 * Create a new Snapshot.
 * @param state State of the world or client to be stored in this snapshot.
 * @returns Newly created snapshot.
 */
export declare function createSnapshot(state: StateEntityGroup): Snapshot;
/**
 * Add snapshot into vault.
 * @param snapshot Snapshot to be added into the vault.
 */
export declare function addSnapshot(snapshot: Snapshot): void;
/**
 * Interpolate between two snapshots.
 * @param snapshotA First snapshot to interpolate from.
 * @param snapshotB Second snapshot to interpolate to.
 * @param timeOrPercentage How far to interpolate from first snapshot.
 * @param parameters On which param interpolation should be applied.
 * @param deep
 *
 * @returns Interpolated snapshot.
 */
export declare function interpolate(snapshotA: Snapshot, snapshotB: Snapshot, timeOrPercentage: number, parameters: string, deep: string): InterpolatedSnapshot;
/**
 * Get the calculated interpolation on the client.
 * @param parameters On which param interpolation should be applied.
 * @param arrayName
 *
 * @returns Interpolated snapshot.
 */
export declare function calculateInterpolation(parameters: string, arrayName?: string): InterpolatedSnapshot | undefined;
