import * as THREE from 'three'

/**
 * Finds an angle between two vectors with a sign relative to normal vector.
 * @param v1 First Vector.
 * @param v2 Second Vector.
 * @param normal Normal Vector.
 * @param dotTreshold
 *
 * @returns Angle between two vectors.
 */
export function getSignedAngleBetweenVectors(
  v1: THREE.Vector3,
  v2: THREE.Vector3,
  normal: THREE.Vector3 = new THREE.Vector3(0, 1, 0),
  dotTreshold = 0.0005
): number {
  let angle = getAngleBetweenVectors(v1, v2, dotTreshold)

  // Get vector pointing up or down
  const cross = new THREE.Vector3().crossVectors(v1, v2)
  // Compare cross with normal to find out direction
  if (normal.dot(cross) < 0) {
    angle = -angle
  }

  return angle
}

/**
 * Finds an angle between two vectors with a sign relative to normal vector.
 * @param v1 First Vector.
 * @param v2 Second Vector.
 * @param dotTreshold
 *
 * @returns Angle between two vectors.
 */
function getAngleBetweenVectors(v1: THREE.Vector3, v2: THREE.Vector3, dotTreshold = 0.0005): number {
  let angle: number
  const dot = v1.dot(v2)

  // If dot is close to 1, we'll round angle to zero
  if (dot > 1 - dotTreshold) {
    angle = 0
  } else {
    // Dot too close to -1
    if (dot < -1 + dotTreshold) {
      angle = Math.PI
    } else {
      // Get angle difference in radians
      angle = Math.acos(dot)
    }
  }

  return angle
}
