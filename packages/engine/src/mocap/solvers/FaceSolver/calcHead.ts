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

import { Results } from '../Types'
import Vector from '../utils/vector'
import { PI } from './../constants'

/**
 * Calculate stable plane (triangle) from 4 face landmarks
 * @param {Array} lm : array of results from tfjs or mediapipe
 */
export const createEulerPlane = (lm: Results) => {
  //create face detection square bounds
  const p1 = new Vector(lm[21]) //top left
  const p2 = new Vector(lm[251]) //top right
  const p3 = new Vector(lm[397]) //bottom right
  const p4 = new Vector(lm[172]) //bottom left
  const p3mid = p3.lerp(p4, 0.5) // bottom midpoint
  return {
    vector: [p1, p2, p3mid],
    points: [p1, p2, p3, p4]
  }
}

/**
 * Calculate roll, pitch, yaw, centerpoint, and rough dimentions of face plane
 * @param {Array} lm : array of results from tfjs or mediapipe
 */
export const calcHead = (lm: Results) => {
  // find 3 vectors that form a plane to represent the head
  const plane = createEulerPlane(lm).vector
  // calculate roll pitch and yaw from vectors
  const rotate = Vector.rollPitchYaw(plane[0], plane[1], plane[2])
  // find the center of the face detection box
  const midPoint = plane[0].lerp(plane[1], 0.5)
  // find the dimensions roughly of the face detection box
  const width = plane[0].distance(plane[1])
  const height = midPoint.distance(plane[2])
  //flip
  rotate.x *= -1
  rotate.z *= -1

  return {
    //defaults to radians for rotation around x,y,z axis
    y: rotate.y * PI, //left right
    x: rotate.x * PI, //up down
    z: rotate.z * PI, //side to side
    width: width,
    height: height,
    //center of face detection square
    position: midPoint.lerp(plane[2], 0.5),
    //returns euler angles normalized between -1 and 1
    normalized: {
      y: rotate.y,
      x: rotate.x,
      z: rotate.z
    },
    degrees: {
      y: rotate.y * 180,
      x: rotate.x * 180,
      z: rotate.z * 180
    }
  }
}
