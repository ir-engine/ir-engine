/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License") you may not use this file except in compliance
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

import { Vector3 } from 'three'

import { Landmark, POSE_LANDMARKS, POSE_LANDMARKS_LEFT, POSE_LANDMARKS_RIGHT } from '@mediapipe/holistic'
import { VRMHumanBoneName } from '@pixiv/three-vrm'
import { RestingDefault } from './solvers/utils/helpers'

import { calcArms } from './solvers/PoseSolver/calcArms'
import { calcLegs } from './solvers/PoseSolver/calcLegs'

// const POSE_LANDMARKS = {
//   NOSE: 0,
//   LEFT_EYE_INNER: 1,
//   LEFT_EYE: 2,
//   LEFT_EYE_OUTER: 3,
//   RIGHT_EYE_INNER: 4,
//   RIGHT_EYE: 5,
//   RIGHT_EYE_OUTER: 6,
//   LEFT_EAR: 7,
//   RIGHT_EAR: 8,
//   LEFT_RIGHT: 9,
//   RIGHT_LEFT: 10,
//   LEFT_SHOULDER: 11,
//   RIGHT_SHOULDER: 12,
//   LEFT_ELBOW: 13,
//   RIGHT_ELBOW: 14,
//   LEFT_WRIST: 15,
//   RIGHT_WRIST: 16,
//   LEFT_PINKY: 17,
//   RIGHT_PINKY: 18,
//   LEFT_INDEX: 19,
//   RIGHT_INDEX: 20,
//   LEFT_THUMB: 21,
//   RIGHT_THUMB: 22,
//   LEFT_HIP: 23,
//   RIGHT_HIP: 24,
//   LEFT_KNEE: 25,
//   RIGHT_KNEE: 26,
//   LEFT_ANKLE: 27,
//   RIGHT_ANKLE: 28,
//   LEFT_HEEL: 29,
//   RIGHT_HEEL: 30,
//   LEFT_FOOT_INDEX: 31,
//   RIGHT_FOOT_INDEX: 32
// }
// const POSE_LANDMARKS_LEFT = {
//   LEFT_EYE_INNER: 1,
//   LEFT_EYE: 2,
//   LEFT_EYE_OUTER: 3,
//   LEFT_EAR: 7,
//   LEFT_RIGHT: 9,
//   LEFT_SHOULDER: 11,
//   LEFT_ELBOW: 13,
//   LEFT_WRIST: 15,
//   LEFT_PINKY: 17,
//   LEFT_INDEX: 19,
//   LEFT_THUMB: 21,
//   LEFT_HIP: 23,
//   LEFT_KNEE: 25,
//   LEFT_ANKLE: 27,
//   LEFT_HEEL: 29,
//   LEFT_FOOT_INDEX: 31
// }
// const POSE_LANDMARKS_RIGHT = {
//   RIGHT_EYE_INNER: 4,
//   RIGHT_EYE: 5,
//   RIGHT_EYE_OUTER: 6,
//   RIGHT_EAR: 8,
//   RIGHT_LEFT: 10,
//   RIGHT_SHOULDER: 12,
//   RIGHT_ELBOW: 14,
//   RIGHT_WRIST: 16,
//   RIGHT_PINKY: 18,
//   RIGHT_INDEX: 20,
//   RIGHT_THUMB: 22,
//   RIGHT_HIP: 24,
//   RIGHT_KNEE: 26,
//   RIGHT_ANKLE: 28,
//   RIGHT_HEEL: 30,
//   RIGHT_FOOT_INDEX: 32
// }
// const POSE_LANDMARKS_NEUTRAL = { NOSE: 0 }

///
/// Update pose from landmarks
///

