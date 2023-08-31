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

import { dispatchAction } from '@etherealengine/hyperflux'

import { AvatarRigComponent } from '../avatar/components/AvatarAnimationComponent'
import { getComponent } from '../ecs/functions/ComponentFunctions'
import { TransformComponent } from '../transform/components/TransformComponent'

import { VRMHumanBoneName } from '@pixiv/three-vrm'

import { Euler, Quaternion, Vector3 } from 'three'

import UpdateIkPose from './UpdateIkPose'

import { EntityUUID } from '@etherealengine/common/src/interfaces/EntityUUID'
import { AvatarNetworkAction } from '../avatar/state/AvatarNetworkActions'
import { Engine } from '../ecs/classes/Engine'
import { Entity } from '../ecs/classes/Entity'
import { UUIDComponent } from '../scene/components/UUIDComponent'

import { ArrowHelper, AxesHelper, BoxGeometry, Color, Mesh, MeshBasicMaterial } from 'three'

///
/// Capture the rest pose, elevation and wingspan at startup, and act as a store for inter-frame state
///

const ensembles = {}
function GetPoseEnsemble(userID, entity) {
  let ensemble = ensembles[userID]
  if (ensemble) {
    return ensemble
  }
  ensemble = ensembles[userID] = {
    lowest: 999,
    rest: {}
  }
  const rig = getComponent(entity, AvatarRigComponent)
  if (!rig || !rig.bindRig || !rig.bindRig.hips || !rig.bindRig.hips.node) {
    console.warn('pose no rig')
    return
  }
  console.log(rig.bindRig)

  //const temp = rig.bindRig.hips.node.getWorldQuaternion(new Quaternion()).invert()
  const temp2 = rig.bindRig.hips.node.getWorldPosition(new Vector3())
  console.log(temp2)

  // @todo actually each piece should be in world space relative to the hips
  Object.entries(VRMHumanBoneName).forEach(([key, key2]) => {
    const part = rig.vrm.humanoid!.getNormalizedBoneNode(key2)
    if (!part) return
    const xyz = part.position
    const quaternion = part.quaternion
    const euler = new Euler().setFromQuaternion(part.quaternion)
    ensemble.rest[key2] = { xyz, quaternion, euler }
    console.log(key, xyz.x, xyz.y, xyz.z)
  })
  return ensemble
}

const demirror = new Quaternion().setFromEuler(new Euler(0, Math.PI, 0))
const debugmeshes = {}

function ApplyPoseChange(entity: Entity, key, change) {
  const rig = getComponent(entity, AvatarRigComponent)
  if (!rig || !rig.bindRig || !rig.bindRig.hips || !rig.bindRig.hips.node) {
    console.warn('pose change no rig')
    return
  }
  const transform = getComponent(entity, TransformComponent)

  // props we can set on body parts
  let xyz = change.xyz || null
  let quaternion = change.quaternion || null
  const dampener = change.dampener || 1.0
  const lerp = change.lerp || 1.0
  const color = change.color || 0x000000
  const ik = change.ik ? true : false
  const shown = change.shown ? true : false
  const euler = change.euler || null
  const debug = change.debug || true
  const blendweight = change.blendweight || 1.0

  // get part in question
  const part = rig.vrm.humanoid!.getNormalizedBoneNode(key)
  if (!part) {
    console.warn('cannot set', key)
    return
  }

  // dampen xyz
  if (xyz) {
    xyz.x *= dampener
    xyz.y *= dampener
    xyz.z *= dampener
  }

  // promote euler to quaternion if any with dampener
  if (euler) {
    quaternion = new Quaternion().setFromEuler(
      new Euler(
        (euler?.x || 0) * dampener,
        (euler?.y || 0) * dampener,
        (euler?.z || 0) * dampener,
        euler?.rotationOrder || 'XYZ'
      )
    )
  }

  // ik part?
  if (ik) {
    // ik requires you to supply an avatar relative position (relative to ground at origin)
    if (!xyz) {
      //xyz = rig.vrm.humanoid.rawRestPose[key].node.getWorldPosition(new Vector3())
      //console.log('bindpose', key, xyz.x.toFixed(3), xyz.y.toFixed(3), xyz.z.toFixed(3))
      console.warn('ik requires xyz')
      return
    }

    // ik requires xyz to be in absolute world position for the absolute world target, so must add avatar current position
    xyz = new Vector3(xyz.x, xyz.y, xyz.z).applyQuaternion(transform.rotation).add(transform.position)

    // this is how we will get iktargets later on:
    //const target = getComponent(entity, AvatarAnimationComponent).ikTarget[key]

    // for now get a dispatch target
    const entityUUID = `${Engine?.instance?.userID}_mocap_${key}` as EntityUUID
    const target = UUIDComponent.entitiesByUUID[entityUUID]
    if (!target) {
      dispatchAction(AvatarNetworkAction.spawnIKTarget({ entityUUID: entityUUID, name: key as any }))
      return
    }

    // if we have a handle on a target then set it
    const targetTransform = getComponent(target, TransformComponent)
    if (xyz) targetTransform?.position.copy(xyz)
    if (quaternion) targetTransform?.rotation.copy(quaternion)
  }

  // directly set joint not using ik
  if (!ik) {
    if (quaternion) {
      part.quaternion.slerp(quaternion.clone(), lerp)
    }
    if (xyz) {
      part.position.lerp(xyz, lerp)
    }
  }

  // visualize for debugging - can only handle one avatar
  if (debug) {
    let mesh = debugmeshes[key]
    if (!mesh) {
      debugmeshes[key] = mesh = new Mesh(new BoxGeometry(0.01, 0.4, 0.01), new MeshBasicMaterial({ color }))
      const gizmo = new AxesHelper()
      gizmo.add(new ArrowHelper(undefined, undefined, undefined, new Color('blue')))
      mesh.add(gizmo)
      Engine.instance.scene.add(mesh)
    }
    mesh.material.color.setHex(shown == true ? color : 0x000000)
    if (xyz) mesh.position.copy(xyz)
    if (quaternion) mesh.rotation.setFromQuaternion(quaternion)
    mesh.updateMatrixWorld()
  }
}

