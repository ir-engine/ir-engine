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

import {
  Box3,
  Box3Helper,
  BufferAttribute,
  BufferGeometry,
  Color,
  DoubleSide,
  Group,
  InterleavedBufferAttribute,
  LineBasicMaterial,
  LineSegments,
  Mesh,
  MeshBasicMaterial,
  PlaneGeometry
} from 'three'

import { CSM } from './CSM'

class CSMHelper extends Group {
  private readonly csm: CSM
  public displayFrustum = true
  public displayPlanes = true
  public displayShadowBounds = true
  private frustumLines: LineSegments<BufferGeometry, LineBasicMaterial>
  private cascadeLines: Box3Helper[] = []
  private cascadePlanes: Mesh[] = []
  private shadowLines: Group[] = []
  paused = false

  public constructor(csm: CSM) {
    super()
    this.csm = csm
    globalThis.csmHelper = this

    const indices = new Uint16Array([0, 1, 1, 2, 2, 3, 3, 0, 4, 5, 5, 6, 6, 7, 7, 4, 0, 4, 1, 5, 2, 6, 3, 7])
    const positions = new Float32Array(24)
    const frustumGeometry = new BufferGeometry()
    frustumGeometry.setIndex(new BufferAttribute(indices, 1))
    frustumGeometry.setAttribute('position', new BufferAttribute(positions, 3, false))
    const frustumLines = new LineSegments(frustumGeometry, new LineBasicMaterial())
    this.add(frustumLines)

    this.frustumLines = frustumLines
  }

  public updateVisibility() {
    const displayFrustum = this.displayFrustum
    const displayPlanes = this.displayPlanes
    const displayShadowBounds = this.displayShadowBounds

    const frustumLines = this.frustumLines
    const cascadeLines = this.cascadeLines
    const cascadePlanes = this.cascadePlanes
    const shadowLines = this.shadowLines
    for (let i = 0, l = cascadeLines.length; i < l; i++) {
      const cascadeLine = cascadeLines[i]
      const cascadePlane = cascadePlanes[i]
      const shadowLineGroup = shadowLines[i]

      cascadeLine.visible = displayFrustum
      cascadePlane.visible = displayFrustum && displayPlanes
      shadowLineGroup.visible = displayShadowBounds
    }

    frustumLines.visible = displayFrustum
  }

  public update() {
    if (this.paused) return

    const csm = this.csm
    const camera = csm.camera
    const cascades = csm.cascades
    const mainFrustum = csm.mainFrustum
    const frustums = csm.frustums
    const lights = csm.lights

    const frustumLines = this.frustumLines
    const frustumLinePositions = frustumLines.geometry.getAttribute('position') as
      | BufferAttribute
      | InterleavedBufferAttribute
    const cascadeLines = this.cascadeLines
    const cascadePlanes = this.cascadePlanes
    const shadowLines = this.shadowLines

    this.position.copy(camera.position)
    this.quaternion.copy(camera.quaternion)
    this.scale.copy(camera.scale)
    this.updateMatrixWorld(true)

    while (cascadeLines.length > cascades) {
      this.remove(cascadeLines.pop()!)
      this.remove(cascadePlanes.pop()!)
      this.remove(shadowLines.pop()!)
    }

    while (cascadeLines.length < cascades) {
      const cascadeLine = new Box3Helper(new Box3(), new Color(0xffffff))
      const planeMat = new MeshBasicMaterial({ transparent: true, opacity: 0.1, depthWrite: false, side: DoubleSide })
      const cascadePlane = new Mesh(new PlaneGeometry(), planeMat)
      const shadowLineGroup = new Group()
      const shadowLine = new Box3Helper(new Box3(), new Color(0xffff00))
      shadowLineGroup.add(shadowLine)

      this.add(cascadeLine)
      this.add(cascadePlane)
      this.add(shadowLineGroup)

      cascadeLines.push(cascadeLine)
      cascadePlanes.push(cascadePlane)
      shadowLines.push(shadowLineGroup)
    }

    for (let i = 0; i < cascades; i++) {
      const frustum = frustums[i]
      const light = lights[i]
      const shadowCam = light.shadow.camera
      const farVerts = frustum.vertices.far

      const cascadeLine = cascadeLines[i]
      const cascadePlane = cascadePlanes[i]
      const shadowLineGroup = shadowLines[i]
      const shadowLine = shadowLineGroup.children[0] as Box3Helper

      cascadeLine.box.min.copy(farVerts[2])
      cascadeLine.box.max.copy(farVerts[0])
      cascadeLine.box.max.z += 1e-4

      cascadePlane.position.addVectors(farVerts[0], farVerts[2])
      cascadePlane.position.multiplyScalar(0.5)
      cascadePlane.scale.subVectors(farVerts[0], farVerts[2])
      cascadePlane.scale.z = 1e-4

      this.remove(shadowLineGroup)
      shadowLineGroup.position.copy(shadowCam.position)
      shadowLineGroup.quaternion.copy(shadowCam.quaternion)
      shadowLineGroup.scale.copy(shadowCam.scale)
      shadowLineGroup.updateMatrixWorld(true)
      this.attach(shadowLineGroup)

      shadowLine.box.min.set(shadowCam.bottom, shadowCam.left, -shadowCam.far)
      shadowLine.box.max.set(shadowCam.top, shadowCam.right, -shadowCam.near)
    }

    const nearVerts = mainFrustum.vertices.near
    const farVerts = mainFrustum.vertices.far
    frustumLinePositions.setXYZ(0, farVerts[0].x, farVerts[0].y, farVerts[0].z)
    frustumLinePositions.setXYZ(1, farVerts[3].x, farVerts[3].y, farVerts[3].z)
    frustumLinePositions.setXYZ(2, farVerts[2].x, farVerts[2].y, farVerts[2].z)
    frustumLinePositions.setXYZ(3, farVerts[1].x, farVerts[1].y, farVerts[1].z)

    frustumLinePositions.setXYZ(4, nearVerts[0].x, nearVerts[0].y, nearVerts[0].z)
    frustumLinePositions.setXYZ(5, nearVerts[3].x, nearVerts[3].y, nearVerts[3].z)
    frustumLinePositions.setXYZ(6, nearVerts[2].x, nearVerts[2].y, nearVerts[2].z)
    frustumLinePositions.setXYZ(7, nearVerts[1].x, nearVerts[1].y, nearVerts[1].z)
    frustumLinePositions.needsUpdate = true
  }
}

export default CSMHelper
