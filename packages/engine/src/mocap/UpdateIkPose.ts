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

import { dispatchAction } from '@etherealengine/hyperflux'
import { Euler, Quaternion, Vector3 } from 'three'

import { EntityUUID } from '@etherealengine/common/src/interfaces/EntityUUID'

import { Engine } from '../ecs/classes/Engine'
import { getComponent } from '../ecs/functions/ComponentFunctions'
import { UUIDComponent } from '../scene/components/UUIDComponent'
import { TransformComponent } from '../transform/components/TransformComponent'

import { Landmark, POSE_LANDMARKS } from '@mediapipe/holistic'
import { AvatarNetworkAction } from '../avatar/state/AvatarNetworkState'

import KalmanFilter from './kalman'

import { ArrowHelper, AxesHelper, BoxGeometry, Color, Mesh, MeshBasicMaterial } from 'three'

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// a table of hints on how to resolve landmarks of interest
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const strategies: any = []

//strategies[0] = { color: 0xffffff, key: 'head', ik: true, rest: { x: 0, y: -0.6, z: -0.2 } }

//strategies[1] = { color: 0xffffff, key: 'chest' }
//strategies[2] = { color: 0xffffff, key: 'hips' }

//strategies[POSE_LANDMARKS.LEFT_SHOULDER] = { color: 0x880000, key: 'leftShoulder' }
//strategies[POSE_LANDMARKS.RIGHT_SHOULDER] = { color: 0x880000, key: 'rightShoulder' }

//strategies[POSE_LANDMARKS.LEFT_ELBOW] =        { color:0xaa0000, key:'leftElbow', ik:false }
//strategies[POSE_LANDMARKS.RIGHT_ELBOW] =       { color:0xaa0000, key:'rightElbow', ik:false }

strategies[POSE_LANDMARKS.LEFT_WRIST] = { color: 0xee0000, key: 'leftHand', ik: true, rest: { x: 0.2, y: 0, z: -0.2 } }
strategies[POSE_LANDMARKS.RIGHT_WRIST] = {
  color: 0xee0000,
  key: 'rightHand',
  ik: true,
  rest: { x: -0.2, y: 0, z: -0.2 }
}

//strategies[POSE_LANDMARKS.LEFT_HIP] =          { color:0x880000, key:'leftHip' }
//strategies[POSE_LANDMARKS.RIGHT_HIP] =         { color:0x880000, key:'rightHip' }

//strategies[POSE_LANDMARKS_LEFT.LEFT_KNEE] =    { color:0xaa0000, key:'leftAnkle', ik:false }
//strategies[POSE_LANDMARKS_RIGHT.RIGHT_KNEE] =  { color:0xaa0000, key:'rightAnkle', ik:false }

//strategies[POSE_LANDMARKS_LEFT.LEFT_ANKLE] =   { color:0xee0000, key:'leftAnkle', ik:true }
//strategies[POSE_LANDMARKS_RIGHT.RIGHT_ANKLE] = { color:0xee0000, key:'rightAnkle', ik:true }

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// helper to apply landmark to rig
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const demirror = new Quaternion().setFromEuler(new Euler(0, Math.PI, 0))

function UpdatePart(part, landmark: Landmark, position: Vector3, rotation: Quaternion) {
  // build filters for smoothing inputs
  if (!part.kfx) part.kfx = new KalmanFilter()
  if (!part.kfy) part.kfy = new KalmanFilter()
  if (!part.kfz) part.kfz = new KalmanFilter()

  // support a resting state if not visible?
  const rest = landmark.visibility && landmark.visibility < 0.5 && part.rest

  // get world space position; adjust wingspan a bit also
  const xyz = new Vector3(
    -part.kfx.filter(rest ? part.rest.x : landmark.x) * 1.2,
    -part.kfy.filter(rest ? part.rest.y : landmark.y) * 1.2,
    part.kfz.filter(rest ? part.rest.z : landmark.z) * 1.2
  )
    .applyQuaternion(demirror)
    .applyQuaternion(rotation)
    .add(position)

  // ik part? (otherwise the above is just being run for debugging)
  if (part.ik) {
    const entityUUID = `${Engine?.instance?.userId}_mocap_${part.key}` as EntityUUID
    const target = UUIDComponent.entitiesByUUID[entityUUID]
    if (!target) {
      dispatchAction(AvatarNetworkAction.spawnIKTarget({ entityUUID: entityUUID, name: part.key as any }))
    }
    const transform = getComponent(target, TransformComponent)
    if (transform) {
      transform.position.copy(xyz)
      //if (part.rotation) {
      //  transform.rotation.copy(part.rotation)
      //}
    }
  }

  const debug = true
  if (debug) {
    if (!part.mesh) {
      part.mesh = new Mesh(new BoxGeometry(0.1, 0.1, 0.1), new MeshBasicMaterial({ color: part.color || 0xff0000 }))
      const gizmo = new AxesHelper()
      gizmo.add(new ArrowHelper(undefined, undefined, undefined, new Color('blue')))
      part.mesh.add(gizmo)
      Engine.instance.scene.add(part.mesh)
    }
    part.mesh.position.copy(xyz)
    part.mesh.updateMatrixWorld()
  }
}

const UpdateIkPose = (lm3d: Landmark[], position: Vector3, rotation: Quaternion) => {
  for (let i = 0; i < lm3d.length; i++) {
    const part = strategies[i]
    const landmark = lm3d[i]
    if (part && landmark) {
      UpdatePart(part, landmark, position, rotation)
    }
  }
}

export default UpdateIkPose
