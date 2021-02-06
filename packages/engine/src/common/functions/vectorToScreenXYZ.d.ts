import { Camera, Vector3 } from "three";
/**
 * convert 3D coordinates into 2D.
 * @param vector 3D Coordinates.
 * @param camera Camera Object.
 * @param width Width of view.
 * @param height Height of view.
 * @returns 2D Coordinates of Given 3D Coordinates.
 */
export declare function vectorToScreenXYZ(vector: Vector3, camera: Camera, width: number, height: number): Vector3;
