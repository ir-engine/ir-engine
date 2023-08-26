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

import KalmanFilter from './kalman'

import { ArrowHelper, AxesHelper, BoxGeometry, Color, Mesh, MeshBasicMaterial } from 'three'
import { AvatarNetworkAction } from '../avatar/state/AvatarNetworkActions'
import Vector from './solvers/utils/vector'

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// helper to apply landmark to rig
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const demirror = new Quaternion().setFromEuler(new Euler(0, Math.PI, 0))

function ApplyStrategy(poseEnsemble, avatarPosition: Vector3, avatarRotation: Quaternion, props) {
  // get a persistent scratch space
  if (!poseEnsemble.strategies) {
    poseEnsemble.strategies = {}
  }
  if (!poseEnsemble.strategies[props.id]) {
    poseEnsemble.strategies[props.id] = {
      kfx: new KalmanFilter(),
      kfy: new KalmanFilter(),
      kfz: new KalmanFilter()
    }
  }
  const strategy = poseEnsemble.strategies[props.id]

  // support a resting state if not visible?
  const threshhold = 0.5
  const restable =
    props && props.rest && props.landmark && props.landmark.visibility && props.landmark.visibility < threshhold

  // get world space position; adjust wingspan a bit also
  const wingspan = 1.2
  const xyz = new Vector3(
    -strategy.kfx.filter(restable ? props.rest.x : props.landmark.x) * wingspan,
    -strategy.kfy.filter(restable ? props.rest.y : props.landmark.y) * wingspan,
    strategy.kfz.filter(restable ? props.rest.z : props.landmark.z) * wingspan
  )
    .applyQuaternion(demirror)
    .applyQuaternion(avatarRotation)
    .add(avatarPosition)

  // ik part?
  if (props.ik) {
    const entityUUID = `${Engine?.instance?.userID}_mocap_${props.key}` as EntityUUID
    const target = UUIDComponent.entitiesByUUID[entityUUID]
    if (!target) {
      dispatchAction(AvatarNetworkAction.spawnIKTarget({ entityUUID: entityUUID, name: props.key as any }))
    }
    const transform = getComponent(target, TransformComponent)
    if (transform) {
      transform.position.copy(xyz)
      if (props.euler) {
        transform.rotation.copy(new Quaternion().setFromEuler(new Euler(props.euler.x, props.euler.z, props.euler.z)))
        //console.log(props.key,props.euler.x.toFixed(3,props.euler.y.toFixed(3),props.euler.z.toFixed(3)))
      }
    }
  }

  // visualize for debugging
  const debug = true
  if (debug) {
    if (!strategy.mesh) {
      strategy.mesh = new Mesh(
        new BoxGeometry(0.1, 0.1, 0.1),
        new MeshBasicMaterial({ color: props.color || 0xff0000 })
      )
      const gizmo = new AxesHelper()
      gizmo.add(new ArrowHelper(undefined, undefined, undefined, new Color('blue')))
      strategy.mesh.add(gizmo)
      Engine.instance.scene.add(strategy.mesh)
    }
    strategy.mesh.position.copy(xyz)
    strategy.mesh.updateMatrixWorld()
  }
}

const UpdateIkPose = (lm3d: Landmark[], avatarPosition: Vector3, avatarRotation: Quaternion, poseEnsemble) => {
  // a collection of strategies to deal with various body parts - must be inter frame coherent

  //strategies[0] = { color: 0xffffff, key: 'head', ik: true, rest: { x: 0, y: -0.6, z: -0.2 } }
  //strategies[1] = { color: 0xffffff, key: 'chest' }
  //strategies[2] = { color: 0xffffff, key: 'hips' }

  //strategies[POSE_LANDMARKS.LEFT_SHOULDER] = { color: 0x880000, key: 'leftShoulder' }
  //strategies[POSE_LANDMARKS.RIGHT_SHOULDER] = { color: 0x880000, key: 'rightShoulder' }

  //strategies[POSE_LANDMARKS.LEFT_ELBOW] =        { color:0xaa0000, key:'leftElbow', ik:false }
  //strategies[POSE_LANDMARKS.RIGHT_ELBOW] =       { color:0xaa0000, key:'rightElbow', ik:false }

  //strategies[POSE_LANDMARKS.LEFT_HIP] =          { color:0x880000, key:'leftHip' }
  //strategies[POSE_LANDMARKS.RIGHT_HIP] =         { color:0x880000, key:'rightHip' }

  //strategies[POSE_LANDMARKS_LEFT.LEFT_KNEE] =    { color:0xaa0000, key:'leftAnkle', ik:false }
  //strategies[POSE_LANDMARKS_RIGHT.RIGHT_KNEE] =  { color:0xaa0000, key:'rightAnkle', ik:false }

  //strategies[POSE_LANDMARKS_LEFT.LEFT_ANKLE] =   { color:0xee0000, key:'leftAnkle', ik:true }
  //strategies[POSE_LANDMARKS_RIGHT.RIGHT_ANKLE] = { color:0xee0000, key:'rightAnkle', ik:true }

  ApplyStrategy(poseEnsemble, avatarPosition, avatarRotation, {
    id: POSE_LANDMARKS.LEFT_WRIST,
    landmark: lm3d[15],
    euler: Vector.findRotation(
      Vector.fromArray(lm3d[15]),
      Vector.lerp(Vector.fromArray(lm3d[17]), Vector.fromArray(lm3d[19]), 0.5)
    ),
    color: 0xee0000,
    key: 'leftHand',
    ik: true,
    rest: { x: 0.2, y: 0, z: -0.2 } // @todo use poseEnsemble rest
  })

  ApplyStrategy(poseEnsemble, avatarPosition, avatarRotation, {
    id: POSE_LANDMARKS.RIGHT_WRIST,
    landmark: lm3d[16],
    euler: Vector.findRotation(
      Vector.fromArray(lm3d[16]),
      Vector.lerp(Vector.fromArray(lm3d[18]), Vector.fromArray(lm3d[20]), 0.5)
    ),
    color: 0xee0000,
    key: 'rightHand',
    ik: true,
    rest: { x: -0.2, y: 0, z: -0.2 } // @todo use poseEnsemble rest
  })
}

export default UpdateIkPose
