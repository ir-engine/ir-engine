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

import { EntityUUID } from '@etherealengine/common/src/interfaces/EntityUUID'
import { dispatchAction } from '@etherealengine/hyperflux'

import { Engine } from '../ecs/classes/Engine'
import { getComponent } from '../ecs/functions/ComponentFunctions'
import { UUIDComponent } from '../scene/components/UUIDComponent'
import { TransformComponent } from '../transform/components/TransformComponent'

import { Landmark, POSE_LANDMARKS } from '@mediapipe/holistic'

import {
  ArrowHelper,
  AxesHelper,
  BoxGeometry,
  Color,
  Euler,
  Matrix4,
  Mesh,
  MeshBasicMaterial,
  Quaternion,
  Triangle,
  Vector3
} from 'three'

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// a table of hints on how to resolve landmarks of interest
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const strategies: any = []

//strategies[0] = { color: 0xffffff, key: 'head', ik: true, rest: { x: 0, y: -0.6, z: -0.2 } }

strategies[1] = { color: 0xffffff, key: 'chest' }
strategies[2] = { color: 0xffffff, key: 'hips' }

strategies[POSE_LANDMARKS.LEFT_SHOULDER] = { color: 0x880000, key: 'leftShoulder' }
strategies[POSE_LANDMARKS.RIGHT_SHOULDER] = { color: 0x880000, key: 'rightShoulder' }

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

import { AvatarNetworkAction } from '../avatar/state/AvatarNetworkState'
import KalmanFilter from './kalman'

const debug = 1 | 2
const rotationOffset = new Quaternion().setFromEuler(new Euler(0, Math.PI, 0))

// a helper for applying a landmark to pose using various strategies
const helper = (part, landmark, position, rotation) => {
  // noise reduction
  if (!part.kfx) part.kfx = new KalmanFilter()
  if (!part.kfy) part.kfy = new KalmanFilter()
  if (!part.kfz) part.kfz = new KalmanFilter()
  part.x = part.kfx.filter(landmark.x)
  part.y = part.kfy.filter(landmark.y)
  part.z = part.kfz.filter(landmark.z)

  // @todo this strategies for dealing with non visibility could be improved; merely going to a rest pose is sub-optimal
  if (landmark.visibility && landmark.visibility < 0.5 && part.rest) {
    part.x = part.rest.x
    part.y = part.rest.y
    part.z = part.rest.z
  }

  // vitrivian to 3js
  const xyz = new Vector3(
    // x needs to be reversed to go from virtrivuan to ethereal 3js right handed coordinate system
    -part.x,
    // y needs to be reversed to go from virtrivuan to ethereal 3js right handed coordinate system
    -part.y,
    // input z is just kinda unstable; needs work
    part.z
  )
    // wingspan
    .multiplyScalar(1.2)
    // rotate around so the puppet faces into the screen; demirror
    .applyQuaternion(rotationOffset)
    // rotate to be situated relative to the existing avatar strategies so that the ik can achieve its goals
    .applyQuaternion(rotation)
    // and translate relative to the avatar original hips for now
    .add(position)

  // set a target on the ik system?
  if (part.ik) {
    const entityUUID = `${Engine?.instance?.userId}_mocap_${part.key}` as EntityUUID
    const target = UUIDComponent.entitiesByUUID[entityUUID]
    if (!target) {
      dispatchAction(AvatarNetworkAction.spawnIKTarget({ entityUUID: entityUUID, name: part.key as any }))
    }
    const transform = getComponent(target, TransformComponent)

    // set absolute position in world space if any
    transform.position.copy(xyz)

    // apply rotation if any
    if (part.rotation) {
      transform.rotation.copy(part.rotation)
    }
  }

  // debugging
  if (!part.mesh && debug & 1) {
    part.mesh = new Mesh(new BoxGeometry(0.1, 0.1, 0.1), new MeshBasicMaterial({ color: part.color || 0xff0000 }))
    const gizmo = new AxesHelper()
    gizmo.add(new ArrowHelper(undefined, undefined, undefined, new Color('blue')))
    part.mesh.add(gizmo)
    Engine.instance.scene.add(part.mesh)
  }
  part.mesh.position.copy(xyz)
  part.mesh.updateMatrixWorld()
}

