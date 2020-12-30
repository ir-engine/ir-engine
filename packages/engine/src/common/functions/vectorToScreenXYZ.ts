import { Camera, Vector3 } from "three";

/**
* convert 3D coordinates into 2D
* @param x
* @param y
* @param vector
* @param camera
* @param width
* @param height
*/
export function vectorToScreenXYZ (vector: Vector3, camera: Camera, width: number, height: number): { x: number; y: number } {
const vectorOut = vector.clone();
const widthHalf = (width / 2);
const heightHalf = (height / 2);
vectorOut.project(camera);
vectorOut.x = (vectorOut.x * widthHalf) + widthHalf;
vectorOut.y = - (vectorOut.y * heightHalf) + heightHalf;
return vectorOut;
}