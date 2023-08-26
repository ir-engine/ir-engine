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
import { Euler, Matrix4, Quaternion, Vector3 } from 'three'
import Vector from './solvers/utils/vector'

import { EntityUUID } from '@etherealengine/common/src/interfaces/EntityUUID'

import { Engine } from '../ecs/classes/Engine'
import { getComponent } from '../ecs/functions/ComponentFunctions'
import { UUIDComponent } from '../scene/components/UUIDComponent'
import { TransformComponent } from '../transform/components/TransformComponent'

import { POSE_LANDMARKS } from '@mediapipe/holistic'

import KalmanFilter from './kalman'

import { ArrowHelper, AxesHelper, BoxGeometry, Color, Mesh, MeshBasicMaterial } from 'three'
import { AvatarNetworkAction } from '../avatar/state/AvatarNetworkActions'

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
  const hide =
    props && props.rest && props.landmark && props.landmark.visibility && props.landmark.visibility < threshhold

  // get world space position; adjust wingspan a bit also
  const wingspan = 1.2
  const xyz = new Vector3(
    -strategy.kfx.filter(hide ? props.rest.x : props.landmark.x) * wingspan,
    -strategy.kfy.filter(hide ? props.rest.y : props.landmark.y) * wingspan,
    strategy.kfz.filter(hide ? props.rest.z : props.landmark.z) * wingspan
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
      return
    }
    const transform = getComponent(target, TransformComponent)
    transform?.position.copy(xyz)
    if (props.quaternion) transform?.rotation.copy(props.quaternion)
  }

  // visualize for debugging
  const debug = true
  if (debug) {
    if (!strategy.mesh) {
      strategy.mesh = new Mesh(
        new BoxGeometry(0.01, 0.4, 0.01),
        new MeshBasicMaterial({ color: props.color || 0x000000 })
      )
      const gizmo = new AxesHelper()
      gizmo.add(new ArrowHelper(undefined, undefined, undefined, new Color('blue')))
      strategy.mesh.add(gizmo)
      Engine.instance.scene.add(strategy.mesh)
    }
    strategy.mesh.material.color.setHex(props.color && hide == false ? props.color : 0x000000)
    strategy.mesh.position.copy(xyz)
    if (props.quaternion) strategy.mesh.rotation.setFromQuaternion(props.quaternion)
    strategy.mesh.updateMatrixWorld()
  }
}

const UpdateIkPose = (data, avatarPosition: Vector3, avatarRotation: Quaternion, poseEnsemble) => {
  const lm3d = data?.za
  const lm2d = data?.poseLandmarks
  const face = data?.faceLandmarks

  const left = data?.leftHandLandmarks
  if (left) {
    // left wrist kalidokit - data seems very poor
    // const l = Vector.findRotation(
    //  Vector.fromArray(lm2d[15]),
    //  Vector.lerp(Vector.fromArray(lm2d[17]), Vector.fromArray(lm2d[19]), 0.5)
    // )

    // left wrist manually from high resolution hand data - seems "ok"
    // see https://developers.google.com/mediapipe/solutions/vision/hand_landmarker
    //const lf = new Vector3(lm2d[17].x,lm2d[17].y,lm2d[17].z)
    //const lb = new Vector3(lm2d[15].x,lm2d[15].y,lm2d[15].z)
    //const lu = new Vector3(lm2d[19].x,lm2d[19].y,lm2d[19].z)

    const lf = new Vector3(left[0].x, left[0].y, left[0].z)
    const lb = new Vector3(left[4].x, left[4].y, left[4].z)
    const lu = new Vector3(left[20].x, left[20].y, left[20].z)
    const w = lu.clone().sub(lb)
    const x = lf.clone().sub(lb)
    const z = x.clone().cross(w)
    const y = z.clone().cross(x)
    x.normalize()
    y.normalize()
    z.normalize()
    const m = new Matrix4(x.x, x.y, x.z, 0, y.x, y.y, y.z, 0, z.x, z.y, z.z, 0, 0, 0, 0, 1)
    const q = new Quaternion().setFromRotationMatrix(m)

    ApplyStrategy(poseEnsemble, avatarPosition, avatarRotation, {
      id: POSE_LANDMARKS.LEFT_WRIST,
      landmark: lm3d[15],
      //quaternion: q, //new Quaternion().setFromEuler(new Euler(l.x,l.y,l.z)),
      color: 0xee0000,
      key: 'leftHand',
      ik: true,
      rest: { x: 0.2, y: 0, z: -0.2 } // @todo use poseEnsemble rest
    })
  }

  // right
  const right = data?.rightHandLandmarks
  if (right) {
    //const r2 = Vector.findRotation(
    //  Vector.fromArray(lm3d[16]),
    //  Vector.lerp(Vector.fromArray(lm3d[18]), Vector.fromArray(lm3d[20]), 0.5)
    //)

    // testing leaving it at a fixed orientation but having it rotate with the avatar
    const r = new Vector(0, 0, 0)
    const unused = Vector.findRotation(
      Vector.fromArray(lm3d[16]),
      Vector.lerp(Vector.fromArray(lm3d[18]), Vector.fromArray(lm3d[20]), 0.5)
    )
    const qr = new Quaternion().setFromEuler(new Euler(r.x, r.y, r.z))
    qr.multiply(demirror)
    qr.multiply(avatarRotation)

    // @todo mysteriously if i don't set BOTH ik then no ik is processed

    ApplyStrategy(poseEnsemble, avatarPosition, avatarRotation, {
      id: POSE_LANDMARKS.RIGHT_WRIST,
      landmark: lm3d[16],
      //quaternion: new Quaternion().setFromEuler(new Euler(r.x, r.y, r.z)),
      color: 0xee00ee,
      key: 'rightHand',
      ik: true,
      rest: { x: -0.2, y: 0, z: -0.2 } // @todo use poseEnsemble rest
    })
  }

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
}

export default UpdateIkPose