export default function UpdateLandmarkPose(lm3d: Landmark[]) {
  const changes = {}

  if (!lm3d) return null

  const threshhold = 0.6

  const rightHip = lm3d[POSE_LANDMARKS.RIGHT_HIP]
  const leftHip = lm3d[POSE_LANDMARKS.LEFT_HIP]

  const rightShoulder = lm3d[POSE_LANDMARKS.RIGHT_SHOULDER]
  const leftShoulder = lm3d[POSE_LANDMARKS.LEFT_SHOULDER]

  const leftFoot = lm3d[POSE_LANDMARKS_LEFT.LEFT_FOOT_INDEX]
  const rightFoot = lm3d[POSE_LANDMARKS_RIGHT.RIGHT_FOOT_INDEX]

  const hips =
    rightHip &&
    rightHip.visibility &&
    rightHip.visibility > threshhold &&
    leftHip &&
    leftHip.visibility &&
    leftHip.visibility > threshhold
      ? true
      : false

  const shoulders =
    rightShoulder &&
    rightShoulder.visibility &&
    rightShoulder.visibility > threshhold &&
    leftShoulder &&
    leftShoulder.visibility &&
    leftShoulder.visibility > threshhold
      ? true
      : false

  let permit_feet = false

  ////////////////////////////////////////////////////////////////////////////////////////////////////

  //
  // hips and shoulders
  //
  // if we *do* have hips and shoulders then we can do accurate estimations of all three hip axes
  // note tensorflow does return the hips on the proper side of the body; if you are facing away from the camera it understands this
  //
  // hips yaw (pirouette axis) is accurate over the whole 360 range from raw mediapipe landmarks (atan of z/x)
  // hips roll is ~reasonable~
  // hips pitch is estimated from a line drawn up to a midpoint between the shoulders (manubrium)
  //
  // @todo verify for certain that hips continue to be calculated by tensorflow even if not shown
  // @todo why is the estimated hips xyz half a meter in the x and y? it should near zero -> it is using lm2d but still the relative displacement should be zero?
  //

  if (hips && shoulders) {
    /*
    // test getting hip pose using 3d data with weak z to estimate hips pose
    const hipsleft3d = Vector.fromArray(lm3d[23])
    const hipsright3d = Vector.fromArray(lm3d[24])
    const pelvis3d = Vector.findMiddle(hipsleft3d, hipsright3d)
    const abdomen3d = hipsleft3d.clone().subtract(hipsright3d)
    const shoulderleft3d = Vector.fromArray(lm3d[11])
    const shoulderright3d = Vector.fromArray(lm3d[12])
    const manubrium3d = Vector.findMiddle(shoulderleft3d, shoulderright3d)
    const spine3d = manubrium3d.clone().subtract(pelvis3d)
    const spine_length3d = pelvis3d.distance(manubrium3d)
    */

    /*
    // test hip pose usind 2d data with arguably stronger z depth?
    const hipsleft2d = Vector.fromArray(lm2d[23])
    const hipsright2d = Vector.fromArray(lm2d[24])
    const pelvis2d = Vector.findMiddle(hipsleft2d, hipsright2d)
    const abdomen2d = hipsleft2d.clone().subtract(hipsright2d)
    const shoulderleft2d = Vector.fromArray(lm2d[11])
    const shoulderright2d = Vector.fromArray(lm2d[12])
    const manubrium2d = Vector.findMiddle(shoulderleft2d, shoulderright2d)
    const spine2d = manubrium2d.clone().subtract(pelvis2d)
    const spine_length2d = pelvis2d.distance(manubrium2d)
    */

    // test: calcHips() -> their rollPitchYaw seems a bit suss - it's just not clear what is going on; very unstable
    // const results = calcHips(lm3d,lm2d)
    // state.hips.euler = results.Hips.rotation

    // test: manually call their roll pitch yaw logic and blow away pitch -> weirdly this is not stable? try 2d?
    // state.hips.euler = Vector.rollPitchYaw(lm3d[23],lm3d[24])
    // state.hips.euler.x = 0

    // test: estimate body pose orientation using spine also - their code doesn't seem to do what i expect??
    // state.hips.euler = Vector.rollPitchYaw(new Vector(lm3d[23]),new Vector(lm3d[24]),manubrium3d)

    // test: get hips pose from scratch; the manual values tacked on the end are trial and error, the euler order is XYZ
    // note: the hips at rest are NOT 0,0,0!
    // @todo note that i've turned off the pitch and roll for now!
    const hipleft = new Vector3(rightHip.x, rightHip.y, rightHip.z)
    const hipright = new Vector3(leftHip.x, leftHip.y, leftHip.z)
    const hipdir = hipright.clone().sub(hipleft).normalize()
    const x = 0 // - Math.atan2( spine3d.y, spine3d.z) - Math.PI/2
    const y = Math.atan2(hipdir.x, hipdir.z) + Math.PI / 2
    const z = Math.atan2(hipdir.y, hipdir.x) + Math.PI

    // disable hips for now
    // changes[VRMHumanBoneName.Hips] = { euler: { x, y, z } }

    // disable changing legs for now
    permit_feet = false

    /* debugging
    console.log(

      // pelvis3d  values are consistently near 0,0,0 - that is good
      'hips middle is at = ',
      pelvis3d.x.toFixed(3),
      pelvis3d.y.toFixed(3),
      pelvis3d.z.toFixed(3),

      // shoulder3d middle ~ok~
     'shoulder middle is at = ',
      manubrium3d.x.toFixed(3),
      manubrium3d.y.toFixed(3),
      manubrium3d.z.toFixed(3),

      // spine3d is reasonably vertical; a bit noisy
      "spine vector is = ",
      spine3d.x.toFixed(3),
      spine3d.y.toFixed(3),
      spine3d.z.toFixed(3),

      'hips euler is = ',
      state.hips.euler.x.toFixed(3),
      state.hips.euler.y.toFixed(3),
      state.hips.euler.z.toFixed(3),
      poseEnsemble.rest[VRMHumanBoneName.Hips].euler.z
    )
    */

    // @todo -> if we have an accurate upper chest orientation is that useful at all? how does this compete with shoulder joints? how are shoulder joints different from upper arms?
    // changes[VRMHumanBoneName.Spine] = state.shoulder
  }

  //
  // shoulders no hips
  //
  // generally speaking lets reset the hips rotation (and the legs below) for now in this case?
  //
  // @todo could estimate shoulder pitch,yaw,role (from head) and set the spine or upper chest in the vrm model?
  // @todo what is the difference between the 'left shoulder' and the 'upper arm'???
  //
  else if (!hips && shoulders) {
    // if hips are not present then reset the hip orientation at least; arguably also the height
    // changes[VRMHumanBoneName.Hips] = { euler: { x:0, y:0, z:0 } }
    permit_feet = false
    // state.shoulders.euler = ... some calculation...
    // state.shoulders.euler.x = 0
    //changes[VRMHumanBoneName.Spine] = state.shoulders
  }

  //
  // no shoulders no hips
  //
  // if neither the shoulders or the hips are shown then switch to a head only mode; effectively the user has implied this by not providing shoulders
  // note that the actual visibility itself is not exactly the same as "no data" since tensorflow will speculatively predict poses; but i think this is what the user wants
  //
  // we have a variety of options for dealing with visibility or lack of visibility
  // one strategy is to always reset the hips to a rest position if the hips are not shown
  // this may however confound the user intention
  // another strategy is to only update the hips if they are shown and do nothing if not - not resetting to a rest pose
  // this can leave the user in a bad position if the hips disappear off camera and they rotate heavily
  // however this does permit the user to correct the situation by simply moving back into view, setting their hips, and then leaving the view?
  //
  // @todo it is arguable if we want to reset this at all - it could be best to just leave it as it was before visibility was lost
  //
  else if (!hips && !shoulders) {
    // if hips are not present then reset the hip orientation at least; arguably also the height
    // changes[VRMHumanBoneName.Hips] = { euler: { x:0, y:0, z:0 } }
    permit_feet = false
  }

  ////////////////////////////////////////////////////////////////////////////////////////////////////

  //
  // feet
  //

  const leftFootVisible = leftFoot && leftFoot.visibility && leftFoot.visibility > threshhold ? true : false
  const rightFootVisible = rightFoot && rightFoot.visibility && rightFoot.visibility > threshhold ? true : false

  if (leftFootVisible == false && rightFootVisible == false) {
    permit_feet = false
  }

  if (permit_feet == false) {
    // @todo later preserve hip orientation but not height
    // changes[VRMHumanBoneName.Hips] = { euler: { x:0, y:0, z:0 } }
    // reset the feet to a rest pose
    // changes[VRMHumanBoneName.LeftUpperLeg] = { euler: tpose[VRMHumanBoneName.LeftUpperLeg] }
    // changes[VRMHumanBoneName.LeftLowerLeg] = { euler: tpose[VRMHumanBoneName.LeftLowerLeg] }
    // changes[VRMHumanBoneName.RightUpperLeg] = { euler: tpose[VRMHumanBoneName.RightUpperLeg] }
    // changes[VRMHumanBoneName.RightLowerLeg] = { euler: tpose[VRMHumanBoneName.RightLowerLeg] }
  } else {
    const legs = calcLegs(lm3d)
    changes[VRMHumanBoneName.LeftUpperLeg] = { euler: legs.UpperLeg.l }
    changes[VRMHumanBoneName.LeftLowerLeg] = { euler: legs.LowerLeg.l }
    changes[VRMHumanBoneName.RightUpperLeg] = { euler: legs.UpperLeg.r }
    changes[VRMHumanBoneName.RightLowerLeg] = { euler: legs.LowerLeg.r }

    //
    // place the avatar vertically in space
    //
    // hip position = lowest_element_position - startup_lowest_element_position
    //
    // for example
    //    lowest_element_position = -0.2  // in this scenario the feet are up near the hips; such as sitting crosslegged
    //    startup_lowest_element_position = -0.4 // but at startup the feet were extended
    //    hip_position = - 0.2 - - 0.4 = -0.2 // so the entire hips move down a bit
    //
    //
    // @todo have some inter frame persistence of lowest feature to allow jumping by using the poseEnsemble cache
    // @todo deal with hip displacement horizontally
    // @todo should visibility be a part of this?
    //

    /*
    // @todo fix turned this off because something else may be attempting to do something similar? or it is buggy

    let unset = true
    let lowest = 999.0
    lm3d.forEach((landmark, i) => {
      if (lowest > landmark.y) {
        lowest = landmark.y
        unset = false
      }
    })

    state.hips.xyz = poseEnsemble.rest[VRMHumanBoneName.Hips].xyz
    if (!unset) {
      state.hips.xyz.y = lowest - poseEnsemble.lowest
    }
    */
  }

  //////////////////////////////////////////////////////////////////////////////////////////////////////////

  //
  // arms
  //
  // @todo turn off hands / arms if no shoulders also? or trust tensorflow speculative data?
  // @todo should we instead leave arms where they are if we stop having data for hands?
  // @todo note that the lower level helpers have swapped left and right hand for some peverse reason; fix this
  // @todo get resting pose from the VRM model not from the mediapipe helper
  // @todo populate ik from here rather than by hand as done currently in ik module
  //

  const leftHand = lm3d[POSE_LANDMARKS_LEFT.LEFT_WRIST]
  const rightHand = lm3d[POSE_LANDMARKS_RIGHT.RIGHT_WRIST]

  const leftHandVisible = leftHand && leftHand.visibility && leftHand.visibility > threshhold ? true : false
  const rightHandVisible = rightHand && rightHand.visibility && rightHand.visibility > threshhold ? true : false

  if (leftHandVisible || rightHandVisible) {
    const arms = calcArms(lm3d)

    // @todo hands are backwards!
    if (!leftHandVisible) {
      arms.UpperArm.r = arms.UpperArm.r.multiply(0)
      arms.UpperArm.r.z = RestingDefault.Pose.RightUpperArm.z
      arms.LowerArm.r = arms.LowerArm.r.multiply(0)
      arms.Hand.r = arms.Hand.r.multiply(0)
    }

    if (!rightHandVisible) {
      arms.UpperArm.l = arms.UpperArm.l.multiply(0)
      arms.UpperArm.l.z = RestingDefault.Pose.LeftUpperArm.z
      arms.LowerArm.l = arms.LowerArm.l.multiply(0)
      arms.Hand.l = arms.Hand.l.multiply(0)
    }

    const dampener = 1.0
    const lerp = 0.3

    changes[VRMHumanBoneName.LeftHand] = { xyz: arms.Hand.l, dampener, lerp }
    changes[VRMHumanBoneName.LeftUpperArm] = { euler: arms.UpperArm.l, dampener, lerp }
    changes[VRMHumanBoneName.LeftLowerArm] = { euler: arms.LowerArm.l, dampener, lerp }

    changes[VRMHumanBoneName.RightHand] = { xyz: arms.Hand.r, dampener, lerp }
    changes[VRMHumanBoneName.RightUpperArm] = { euler: arms.UpperArm.r, dampener, lerp }
    changes[VRMHumanBoneName.RightLowerArm] = { euler: arms.LowerArm.r, dampener, lerp }
  }

  return changes
}