export const UpdatePose = (lm3d: Landmark[], lm2d: Landmark[], position: Vector3, rotation: Quaternion) => {
  // estimate head rotation
  // https://medium.com/@susanne.thierfelder/head-pose-estimation-with-mediapipe-and-opencv-in-javascript-c87980df3acb
  // https://storage.googleapis.com/mediapipe-assets/Model%20Card%20Blendshape%20V2.pdf
  // https://stevehazen.wordpress.com/2010/02/15/matrix-basics-how-to-step-away-from-storing-an-orientation-as-3-angles/
  // https://discourse.threejs.org/t/get-a-triangle-rotation-x-y-z-from-its-vertices/22860/13

  const OrientHead = false
  if (OrientHead) {
    const v1 = new Vector3(
      lm3d[POSE_LANDMARKS.LEFT_EAR].x,
      lm3d[POSE_LANDMARKS.LEFT_EAR].y,
      lm3d[POSE_LANDMARKS.LEFT_EAR].z
    )
    const v2 = new Vector3(
      lm3d[POSE_LANDMARKS.RIGHT_EAR].x,
      lm3d[POSE_LANDMARKS.RIGHT_EAR].y,
      lm3d[POSE_LANDMARKS.RIGHT_EAR].z
    )
    const v3 = new Vector3((lm3d[9].x + lm3d[10].x) / 2, (lm3d[9].y + lm3d[10].y) / 2, (lm3d[9].z + lm3d[10].z) / 2)
    //visibility: (lm3d[POSE_LANDMARKS.MOUTH_LEFT].visibility || 0) + (lm3d[POSE_LANDMARKS.MOUTH_RIGHT].visibility || 0) / 2

    const triangle = new Triangle(v1, v2, v3)

    const midPoint = new Vector3()
    triangle.getMidpoint(midPoint)

    const xNormal = new Vector3().subVectors(v3, v2).normalize()
    const yNormal = new Vector3().subVectors(v1, midPoint).normalize()
    const zNormal = new Vector3()
    triangle.getNormal(zNormal)

    const rotationMatrix = new Matrix4().set(
      ...[...xNormal.toArray(), 0, ...yNormal.toArray(), 0, ...zNormal.toArray(), 0, 0, 0, 0, 1]
    )

    const q = new Quaternion().setFromRotationMatrix(rotationMatrix).conjugate()

    // multiply(rotation) //

    const { x, y, z } = new Euler().setFromQuaternion(q)

    strategies[0].rotation = q

    const dec = 3
    console.log(
      'euler --',
      x.toFixed(dec),
      y.toFixed(dec),
      z.toFixed(dec),
      'left --',
      v1.x.toFixed(dec),
      v1.y.toFixed(dec),
      v1.z.toFixed(dec),
      'right --',
      v2.x.toFixed(dec),
      v2.y.toFixed(dec),
      v2.z.toFixed(dec),
      'mouth --',
      v3.x.toFixed(dec),
      v3.y.toFixed(dec),
      v3.z.toFixed(dec)
    )
  }

  // visit the instrumented parts
  for (let i = 0; i < lm3d.length; i++) {
    const part = strategies[i]
    if (part) {
      helper(part, lm3d[i], position, rotation)
    }
  }

  // debugging
  if (debug & 2) {
    // estimate head position from ears
    lm3d[0].x = (lm3d[POSE_LANDMARKS.LEFT_EAR].x + lm3d[POSE_LANDMARKS.RIGHT_EAR].x) / 2
    lm3d[0].y = (lm3d[POSE_LANDMARKS.LEFT_EAR].y + lm3d[POSE_LANDMARKS.RIGHT_EAR].y) / 2
    lm3d[0].z = (lm3d[POSE_LANDMARKS.LEFT_EAR].z + lm3d[POSE_LANDMARKS.RIGHT_EAR].z) / 2
    lm3d[0].visibility =
      (lm3d[POSE_LANDMARKS.LEFT_EAR].visibility || 0) + (lm3d[POSE_LANDMARKS.RIGHT_EAR].visibility || 0) / 2

    // estimate shoulder center
    lm3d[1].x = (lm3d[POSE_LANDMARKS.LEFT_SHOULDER].x + lm3d[POSE_LANDMARKS.RIGHT_SHOULDER].x) / 2
    lm3d[1].y = (lm3d[POSE_LANDMARKS.LEFT_SHOULDER].y + lm3d[POSE_LANDMARKS.RIGHT_SHOULDER].y) / 2
    lm3d[1].z = (lm3d[POSE_LANDMARKS.LEFT_SHOULDER].z + lm3d[POSE_LANDMARKS.RIGHT_SHOULDER].z) / 2
    lm3d[1].visibility =
      (lm3d[POSE_LANDMARKS.LEFT_SHOULDER].visibility || 0) + (lm3d[POSE_LANDMARKS.RIGHT_SHOULDER].visibility || 0) / 2

    // estimate hip center
    lm3d[2].x = (lm3d[POSE_LANDMARKS.LEFT_HIP].x + lm3d[POSE_LANDMARKS.RIGHT_HIP].x) / 2
    lm3d[2].y = (lm3d[POSE_LANDMARKS.LEFT_HIP].y + lm3d[POSE_LANDMARKS.RIGHT_HIP].y) / 2
    lm3d[2].z = (lm3d[POSE_LANDMARKS.LEFT_HIP].z + lm3d[POSE_LANDMARKS.RIGHT_HIP].z) / 2
    lm3d[2].visibility =
      (lm3d[POSE_LANDMARKS.LEFT_HIP].visibility || 0) + (lm3d[POSE_LANDMARKS.RIGHT_HIP].visibility || 0) / 2

    const dec = 3
    console.log(
      /*
      // typically around 0.009 -0.609 -0.157
      ' -- HEAD ',
      lm3d[0].x.toFixed(dec),
      lm3d[0].y.toFixed(dec),
      lm3d[0].z.toFixed(dec),
      lm3d[0].visibility?.toFixed(dec),

      // typically around 0.001 -0.423 -0.113
      ' -- CHEST ',
      lm3d[1].x.toFixed(dec),
      lm3d[1].y.toFixed(dec),
      lm3d[1].z.toFixed(dec),
      lm3d[1].visibility?.toFixed(dec),
      ' -- HIP ', // usually seems to be perfectly centered in fact at 0,0,0; so this is the center of the man
      lm3d[2].x.toFixed(dec),
      lm3d[2].y.toFixed(dec),
      lm3d[2].z.toFixed(dec),
      lm3d[2].visibility?.toFixed(dec),
  */
      /*      // seems to be typically at around 0.155 -0.433 -0.098
      "-- LS ",
      lm3d[11].x.toFixed(dec),
      lm3d[11].y.toFixed(dec),
      lm3d[11].z.toFixed(dec),
      lm3d[11].visibility?.toFixed(dec),
      // seems to typically be around -0.152 -0.413 -0.128
      " -- RS ",
      lm3d[12].x.toFixed(dec),
      lm3d[12].y.toFixed(dec),
      lm3d[12].z.toFixed(dec),
      lm3d[12].visibility?.toFixed(dec),
      "-- LA ",
      lm3d[27].x.toFixed(dec),
      lm3d[27].y.toFixed(dec),
      lm3d[27].z.toFixed(dec),
      lm3d[27].visibility?.toFixed(dec),
      " -- RA ",
      lm3d[28].x.toFixed(dec),
      lm3d[28].y.toFixed(dec),
      lm3d[28].z.toFixed(dec),
      lm3d[28].visibility?.toFixed(dec),
*/
      // forward in palms up arrest posture: -- LW  0.251 -0.469 -0.272 0.999  -- RW  -0.249 -0.449 -0.366 0.998 ; this is facing forward, centered, palms up as if i am being arrested
      // sideways doesn't really change z (makes sense since it is a projection from camera)
      '-- LW ',
      lm3d[15].x.toFixed(dec),
      lm3d[15].y.toFixed(dec),
      lm3d[15].z.toFixed(dec),
      lm3d[15].visibility?.toFixed(dec),
      ' -- RW ',
      lm3d[16].x.toFixed(dec),
      lm3d[16].y.toFixed(dec),
      lm3d[16].z.toFixed(dec),
      lm3d[16].visibility?.toFixed(dec),
      '-- LW2 ',
      lm2d[15].x.toFixed(dec),
      lm2d[15].y.toFixed(dec),
      lm2d[15].z.toFixed(dec),
      lm2d[15].visibility?.toFixed(dec),
      ' -- RW2 ',
      lm2d[16].x.toFixed(dec),
      lm2d[16].y.toFixed(dec),
      lm2d[16].z.toFixed(dec),
      lm2d[16].visibility?.toFixed(dec)
    )
  }
}

