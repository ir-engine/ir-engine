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

import { AvatarRigComponent } from '../avatar/components/AvatarAnimationComponent'
import { getComponent } from '../ecs/functions/ComponentFunctions'
import { TransformComponent } from '../transform/components/TransformComponent'

import { Landmark } from '@mediapipe/holistic'
import { VRMHumanBoneName } from '@pixiv/three-vrm'
import { RestingDefault } from './solvers/utils/helpers'
import Vector from './solvers/utils/vector'

import { Euler, Vector3 } from 'three'
import { updateRigPosition, updateRigRotation } from './UpdateUtils'

import { calcArms } from './solvers/PoseSolver/calcArms'
import { calcLegs } from './solvers/PoseSolver/calcLegs'

///
/// Persistent pose information
///

const ensembles = {}
export function GetPoseEnsemble(userID, rig) {
  let ensemble = ensembles[userID]
  if (ensemble) {
    return ensemble
  }
  ensemble = ensembles[userID] = {
    lowest: 999,
    rest: {}
  }
  Object.entries(VRMHumanBoneName).forEach(([key, key2]) => {
    const part = rig.vrm.humanoid!.getNormalizedBoneNode(key2)
    if (!part) return
    if (part.position.y < ensemble.lowest) ensemble.lowest = part.position.y
    ensemble.rest[key2] = {
      xyz: part.position.clone(),
      quaternion: part.quaternion.clone(),
      euler: new Euler().setFromQuaternion(part.quaternion)
    }
  })
  return ensemble
}

///
/// A helper to apply all changes at once to allow for most post processing
///

function ApplyPoseChanges(changes, rig) {
  Object.entries(changes).forEach(([key, args]) => {
    const scratch: any = args
    const dampener = scratch.dampener || 1
    const lerp = scratch.lerp || 1
    if (scratch.euler) {
      updateRigRotation(rig, key, scratch.euler, scratch.dampener, scratch.lerp)
    }
    if (scratch.xyz) {
      updateRigPosition(rig, key, scratch.xyz, scratch.dampener, scratch.lerp)
    }
  })
}

///
/// A helper to carefully update the puppet larger pose features from landmarks using basic math and understanding of human bodies
///

