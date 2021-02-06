import { Quat } from '../../networking/types/SnapshotDataTypes';
/**
 * Find Interpolation between 2 number.
 * @param start Number from which to interpolate.
 * @param end Number to which to interpolate.
 * @param t How far to interpolate from start.
 * @returns Interpolation between start and end.
 */
export declare const lerp: (start: number, end: number, t: number) => number;
/**
 * Find Interpolation between 2 degree angles.
 * @param start Degree from which to interpolate.
 * @param end Degree to which to interpolate.
 * @param t How far to interpolate from start.
 * @returns Interpolation between start and end.
 */
export declare const degreeLerp: (start: number, end: number, t: number) => number;
/**
 * Find Interpolation between 2 radian angles.
 * @param start Radian from which to interpolate.
 * @param end Radian to which to interpolate.
 * @param t How far to interpolate from start.
 * @returns Interpolation between start and end.
 */
export declare const radianLerp: (start: number, end: number, t: number) => number;
/**
 * Find Interpolation between 2 quaternion.
 * @param start Quaternion from which to interpolate.
 * @param end Quaternion to which to interpolate.
 * @param t How far to interpolate from start.
 * @returns Interpolation between start and end.
 */
export declare const quatSlerp: (qa: Quat, qb: Quat, t: number) => any;
/**
 * Returns values which will be clamped if goes out of minimum and maximum range.
 * @param value Value to be clamped.
 * @param min Minimum boundary value.
 * @param max Maximum boundary value.
 * @returns Clamped value.
 */
export declare const clamp: (value: number, min: number, max: number) => number;