/*

issues:

- the body seems to jump or something when i remove an ik
- what is the scale of the puppet? is it 1? or 1.5? wingspan
- rotate head
- pivot hips

notes re normalized data:
  - all points are centered on the avatar as a vitrivian man with radius 0.5 or diameter 1
  - for example the left shoulder is often at 0.14 in the x axis and the right shoulder is at -0.14
  - raw data y is negative upwards, so the shoulder y is at -0.45; which is the opposite of the 3js convention

notes re z depth
  - z pose estimates are poor from the front, we don't really know exactly where the wrists are in 3d space; you could be punching forward for example at full extent, or have a hand on your chest
  - raw z data doesn't seem to really change - it is unclear
  - but we *do* have an elbow; and we also know that the elbow typically is forward of the chest because the shoulder joint doesn't go back very far; we can estimate elbow pose
  - given an elbow pose it is arguable that we could estimate the wrist z position also???

notes re scaling to real puppet
  - we have to make sure that we multiply by the real world wingspan of a real person - definitely larger than 1 meter? but it doesn't seem to be much larger?

notes re visibility
  - there is pretty much always data; just a threshhold, 0.3 seems like a good throw-away threshhold

https://github.com/kimgooq/MoCap-Rigging
https://www.mdpi.com/2076-3417/13/4/2700
https://github.com/digital-standard/ThreeDPoseUnityBarracuda/blob/f4ad45e83e72bf140128d95b668aef97037c1379/Assets/Scripts/VNectBarracudaRunner.cs <- very impressive
https://github.com/Kariaro/VRigUnity/tree/main

*/

/*
      if(node.line) {
      // line1 = new Mesh(new BoxGeometry(0.1,1,0.1), new MeshBasicMaterial(color))
      // elem.mesh.add(line)
      // const ray = new Vector3(v2.x-v1.x,v2.y-v1.y,v2.z-v1.z)
      // line1.mesh.quaternion.setFromUnitVectors(new Vector3(0,1,0), ray.normalize() )
      // line1.mesh.position.set(ray.x,ray.y+2,ray.z)
      // line1.mesh.updateMatrixWorld()
      // const rotation = new Euler().setFromQuaternion( line1.mesh.quaternion)
      //mesh.quaternion.setFromAxisAngle( axis.normalize(), THREE.MathUtils.degToRad(degree) );
      //  mesh.position.x = (v1.x+v2.x)/2
      // mesh.position.y = (v1.y+v2.y)/2 + 2
      // mesh.position.z = (v1.z+v2.z)/2
      // mesh.scale.x = 0.1
      // mesh.scale.y = ray.length() * 4
      //mesh.scale.z = 0.1
    }
*/