/*

// this is old code to discard 
// attempting to estimate head pose from lm3d data - just doesn't seem stable
// faceLandmarks (as the existing code uses) seems to produce much better results

// https://medium.com/@susanne.thierfelder/head-pose-estimation-with-mediapipe-and-opencv-in-javascript-c87980df3acb
// https://storage.googleapis.com/mediapipe-assets/Model%20Card%20Blendshape%20V2.pdf
// https://stevehazen.wordpress.com/2010/02/15/matrix-basics-how-to-step-away-from-storing-an-orientation-as-3-angles/
// https://discourse.threejs.org/t/get-a-triangle-rotation-x-y-z-from-its-vertices/22860/13

export const UpdateHead = (lm3d: Landmark[], lm2d: Landmark[], avatarTransform, avatarRig) => {

  const OrientHead = true
  if (OrientHead) {
    const v1 = new Vector3( lm3d[POSE_LANDMARKS.LEFT_EAR].x, lm3d[POSE_LANDMARKS.LEFT_EAR].y, lm3d[POSE_LANDMARKS.LEFT_EAR].z )
    const v2 = new Vector3( lm3d[POSE_LANDMARKS.RIGHT_EAR].x, lm3d[POSE_LANDMARKS.RIGHT_EAR].y, lm3d[POSE_LANDMARKS.RIGHT_EAR].z )
    const v3 = new Vector3((lm3d[9].x + lm3d[10].x) / 2, (lm3d[9].y + lm3d[10].y) / 2, (lm3d[9].z + lm3d[10].z) / 2)
    //visibility: (lm3d[POSE_LANDMARKS.MOUTH_LEFT].visibility || 0) + (lm3d[POSE_LANDMARKS.MOUTH_RIGHT].visibility || 0) / 2

    const triangle = new Triangle(v1, v2, v3)
    const normal = new Vector3()
    triangle.getNormal(normal)

    if(!temp) {
      temp = new Mesh(new BoxGeometry(1, 1, 1), new MeshBasicMaterial({ color: 0xff0000 }))
      Engine.instance.scene.add(temp)
    }
    v3.y += 2

    temp.position.copy(v3)
    temp.lookAt(normal)
    const midPoint = new Vector3()
    triangle.getMidpoint(midPoint)
    const xNormal = new Vector3().subVectors(v3, v2).normalize()
    const yNormal = new Vector3().subVectors(v1, midPoint).normalize()
    const zNormal = new Vector3()
    triangle.getNormal(zNormal)
    const rotationMatrix = new Matrix4().set(
      ...[...xNormal.toArray(), 0, ...yNormal.toArray(), 0, ...zNormal.toArray(), 0, 0, 0, 0, 1]
    )
    const q = new Quaternion().setFromRotationMatrix(rotationMatrix).conjugate().multiply(rotation)
    //const { x, y, z } = new Euler().setFromQuaternion(q)
    //strategies[0].rotation = q
  }
}
*/
