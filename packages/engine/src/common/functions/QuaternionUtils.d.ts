/** Interface for quaternion Axis. */
export interface quatAxis {
    x: number;
    y: number;
    z: number;
    w: number;
}
export declare function vector4ArrayToAxisObject(q: number[]): quatAxis;
export declare function pitchFromQuaternion(q: number[]): number;
export declare function rollFromQuaternion(q: number[]): number;
export declare function yawFromQuaternion(q: number[]): number;
