import { Quat } from "../../networking/types/SnapshotDataTypes";
export declare const lerp: (start: number, end: number, t: number) => number;
export declare const degreeLerp: (start: number, end: number, t: number) => any;
export declare const radianLerp: (start: number, end: number, t: number) => any;
export declare const quatSlerp: (qa: Quat, qb: Quat, t: number) => Quat;
