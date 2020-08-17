import { InterpolatedSnapshot, Snapshot, State } from "../types/SnapshotDataTypes";
export declare function snapshot(): {
    /** Create the snapshot on the server. */
    create: (state: State | {
        [key: string]: State;
    }) => Snapshot;
    /** Add the snapshot you received from the server to automatically calculate the interpolation with calcInterpolation() */
    add: (snapshot: Snapshot) => void;
};
/** Create a new Snapshot */
export declare function CreateSnapshot(state: State | {
    [key: string]: State;
}): Snapshot;
export declare function addSnapshot(snapshot: Snapshot): void;
export declare function interpolate(snapshotA: Snapshot, snapshotB: Snapshot, timeOrPercentage: number, parameters: string, deep: string): InterpolatedSnapshot;
/** Get the calculated interpolation on the client. */
export declare function calcInterpolation(parameters: string, deep?: string): InterpolatedSnapshot | undefined;