export const UpdateLandmarkPose = (lm3d: Landmark[], lm2d: Landmark[], poseEnsemble: any, useikhands = false) => {
  if (!lm3d || !lm2d) return

  const changes = poseEnsemble.changes

  const threshhold = 0.6

  const state: any = {
    head: {
      dampener: 1,
      lerp: 0.3,
      shown: lm3d[0] && lm3d[0].visibility && lm3d[0].visibility > threshhold
    },
    hips: {
      dampener: 1,
      lerp: 0.3,
      shown:
        lm3d[23] &&
        lm3d[23].visibility &&
        lm3d[23].visibility > threshhold &&
        lm3d[24] &&
        lm3d[24].visibility &&
        lm3d[24].visibility > threshhold
    },
    shoulders: {
      dampener: 1,
      lerp: 0.1,
      shown:
        lm3d[11] &&
        lm3d[11].visibility &&
        lm3d[11].visibility > threshhold &&
        lm3d[12] &&
        lm3d[12].visibility &&
        lm3d[12].visibility > threshhold
    },
    leftHand: {
      shown: lm3d[15] && lm3d[15].visibility && lm3d[15].visibility > threshhold
    },
    rightHand: {
      shown: lm3d[16] && lm3d[16].visibility && lm3d[16].visibility > threshhold
    },
    leftFoot: {
      shown: lm3d[31] && lm3d[31].visibility && lm3d[31].visibility > threshhold
    },
    rightFoot: {
      shown: lm3d[32] && lm3d[32].visibility && lm3d[32].visibility > threshhold
    }
  }

  //
  // strategy for dealing with hips and shoulder both shown
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

  if (state.hips.shown && state.shoulders.shown) {
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

    // test: calcHips() -> their rollPitchYaw seems a bit suss - it's just not clear what is going on
    // const results = calcHips(lm3d,lm2d)
    // state.hips.euler = results.Hips.rotation

    // test: manually call their roll pitch yaw logic and blow away pitch -> unsure how something so simple can be messed up...
    // state.hips.euler = Vector.rollPitchYaw(lm3d[23],lm3d[24])
    // state.hips.euler.x = 0

    // test: estimate body pose orientation using spine also - their code doesn't seem to do what i expect?
    // state.hips.euler = Vector.rollPitchYaw(new Vector(lm3d[23]),new Vector(lm3d[24]),manubrium3d)

    // test: get hips pose from scratch; the manual values tacked on the end are trial and error, the euler order is XYZ
    // @todo note that i've turned off the pitch and roll for now but it might be nice to apply them to the vrm spine?
    const hipleft = new Vector3(lm3d[23].x, lm3d[23].y, lm3d[23].z)
    const hipright = new Vector3(lm3d[24].x, lm3d[24].y, lm3d[24].z)
    const hipdir = hipright.clone().sub(hipleft).normalize()
    const x = poseEnsemble.rest[VRMHumanBoneName.Hips].euler.x // - Math.atan2( spine3d.y, spine3d.z) - Math.PI/2
    const y = poseEnsemble.rest[VRMHumanBoneName.Hips].euler.y + Math.atan2(hipdir.x, hipdir.z) + Math.PI / 2
    const z = poseEnsemble.rest[VRMHumanBoneName.Hips].euler.z // + Math.atan2( hipdir.y, hipdir.x) + Math.PI
    state.hips.euler = { x, y, z }
    changes[VRMHumanBoneName.Hips] = state.hips

    // debugging
    //console.log(

    // pelvis3d  values are consistently near 0,0,0 - that is good
    // 'hips middle is at = ',
    // pelvis3d.x.toFixed(3),
    // pelvis3d.y.toFixed(3),
    // pelvis3d.z.toFixed(3),

    // shoulder3d middle ~ok~
    // 'shoulder middle is at = ',
    // manubrium3d.x.toFixed(3),
    // manubrium3d.y.toFixed(3),
    // manubrium3d.z.toFixed(3),

    // spine3d is reasonably vertical; a bit noisy
    //"spine vector is = ",
    //spine3d.x.toFixed(3),
    //spine3d.y.toFixed(3),
    //spine3d.z.toFixed(3),

    //'hips euler is = ',
    //state.hips.euler.x.toFixed(3),
    //state.hips.euler.y.toFixed(3),
    //state.hips.euler.z.toFixed(3),
    //poseEnsemble.rest[VRMHumanBoneName.Hips].euler.z

    //)

    // @todo -> if we have an accurate upper chest orientation is that useful at all? how does this compete with shoulder joints? how are shoulder joints different from upper arms?
    // changes[VRMHumanBoneName.Spine] = state.shoulder
  }

  //
  // strategy for dealing with shoulder only shown (no hips)
  //
  // generally speaking lets reset the hips rotation (and the legs below) for now in this case?
  //
  // @todo could estimate shoulder pitch,yaw,role (from head) and set the spine or upper chest in the vrm model?
  // @todo what is the difference between the 'left shoulder' and the 'upper arm'???
  //
  else if (!state.hips.shown && state.shoulders.shown) {
    // if hips are not present then reset the hip orientation at least; arguably also the height
    state.hips.euler = poseEnsemble.rest[VRMHumanBoneName.Hips].euler
    state.hips.xyz = poseEnsemble.rest[VRMHumanBoneName.Hips].position
    changes[VRMHumanBoneName.Hips] = state.hips

    // state.shoulders.euler = ... some calculation...
    // state.shoulders.euler.x = 0
    //changes[VRMHumanBoneName.Spine] = state.shoulders
  }

  //
  // strategy for dealing missing shoulders AND hips
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
  else if (!state.hips.shown && !state.shoulders.shown) {
    // if hips or shoulders are not present then reset the hip orientation at least; arguably also the height
    state.hips.euler = poseEnsemble.rest[VRMHumanBoneName.Hips].euler
    state.hips.xyz = poseEnsemble.rest[VRMHumanBoneName.Hips].position
    changes[VRMHumanBoneName.Hips] = state.hips
  }

  //////////////////////////////////////////////////////////////////////////////////////////////////////////
  //
  // feet support
  //

  if (!state.hips.shown || !state.shoulders.shown || (!state.leftFoot.shown && !state.rightFoot.shown)) {
    // if no hips, shoulders or feet then make sure to go to a ghostly floater mode
    state.hips.xyz = poseEnsemble.rest[VRMHumanBoneName.Hips].position
    changes[VRMHumanBoneName.Hips] = state.hips

    // reset the feet to a rest pose
    changes[VRMHumanBoneName.LeftUpperLeg] = {
      euler: poseEnsemble.rest[VRMHumanBoneName.LeftUpperLeg],
      dampener: 1,
      lerp: 0.3
    }
    changes[VRMHumanBoneName.LeftLowerLeg] = {
      euler: poseEnsemble.rest[VRMHumanBoneName.LeftLowerLeg],
      dampener: 1,
      lerp: 0.3
    }
    changes[VRMHumanBoneName.RightUpperLeg] = {
      euler: poseEnsemble.rest[VRMHumanBoneName.RightUpperLeg],
      dampener: 1,
      lerp: 0.3
    }
    changes[VRMHumanBoneName.RightLowerLeg] = {
      euler: poseEnsemble.rest[VRMHumanBoneName.RightLowerLeg],
      dampener: 1,
      lerp: 0.3
    }
  } else {
    const legs = calcLegs(lm3d)

    changes[VRMHumanBoneName.LeftUpperLeg] = { euler: legs.UpperLeg.l, dampener: 1, lerp: 0.3 }
    changes[VRMHumanBoneName.LeftLowerLeg] = { euler: legs.LowerLeg.l, dampener: 1, lerp: 0.3 }
    changes[VRMHumanBoneName.RightUpperLeg] = { euler: legs.UpperLeg.r, dampener: 1, lerp: 0.3 }
    changes[VRMHumanBoneName.RightLowerLeg] = { euler: legs.LowerLeg.r, dampener: 1, lerp: 0.3 }

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

    let unset = true
    let lowest = 999.0
    lm3d.forEach((landmark, i) => {
      if (lowest > landmark.y) {
        lowest = landmark.y
        unset = false
      }
    })

    // @todo fix turned this off because something else may be attempting to do something similar? or it is buggy
    //state.hips.xyz = poseEnsemble.rest[VRMHumanBoneName.Hips].xyz
    //if (!unset) {
    //  state.hips.xyz.y = lowest - poseEnsemble.lowest
    //}
  }

  //////////////////////////////////////////////////////////////////////////////////////////////////////////

  //
  // arms
  //
  // @todo turn off arms if no shoulders also? be more evaluative?
  // @todo should we instead leave arms where they are if we stop having data for hands?
  // @todo note that the lower level helpers have swapped left and right hand for some peverse reason; fix this
  // @todo get resting pose from the VRM model not from the mediapipe helper
  // @todo populate ik from here rather than by hand as done currently in ik module
  //

  // hack: disable hands if using ik hands
  if (useikhands) return

  const arms = calcArms(lm3d)

  if (!state.rightHand.shown || !state.shoulders.shown) {
    arms.UpperArm.l = arms.UpperArm.l.multiply(0)
    arms.UpperArm.l.z = RestingDefault.Pose.LeftUpperArm.z
    arms.LowerArm.l = arms.LowerArm.l.multiply(0)
    arms.Hand.l = arms.Hand.l.multiply(0)
  }

  if (!state.leftHand.shown || !state.shoulders.shown) {
    arms.UpperArm.r = arms.UpperArm.r.multiply(0)
    arms.UpperArm.r.z = RestingDefault.Pose.RightUpperArm.z
    arms.LowerArm.r = arms.LowerArm.r.multiply(0)
    arms.Hand.r = arms.Hand.r.multiply(0)
  }

  changes[VRMHumanBoneName.LeftHand] = { xyz: arms.Hand.l, dampener: 1, lerp: 0.3 }
  changes[VRMHumanBoneName.LeftUpperArm] = { euler: arms.UpperArm.l, dampener: 1, lerp: 0.3 }
  changes[VRMHumanBoneName.LeftLowerArm] = { euler: arms.LowerArm.l, dampener: 1, lerp: 0.3 }

  changes[VRMHumanBoneName.RightHand] = { xyz: arms.Hand.r, dampener: 1, lerp: 0.3 }
  changes[VRMHumanBoneName.RightUpperArm] = { euler: arms.UpperArm.r, dampener: 1, lerp: 0.3 }
  changes[VRMHumanBoneName.RightLowerArm] = { euler: arms.LowerArm.r, dampener: 1, lerp: 0.3 }
}

