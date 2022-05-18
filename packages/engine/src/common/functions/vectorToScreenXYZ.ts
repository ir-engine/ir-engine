import { Camera, Vector3 } from 'three'

/**
 * convert 3D coordinates into 2D.
 * @param vector 3D Coordinates.
 * @param camera Camera Object.
 * @param width Width of view.
 * @param height Height of view.
 * @returns 2D Coordinates of Given 3D Coordinates.
 */
export function vectorToScreenXYZ(vector: Vector3, camera: Camera, width: number, height: number): Vector3 {
  const vectorOut = vector.clone()
  const widthHalf = width / 2
  const heightHalf = height / 2
  vectorOut.project(camera)
  vectorOut.x = vectorOut.x * widthHalf + widthHalf
  vectorOut.y = -(vectorOut.y * heightHalf) + heightHalf
  return vectorOut
}
