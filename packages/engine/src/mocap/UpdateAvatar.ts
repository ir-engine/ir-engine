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

import { VRMHumanBoneName } from '@pixiv/three-vrm'

import { Euler, Quaternion, Vector3 } from 'three'

import UpdateIkPose from './UpdateIkPose'

///
/// Capture the rest pose, elevation and wingspan at startup, and act as a store for inter-frame state
///

const ensembles = {}
function GetPoseEnsemble(userID, rig) {
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

const useIk = true
const updateRigPosition = (rig, key, xyz, dampener = 1, lerpAmount = 0.1) => {
  const vector = new Vector3((xyz?.x || 0) * dampener, (xyz?.y || 0) * dampener, (xyz?.z || 0) * dampener)
  const part = rig.vrm.humanoid!.getNormalizedBoneNode(key)
  if (!part) {
    //console.warn(`can't position ${key}`)
    return
  }
  part.position.lerp(vector, lerpAmount) // interpolate
}

const updateRigRotation = (rig, key, euler, dampener = 1, lerpAmount = 0.3) => {
  const quaternion = new Quaternion().setFromEuler(
    new Euler(
      (euler?.x || 0) * dampener,
      (euler?.y || 0) * dampener,
      (euler?.z || 0) * dampener,
      euler?.rotationOrder || 'XYZ'
    )
  )
  const part = rig.vrm.humanoid!.getNormalizedBoneNode(key)
  if (!part) {
    //console.warn(`can't rotate ${key}`)
    return
  }
  part.quaternion.slerp(quaternion.clone(), lerpAmount) // interpolate
}

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
/// Update Avatar overall; fingers, face, pose, head orientation, hips, feet, ik, non ik...
///

export default function UpdataAvatar(data, userID, entity) {
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
  const avatarHips = avatarRig?.localRig?.hips?.node
  const position = avatarHips.position.clone().applyMatrix4(avatarTransform.matrix)
  const rotation = avatarTransform.rotation

  // get or create persistent state
  const poseEnsemble: any = GetPoseEnsemble(userID, avatarRig)

  /*
  {
    const changes = {}

    // head orientation and facial features
    UpdateLandmarkFace(data?.faceLandmarks, changes)

    // fingers
    UpdateLandmarkHands(data?.leftHandLandmarks, data?.rightHandLandmarks, changes)

    // coarse pose
    UpdateLandmarkPose(data?.za, data?.poseLandmarks, poseEnsemble, changes)

    // apply changes
    ApplyPoseChanges(poseEnsemble.changes, avatarRig)
  }
  */

  // test ik
  UpdateIkPose(data, position, rotation, poseEnsemble)
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

FRONT BURNER

  - i really need the hips to work in ik mode - test?

  - i think i want the wrist ik targets deleted after they are set?
      also can i get the target in one frame?
      is this a good way to send ordinary pose data for consistency?
  
  - is the avatar still flipped?

  - can i get the wrists aligned?

  - can the ik system in general take advantage of the existing knee position?

  - should i flip the hands in the code? they are backwards in code

  - support the concept of jumping by using latency of ground pose estimation

  - support real wingspan estimation

  - can i get head pose to work with the ik system? it is being discarded; maybe I should use an ik head? maybe write to the neck also?

HIPS ISSUES

  * default hips pose from vrm model is x=3.089, y=0.090, z=-3.081 ... ... whereas "zero" for me is 0,0,0 ... use vrm model as rest pose?
  * hips/shoulders must be estimated correctly or else everything else gets thrown off
  * hip orientation (yawpitchroll()) is off axis a bit; it makes avatar look drunk
  * can we use the shoulder midpoint to improve? cross the hip horizontal with the spine?
  * can we improve forward pitch estimation using z depth between shoulder and hip?

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
  ! i had to turn off ground sensing for now - something is fighting my settings?

IK IMPROVE

  - mysteriously if not both the left and right hands have ik targets then the animation system does not apply ik to hands at all
  - mysteriously rotations appear to be ignored on ik targets
  - the body is flipped in the latest build which is causing problems
  
  - @todo since ik fights with direct pose setting - set the direct stuff via ik now instead - but also get the support fixed for both?
  - @todo the hands orientation is not being set - set it

  - test feeding the ik with the manually approximated estimated joint rotations and positions
  - we need a way to use IK AND ordinary coercion of features such as elbows?
  ? should i do ik in world space or local space? do i even have the option?
  - can i set state on the vrm rig and then have all changelists consolidated in the animation system??

   - the body seems to jump or something when i remove an ik??? why???

OTHER LATER

  - test multiple cameras <- this is probably the best thing we could do actually
  - try new pose algo from mediapipe that is more recent than holistic
  - may still be worth trying hip rotations using 2d landmark data - it may have paradoxically better z depth
  - review this approach in detail: https://github.com/ju1ce/Mediapipe-VR-Fullbody-Tracking/blob/main/bin/inference_gui.py 

RANDOM QUESTIONS

  - i notice a spring system in vrm - what is it?
  - what are the rest bone positions for a given rig??? i am grabbing them at startup - is that the best way?
  - what does it mean that bones are 'normalized'?

REFERENCE

  https://github.com/kimgooq/MoCap-Rigging
  https://www.mdpi.com/2076-3417/13/4/2700
  https://github.com/digital-standard/ThreeDPoseUnityBarracuda/blob/f4ad45e83e72bf140128d95b668aef97037c1379/Assets/Scripts/VNectBarracudaRunner.cs <- very impressive
  https://github.com/Kariaro/VRigUnity/tree/main

*/
