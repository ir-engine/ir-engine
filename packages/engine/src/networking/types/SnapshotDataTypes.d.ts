export declare type Value = number | string | Quat | undefined;
export interface StateEntity {
    id: string;
    [key: string]: Value;
}
export declare type ID = string;
export declare type Time = number;
export declare type State = StateEntity[];
export interface Snapshot {
    id: ID;
    time: Time;
    state: State | {
        [key: string]: State;
    };
}
export interface InterpolatedSnapshot {
    state: State;
    percentage: number;
    older: ID;
    newer: ID;
}
export declare type Quat = {
    x: number;
    y: number;
    z: number;
    w: number;
};