import UpdateIkPose from './UpdateIkPose'
import UpdateLandmarkFace from './UpdateLandmarkFace'
import UpdateLandmarkHands from './UpdateLandmarkHands'

export function UpdateLandmarkAll(data, userID, entity) {
  // sanity check
  if (!data || !data.za || !data.poseLandmarks) {
    return
  }

  // get avatar rig
  const avatarRig = getComponent(entity, AvatarRigComponent)
  const avatarTransform = getComponent(entity, TransformComponent)
  if (!avatarRig || !avatarTransform) {
    return
  }

  // get avatar world pose
  const avatarHips = avatarRig?.bindRig?.hips?.node
  const position = avatarHips.position.clone().applyMatrix4(avatarTransform.matrix)
  const rotation = avatarTransform.rotation

  // get or create persistent state
  const poseEnsemble: any = GetPoseEnsemble(userID, avatarRig)
  poseEnsemble.rig = avatarRig
  poseEnsemble.changes = {}

  const useik = true
  if (!useik) {
    // head orientation and facial features
    UpdateLandmarkFace(data?.faceLandmarks, poseEnsemble.changes)

    // fingers
    UpdateLandmarkHands(data?.leftHandLandmarks, data?.rightHandLandmarks, poseEnsemble.changes)

    // coarse pose
    UpdateLandmarkPose(data?.za, data?.poseLandmarks, poseEnsemble, true)

    // test direct changes
    ApplyPoseChanges(poseEnsemble.changes, avatarRig)
  }

  // test ik
  else if (data && data.za) {
    UpdateIkPose(data.za, position, rotation, poseEnsemble)
  }
}

