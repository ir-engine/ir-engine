export declare type Value = number | string | Quat | undefined;
export interface StateEntity {
    networkId: number;
    x: number;
    y: number;
    z: number;
    qX: number;
    qY: number;
    qZ: number;
    qW: number;
    snapShotTime: number;
}
export interface StateClientEntity {
    networkId: number;
    x: number;
    y: number;
    z: number;
    qX: number;
    qY: number;
    qZ: number;
    qW: number;
}
export declare type ID = string;
export declare type Time = number;
export declare type StateEntityGroup = StateEntity[];
export declare type StateEntityClientGroup = StateClientEntity[];
export interface Snapshot {
    id: ID;
    time: Time;
    state: StateEntityGroup;
    timeCorrection: number;
}
export interface InterpolatedSnapshot {
    state: StateEntityGroup;
    percentage: number;
    older: ID;
    newer: ID;
}
export interface Quat {
    x: number;
    y: number;
    z: number;
    w: number;
}
