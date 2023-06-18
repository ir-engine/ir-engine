/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/EtherealEngine/etherealengine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Ethereal Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Ethereal Engine team.

All portions of the code written by the Ethereal Engine team are Copyright © 2021-2023 
Ethereal Engine. All Rights Reserved.
*/

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
