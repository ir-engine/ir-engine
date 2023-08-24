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

import { LEFT, RIGHT, Results, Side } from '../Types'
import { clamp } from '../utils/helpers'
import Vector from '../utils/vector'

/**
 * Calculates arm rotation as euler angles
 * @param {Array} lm : array of 3D pose vectors from tfjs or mediapipe
 */
export const calcArms = (lm: Results) => {
  //Pure Rotation Calculations
  const UpperArm = {
    r: Vector.findRotation(lm[11], lm[13]),
    l: Vector.findRotation(lm[12], lm[14])
  }
  UpperArm.r.y = Vector.angleBetween3DCoords(lm[12], lm[11], lm[13])
  UpperArm.l.y = Vector.angleBetween3DCoords(lm[11], lm[12], lm[14])

  const LowerArm = {
    r: Vector.findRotation(lm[13], lm[15]),
    l: Vector.findRotation(lm[14], lm[16])
  }
  LowerArm.r.y = Vector.angleBetween3DCoords(lm[11], lm[13], lm[15])
  LowerArm.l.y = Vector.angleBetween3DCoords(lm[12], lm[14], lm[16])
  LowerArm.r.z = clamp(LowerArm.r.z, -2.14, 0)
  LowerArm.l.z = clamp(LowerArm.l.z, -2.14, 0)
  const Hand = {
    r: Vector.findRotation(
      Vector.fromArray(lm[15]),
      Vector.lerp(Vector.fromArray(lm[17]), Vector.fromArray(lm[19]), 0.5)
    ),
    l: Vector.findRotation(
      Vector.fromArray(lm[16]),
      Vector.lerp(Vector.fromArray(lm[18]), Vector.fromArray(lm[20]), 0.5)
    )
  }

  //Modify Rotations slightly for more natural movement
  const rightArmRig = rigArm(UpperArm.r, LowerArm.r, Hand.r, RIGHT)
  const leftArmRig = rigArm(UpperArm.l, LowerArm.l, Hand.l, LEFT)

  return {
    //Scaled
    UpperArm: {
      r: rightArmRig.UpperArm,
      l: leftArmRig.UpperArm
    },
    LowerArm: {
      r: rightArmRig.LowerArm,
      l: leftArmRig.LowerArm
    },
    Hand: {
      r: rightArmRig.Hand,
      l: leftArmRig.Hand
    }
  }
}

/**
 * Converts normalized rotation values into radians clamped by human limits
 * @param {Object} UpperArm : normalized rotation values
 * @param {Object} LowerArm : normalized rotation values
 * @param {Object} Hand : normalized rotation values
 * @param {Side} side : left or right
 */
export const rigArm = (UpperArm: Vector, LowerArm: Vector, Hand: Vector, side: Side = RIGHT) => {
  // Invert modifier based on left vs right side
  const invert = side === RIGHT ? 1 : -1

  UpperArm.z *= -2.3 * invert
  //Modify UpperArm rotationY  by LowerArm X and Z rotations
  UpperArm.y *= Math.PI * invert
  UpperArm.y -= Math.max(LowerArm.x)
  UpperArm.y -= -invert * Math.max(LowerArm.z, 0)
  UpperArm.x -= 0.3 * invert

  LowerArm.z *= -2.14 * invert
  LowerArm.y *= 2.14 * invert
  LowerArm.x *= 2.14 * invert

  //Clamp values to human limits
  UpperArm.x = clamp(UpperArm.x, -0.5, Math.PI)
  LowerArm.x = clamp(LowerArm.x, -0.3, 0.3)

  Hand.y = clamp(Hand.z * 2, -0.6, 0.6) //side to side
  Hand.z = Hand.z * -2.3 * invert //up down

  return {
    //Returns Values in Radians for direct 3D usage
    UpperArm: UpperArm,
    LowerArm: LowerArm,
    Hand: Hand
  }
}
