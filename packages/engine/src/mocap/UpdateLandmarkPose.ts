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

import { Landmark } from '@mediapipe/holistic'
import { VRMHumanBoneName } from '@pixiv/three-vrm'
import { Vector3 } from 'three'
import { calcArms } from './solvers/PoseSolver/calcArms'
import { RestingDefault } from './solvers/utils/helpers'
import Vector from './solvers/utils/vector'

const UpdateSolvedPose = (lm3d: Landmark[], lm2d: Landmark[], restpose: any, changes: any) => {
  if (!lm3d || !lm2d) return

  const threshhold = 0.6
  const state: any = {
    head: {
      dampener: 1,
      lerp: 0.3,
      visible: lm3d[0] && lm3d[0].visibility && lm3d[0].visibility > threshhold
    },
    hips: {
      dampener: 1,
      lerp: 0.3,
      visible:
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
      visible:
        lm3d[11] &&
        lm3d[11].visibility &&
        lm3d[11].visibility > threshhold &&
        lm3d[12] &&
        lm3d[12].visibility &&
        lm3d[12].visibility > threshhold
    },
    leftHand: {
      visible: lm3d[15] && lm3d[15].visibility && lm3d[15].visibility > threshhold
    },
    rightHand: {
      visible: lm3d[16] && lm3d[16].visibility && lm3d[16].visibility > threshhold
    },
    leftLeg: {
      // uses hips for visibility test
      visible: lm3d[23] && lm3d[23].visibility && lm3d[23].visibility > threshhold
    },
    rightLeg: {
      // uses hips for visibility test
      visible: lm3d[24] && lm3d[24].visibility && lm3d[24].visibility > threshhold
    }
  }

  //////////////////////////////////////////////////////////////////////////////////////////////////////////

  //
  // ground estimation
  //
  // @todo have some inter frame persistence of lowest feature to allow jumping
  // @todo populate waist from default if no ground estimation
  //

  const waist = 1.84 / 2.0
  let ground = waist
  lm3d.forEach((landmark) => {
    // if(landmark.visibility && landmark.visibility > threshhold) ??? does this matter
    if (ground > landmark.y) {
      ground = landmark.y
    }
  })

  //////////////////////////////////////////////////////////////////////////////////////////////////////////

  //
  // hips and shoulders
  //

  //
  // strategy for dealing with neither shoulder nor hips being visible
  //
  // if neither the shoulders or the hips are visible then switch to a head only mode; effectively the user has implied this by not providing shoulders
  // note that the actual visibility itself is not exactly the same as "no data" since tensorflow will speculatively predict poses; but i think this is what the user wants
  //
  // we have a variety of options for dealing with visibility
  // one strategy is to always reset the hips to a rest position if the hips are not visible
  // this may however confound the user intention
  // another strategy, the one used here, is to only update the hips if they are visible
  // this can leave the user in a bad position if the hips disappear off camera and they rotate heavily
  // however this does permit the user to correct the situation by simply moving back into view, setting their hips, and then leaving the view
  //
  // @todo i want to latch this transition once rather than hammering on it
  // @todo why am i floating above the ground?
  //

  if (!state.hips.visible || !state.shoulders.visible) {
    state.hips.euler = restpose[VRMHumanBoneName.Hips].euler // new Vector(0,Math.PI,0)
    state.hips.xyz = restpose[VRMHumanBoneName.Hips].position // new Vector(0,waist,0)
    changes[VRMHumanBoneName.Hips] = state.hips
  }

  //
  // strategy for dealing with hips and shoulder both visible
  //
  // if we *do* have hips and shoulders then we can do accurate estimations of all three hip axes
  // note tensorflow does return the hips on the proper side of the body; if you are facing away from the camera it understands this
  //
  // hips yaw (pirouette axis) is accurate over the whole 360 range from raw mediapipe landmarks (atan of z/x)
  // hips roll is ~reasonable~
  // hips pitch is estimated from a line drawn up to a midpoint between the shoulders (manubrium)
  //
  // @todo verify for certain that hips continue to be calculated by tensorflow even if not visible
  // @todo why is the estimated hips xyz half a meter in the x and y? it should near zero -> it is using lm2d but still the relative displacement should be zero?
  //
  else if (state.hips.visible && state.shoulders.visible) {
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
    const x = restpose[VRMHumanBoneName.Hips].euler.x // - Math.atan2( spine3d.y, spine3d.z) - Math.PI/2
    const y = restpose[VRMHumanBoneName.Hips].euler.y + Math.atan2(hipdir.x, hipdir.z) + Math.PI / 2
    const z = restpose[VRMHumanBoneName.Hips].euler.z // + Math.atan2( hipdir.y, hipdir.x) + Math.PI
    const euler = (state.hips.euler = { x, y, z })

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

    //"my rot estimate is = ",
    //euler.x.toFixed(3),
    //euler.y.toFixed(3),
    //euler.z.toFixed(3),

    //'hips euler is = ',
    //state.hips.euler.x.toFixed(3),
    //state.hips.euler.y.toFixed(3),
    //state.hips.euler.z.toFixed(3),
    //restpose[VRMHumanBoneName.Hips].euler.z

    //)

    changes[VRMHumanBoneName.Hips] = state.hips

    // @todo -> if we have an accurate upper chest orientation is that useful at all? how does this compete with shoulder joints? how are shoulder joints different from upper arms?
    // changes[VRMHumanBoneName.Spine] = state.shoulder
  }

  //
  // strategy for dealing with shoulder only visible (no hips)
  //
  // @todo incomplete
  //
  // if only the shoulders are visible then go ahead and get our estimate on shoulder orientation; but throw away pitch
  // i think we can leave the hips alone (leave at previous estimation if any or at rest pose if none)
  //
  // @todo we may be able to estimate pitch from head?
  // @todo we may want to rotate the "upper chest" bone in the vrm model?
  // @todo we can estimate shoulder yaw - is that useful? should it be applied to something? would it distort other bone transformations?
  // @todo what is the difference between the 'left shoulder' and the 'upper arm'?
  //
  else if (state.shoulders.visible) {
    // state.shoulders.euler = Vector.rollPitchYaw(Vector.fromArray(lm3d[23]), Vector.fromArray(lm3d[24]))
    // state.shoulders.euler.x = 0
    //changes[VRMHumanBoneName.Spine] = state.shoulder
  }

  //////////////////////////////////////////////////////////////////////////////////////////////////////////

  //
  // arms
  //
  // arms arguably rely on shoulder estimation; it is probably reasonable to turn these off if shoulders are not visible
  // not visible current policy is to return to rest state; it may make sense to just do nothing (leave arms extended)
  // @todo note that the lower level helpers have swapped left and right hand for some peverse reason; fix this
  // @todo get resting pose from the VRM model not from the mediapipe helper
  //

  const arms = calcArms(lm3d)

  if (!state.rightHand.visible || !state.shoulders.visible) {
    arms.UpperArm.l = arms.UpperArm.l.multiply(0)
    arms.UpperArm.l.z = RestingDefault.Pose.LeftUpperArm.z
    arms.LowerArm.l = arms.LowerArm.l.multiply(0)
    arms.Hand.l = arms.Hand.l.multiply(0)
  }

  if (!state.leftHand.visible || !state.shoulders.visible) {
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

  //////////////////////////////////////////////////////////////////////////////////////////////////////////
  /*
  //
  // legs
  //
  // if hips are not visible then have legs revert to a rest pose for now
  //

  const legs = calcLegs(lm3d)

  if(!state.hips.visible) {
    legs.UpperLeg.l = legs.UpperLeg.l.multiply(0)
    legs.UpperLeg.r = legs.UpperLeg.r.multiply(0)
    legs.LowerLeg.l = legs.LowerLeg.l.multiply(0)
    legs.LowerLeg.r = legs.LowerLeg.r.multiply(0)
  }

  changes[VRMHumanBoneName.LeftUpperLeg] = { euler: legs.UpperLeg.l, dampener: 1, lerp: 0.3 }
  changes[VRMHumanBoneName.LeftLowerLeg] = { euler: legs.LowerLeg.l, dampener: 1, lerp: 0.3 }
  changes[VRMHumanBoneName.RightUpperLeg] = { euler: legs.UpperLeg.r, dampener: 1, lerp: 0.3 }
  changes[VRMHumanBoneName.RightLowerLeg] = { euler: legs.LowerLeg.r, dampener: 1, lerp: 0.3 }
*/
}

export default UpdateSolvedPose

/*

todo aug 2023

- what exactly are
    readonly LeftShoulder: "leftShoulder";
    readonly LeftUpperArm: "leftUpperArm";
    readonly LeftLowerArm: "leftLowerArm";
    readonly LeftHand: "leftHand";
    are these all joints? or is one of them an actual arm?

- what tells the animation system to stop animating the body? why does it do that sometimes? what am i doing at my end that forces it into that state?
  maybe it depends on if the camera starts up right away or not?
  or maybe if i just start moving too early before assets load?

- i notice the animation system leaps to a t pose sometimes - why? especially if i pause the execution in js debugger

- i notice a spring system in vrm - what is it?
- what are the rest bone positions for a given rig??? i am grabbing them at startup - is that the best way?
- can i interpolate, or collect initial bone positions?
- what are default positions?
- what does it mean that bones are sometimes normalized?
- does upper arm refer to the arm itself or the joint?

- OVERALL ROTATION

  - rotating hips does not rotate the entire avatar root node - do we want to do that?
  - default hips pose is x=3.089, y=0.090, z=-3.081 ... ... whereas "zero" for me is 0,0,0 ... 

- HIPS

  ! hips/shoulders must be estimated correctly or else everything else gets thrown off
  ! hip orientation (yawpitchroll()) is off axis a bit; it makes avatar look drunk
  ? can we use the shoulder midpoint to improve? cross the hip horizontal with the spine?
  ? can we improve forward pitch estimation using z depth between shoulder and hip?
  ? what if i put the entire rig on soft physics springs and then allow parts to tug around?
  ? Does it even make sense to be computing each of these bones by hand?
  ! If I get hips rotation wrong then everything else is scrambled
  ! I notice that kalikokit pretty much ignores the visibility flags - why? is there something i don't understand?
  ? TEST: It is not clear if low visibility per component == bad/zero data or if it reverts to tensorflow speculation
  ? what level of participant mediated correction can we rely on - can the user know to capture their shoulders?

- ARMS / SHOULDERS

  ! insanely the left and right arms/legs are swapped in the source code; all the english words say left, but the indexes refer to the right
  ? seems like there are assumptions about being upright; how can one estimate arm joint angles from an arbitrary shoulder orientation
  - i need to understand better the frame of reference for the kalidokit shoulder to arm pose estimation - is it local or world?

- REST POSE STRATEGY

  ? if a part is not visible (such as wrists) what is the right strategy?
  ? i thought a good strategy was to return to rest pose but this looks terrible
  ? another strategy was to leave as is - test this more to see if it remains relative to subsequent core hips rotations

- GROUND IMPROVE

  ? hips are normally at 0,0,0 - we can find the inverse of the lowest limb to improve this
  ? what if i simply avoid changing the real rig height; or i find the original rig hip height rest position?
  ? can i cache the lowest feature temporally so that a person can jump in the air?
  ? does visibility matter for finding lowest feature?

- IK IMPROVE

  ! hips must be correct!
  ? should i do ik in world space or local space?
  - test feeding the ik with the manually approximated estimated joint rotations and positions

- try new pose algo
- test fixed hands
- test multiple cameras

*/

/*


if (debug) {
  data.za.forEach((landmark, idx) => {
    if (debugPoseObjs[idx] === undefined) {
      const mesh = new Mesh(new SphereGeometry(0.025), new MeshBasicMaterial())
      debugPoseObjs.push(mesh)
      Engine.instance.scene.add(mesh)
    }
    debugPoseObjs[idx].position.set(landmark.x, -landmark.y + 1, landmark.z) //.add(hipsPos)
    debugPoseObjs[idx].updateMatrixWorld()
  })
  /*
  if (data.leftHandLandmarks && data.rightHandLandmarks) {
    ;[...data.leftHandLandmarks, ...data.rightHandLandmarks].forEach((landmark, idx) => {
      if (debugHandObjs[idx] === undefined) {
        const mesh = new Mesh(new SphereGeometry(0.0125), new MeshBasicMaterial())
        debugHandObjs[idx] = mesh
        Engine?.instance?.scene?.add(mesh)
      }
      debugPoseObjs[idx].position.set(landmark.x, -landmark.y + 1, landmark.z) //.add(hipsPos)
      debugPoseObjs[idx].updateMatrixWorld()
    })
  }
*/
