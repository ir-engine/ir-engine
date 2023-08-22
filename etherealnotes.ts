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

// throw away
// various approaches to get an accurate stable head pose - probably will just throw this away in favor of existing calcHead() for now
// estimate head rotation
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
    //v3.multiplyScalar(1.2)
    // rotate around so the puppet faces into the screen; demirror
    //.applyQuaternion(rotationOffset)
    // rotate to be situated relative to the existing avatar strategies so that the ik can achieve its goals
    //.applyQuaternion(rotation)
    // and translate relative to the avatar original hips for now
    //.add(position)
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

///
/// debugging
///

function debugging(lm3d) {
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
