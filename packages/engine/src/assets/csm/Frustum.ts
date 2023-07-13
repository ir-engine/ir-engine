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

import { Matrix4, Vector3 } from 'three'

const inverseProjectionMatrix = new Matrix4()

interface Params {
  projectionMatrix?: Matrix4
  maxFar?: number
}

interface FrustumVertices {
  far: Vector3[]
  near: Vector3[]
}

export default class CSMFrustum {
  public vertices: FrustumVertices = {
    near: [new Vector3(), new Vector3(), new Vector3(), new Vector3()],
    far: [new Vector3(), new Vector3(), new Vector3(), new Vector3()]
  }

  public constructor(data: Params = {}) {
    if (data.projectionMatrix !== undefined) {
      this.setFromProjectionMatrix(data.projectionMatrix, data.maxFar || 10000)
    }
  }

  public setFromProjectionMatrix(projectionMatrix: Matrix4, maxFar: number): FrustumVertices {
    const isOrthographic = projectionMatrix.elements[2 * 4 + 3] === 0

    inverseProjectionMatrix.copy(projectionMatrix).invert()

    // 3 --- 0  vertices.near/far order
    // |     |
    // 2 --- 1
    // clip space spans from [-1, 1]

    this.vertices.near[0].set(1, 1, -1)
    this.vertices.near[1].set(1, -1, -1)
    this.vertices.near[2].set(-1, -1, -1)
    this.vertices.near[3].set(-1, 1, -1)
    this.vertices.near.forEach(function (v) {
      v.applyMatrix4(inverseProjectionMatrix)
    })

    this.vertices.far[0].set(1, 1, 1)
    this.vertices.far[1].set(1, -1, 1)
    this.vertices.far[2].set(-1, -1, 1)
    this.vertices.far[3].set(-1, 1, 1)
    this.vertices.far.forEach(function (v) {
      v.applyMatrix4(inverseProjectionMatrix)

      const absZ = Math.abs(v.z)
      if (isOrthographic) {
        v.z *= Math.min(maxFar / absZ, 1.0)
      } else {
        v.multiplyScalar(Math.min(maxFar / absZ, 1.0))
      }
    })

    return this.vertices
  }

  public split(breaks: number[], target: CSMFrustum[]) {
    while (breaks.length > target.length) {
      target.push(new CSMFrustum())
    }

    target.length = breaks.length

    for (let i = 0; i < breaks.length; i++) {
      const cascade = target[i]

      if (i === 0) {
        for (let j = 0; j < 4; j++) {
          cascade.vertices.near[j].copy(this.vertices.near[j])
        }
      } else {
        for (let j = 0; j < 4; j++) {
          cascade.vertices.near[j].lerpVectors(this.vertices.near[j], this.vertices.far[j], breaks[i - 1])
        }
      }

      if (i === breaks.length - 1) {
        for (let j = 0; j < 4; j++) {
          cascade.vertices.far[j].copy(this.vertices.far[j])
        }
      } else {
        for (let j = 0; j < 4; j++) {
          cascade.vertices.far[j].lerpVectors(this.vertices.near[j], this.vertices.far[j], breaks[i])
        }
      }
    }
  }

  public toSpace(cameraMatrix: Matrix4, target: CSMFrustum) {
    for (let i = 0; i < 4; i++) {
      target.vertices.near[i].copy(this.vertices.near[i]).applyMatrix4(cameraMatrix)

      target.vertices.far[i].copy(this.vertices.far[i]).applyMatrix4(cameraMatrix)
    }
  }
}