function ApplyPoseChanges(entity: Entity, changes) {
  Object.entries(changes).forEach(([key, change]) => {
    ApplyPoseChange(entity, key, change)
  })
}

///
/// Update Avatar overall; fingers, face, pose, head orientation, hips, feet, ik, non ik...
///

export default function UpdateAvatar(data, userID, entity) {
  // sanity check
  if (!data || !data.za || !data.poseLandmarks) {
    console.warn('no data')
    return
  }

  // use landmarks to directly set head orientation and facial features
  // const changes1 = UpdateLandmarkFace(data?.faceLandmarks)
  // ApplyPoseChanges(entity,changes1)

  // use landmarks to directly set fingers
  // const changes2 = UpdateLandmarkHands(data?.leftHandLandmarks, data?.rightHandLandmarks)
  // ApplyPoseChanges(entity,changes2)

  // use landmarks to set coarse pose
  // const changes3 = UpdateLandmarkPose(data?.za, data?.poseLandmarks)
  // ApplyPoseChanges(entity,changes3)

  // publish ik targets rather than directly setting body parts
  const changes4 = UpdateIkPose(data)
  ApplyPoseChanges(entity, changes4)
}

/*

NOTES Aug 2023
  - all points are centered on the avatar as a vitrivian man with radius 0.5 or diameter 1
  - for example the left shoulder is often at 0.14 in the x axis and the right shoulder is at -0.14
  - raw data y is negative upwards, so the shoulder y is at -0.45; which is the opposite of the 3js convention
  - z pose estimates are poor from the front, we don't really know exactly where the wrists are in 3d space; you could be punching forward for example at full extent, or have a hand on your chest
  - raw z data does exist but fairly weak; good enough for hips pirouette however
  - note that 'visibility' also is slightly unclear as a concept; tensorflow appears to speculate even if no visibility

BUGS aug 31 2023

  - applying hips through the animation system is screwy

  - fingers do exist but finger twiddling does not show up visually

  - i would like to delete ik targets after set once; and get the handle on them instantly

  - wrists angle is wrong for ik

  - support real wingspan estimation

  - ik system totally fights the non ik system; we should allow both to co-exist

  - jumping is broken

HIPS

  * default hips pose from vrm model is x=3.089, y=0.090, z=-3.081 ... ... whereas "zero" for me is 0,0,0 ...
      - use vrm model as rest pose? is that a good idea or not?
      - shouldn't the default hips be at 0,0,0?
      - perhaps the engine starts the player at a random position

  * hips/shoulders must be estimated correctly or else everything else gets thrown off!
  * hip orientation (yawpitchroll()) is off axis a bit; it makes avatar look drunk; should not set roll!
  * can we use the shoulder midpoint to improve? cross the hip horizontal with the spine? (yes works well)
  * can we improve forward pitch estimation using z depth between shoulder and hip? (yes works well)

  x what if i put the entire rig on soft physics springs and then allow parts to tug around?
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