/*

NOTES Aug 2023

on lm3d normalized data:
  - all points are centered on the avatar as a vitrivian man with radius 0.5 or diameter 1
  - for example the left shoulder is often at 0.14 in the x axis and the right shoulder is at -0.14
  - raw data y is negative upwards, so the shoulder y is at -0.45; which is the opposite of the 3js convention
  - z pose estimates are poor from the front, we don't really know exactly where the wrists are in 3d space; you could be punching forward for example at full extent, or have a hand on your chest
  - raw z data does exist but fairly weak; good enough for hips pirouette however
  - note that 'visibility' also is slightly unclear as a concept; tensorflow appears to speculate even if no visibility

MAIN GOALS

  - flip hands? I tried to do this but failed; failed to flip some coordinate somewhere in the math
  - merge change list with restpose logic?
  - support the concept of jumping by using latency of ground pose estimation
  - support real wingspan estimation

HEAD ISSUES

  x head pose works ok
  ? it could possibly be improved though; maybe slower updates?
  ? maybe write to neck as well as the head?

HIPS ISSUES

  x default hips pose from vrm model is x=3.089, y=0.090, z=-3.081 ... ... whereas "zero" for me is 0,0,0 ... use vrm model as rest pose?
  x hips/shoulders must be estimated correctly or else everything else gets thrown off
  x hip orientation (yawpitchroll()) is off axis a bit; it makes avatar look drunk
  x can we use the shoulder midpoint to improve? cross the hip horizontal with the spine?
  x can we improve forward pitch estimation using z depth between shoulder and hip?
  ? what if i put the entire rig on soft physics springs and then allow parts to tug around?
  ? Does it even make sense to be computing the hips by hand?
  ? I notice that kalikokit pretty much ignores the visibility flags - why? is there something i don't understand?
  ? TEST: It is not clear if low visibility per component == bad/zero data or if it reverts to tensorflow speculation
  ? what level of participant mediated correction can we rely on - can the user know to capture their shoulders?
  ? rotating hips does not rotate the entire avatar root node - do we want to do that?

ARMS / SHOULDERS ISSUES

  !!! insanely the left and right arms/legs are swapped in the source code; all the english words say left, but the indexes refer to the right
  ? see https://github.com/yeemachine/kalidokit/blob/main/src/PoseSolver/calcHips.ts
  ? seems like there are assumptions about being upright; how can one estimate arm joint angles from an arbitrary shoulder orientation?
  ? i need to understand better the frame of reference for the kalidokit shoulder to arm pose estimation - is it local or world?
  ? if a part is not shown (such as wrists) what is the right strategy? revert to rest pose or leave it as is? what happens if you then rotate your body?

FINGERS
  - test fingers once that is merged again

GROUND IMPROVE

  x hips are normally at 0,0,0 - we can find the inverse of the lowest limb to improve this
  x what if i simply avoid changing the real rig height; or i find the original rig hip height rest position?
  ? can i cache the lowest feature temporally so that a person can jump in the air?
  ? does visibility matter for finding lowest feature?

IK IMPROVE

  - @todo since ik fights with direct pose setting - set the direct stuff via ik now instead - but also get the support fixed for both
  - @todo the hands orientation is not being set - set it
  - turn on ik again
  - test feeding the ik with the manually approximated estimated joint rotations and positions
  - we need a way to use IK AND ordinary coercion of features such as elbows?
  ? should i do ik in world space or local space? do i even have the option?
  - can i set state on the vrm rig and then have all changelists consolidated in the animation system?

OTHER LATER

  - test multiple cameras <- this is probably the best thing we could do actually
  - try new pose algo from mediapipe that is more recent than holistic
  - may still be worth trying hip rotations using 2d landmark data - it may have paradoxically better z depth
  - review this approach in detail: https://github.com/ju1ce/Mediapipe-VR-Fullbody-Tracking/blob/main/bin/inference_gui.py 

RANDOM QUESTIONS

  - what exactly are these really??? are these all joints? or is one of them an actual arm?
      readonly LeftShoulder: "leftShoulder";
      readonly LeftUpperArm: "leftUpperArm";
      readonly LeftLowerArm: "leftLowerArm";
      readonly LeftHand: "leftHand";

  - i notice a spring system in vrm - what is it?
  - what are the rest bone positions for a given rig??? i am grabbing them at startup - is that the best way?
  - what does it mean that bones are 'normalized'?
  - the body seems to jump or something when i remove an ik??? why???

REFERENCE

  https://github.com/kimgooq/MoCap-Rigging
  https://www.mdpi.com/2076-3417/13/4/2700
  https://github.com/digital-standard/ThreeDPoseUnityBarracuda/blob/f4ad45e83e72bf140128d95b668aef97037c1379/Assets/Scripts/VNectBarracudaRunner.cs <- very impressive
  https://github.com/Kariaro/VRigUnity/tree/main

*/
