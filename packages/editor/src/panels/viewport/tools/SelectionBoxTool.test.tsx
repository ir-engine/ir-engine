/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/ir-engine/ir-engine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Infinite Reality Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Infinite Reality Engine team.

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2023 
Infinite Reality Engine. All Rights Reserved.
*/

import assert from 'assert'
import { describe, it } from 'node:test'
import { Box3, Frustum, Matrix4, PerspectiveCamera, Vector3 } from 'three'

//test view frustum  intersection with box
describe('SelectionBoxTool', () => {
  it('should view frustum intersect with box', () => {
    const box = new Box3(new Vector3(-1, -1, -1), new Vector3(1, 1, 1))
    const camera = new PerspectiveCamera(60, 1, 0.1, 10)
    camera.position.set(0, 0, 5)
    camera.lookAt(new Vector3(0, 0, 0))
    camera.updateProjectionMatrix()
    const frustum = new Frustum()
    const projScreenMatrix = new Matrix4()
    projScreenMatrix.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse)
    frustum.setFromProjectionMatrix(projScreenMatrix)
    const doesIntersect = frustum.intersectsBox(box)
    assert.equal(doesIntersect, true)
  })
  it('should view frustum not box', () => {
    const box = new Box3(new Vector3(-1001, -1001, -1001), new Vector3(-1000, -1000, -1000))
    const camera = new PerspectiveCamera(60, 1, 0.1, 10)
    camera.position.set(0, 0, 5)
    camera.lookAt(new Vector3(0, 0, 0))
    camera.updateProjectionMatrix()
    const frustum = new Frustum()
    const projScreenMatrix = new Matrix4()
    projScreenMatrix.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse)
    frustum.setFromProjectionMatrix(projScreenMatrix)
    const doesIntersect = frustum.intersectsBox(box)
    assert.equal(doesIntersect, false)
  })
  it('should view frustum intersect with multiple boxes', () => {
    const box1 = new Box3(new Vector3(-1, -1, -1), new Vector3(1, 1, 1))
    const box2 = new Box3(new Vector3(-0.2, -0.3, 0), new Vector3(1.2, 1.3, 2))
    const camera = new PerspectiveCamera(60, 1, 0.1, 10)
    camera.position.set(0, 0, 5)
    camera.lookAt(new Vector3(0, 0, 0))
    camera.updateProjectionMatrix()
    const frustum = new Frustum()
    const projScreenMatrix = new Matrix4()
    projScreenMatrix.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse)
    frustum.setFromProjectionMatrix(projScreenMatrix)
    const doesIntersect = frustum.intersectsBox(box1) && frustum.intersectsBox(box2)
    assert.equal(doesIntersect, true)
  })
})
