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

import { Matrix4, Vector2, Vector3, Vector4 } from 'three'

export class OffScreenIndicator {
  target: Vector3
  camera: any
  inside: boolean
  margin: number // Input: A number between 0 to 1
  rotation: number
  borderScale: number
  _vec3: Vector3
  _position: Vector4 // Used Vector4 because an odd behaviour in Vector3
  _vpSize: Vector2
  _halfVPSize: Vector2
  _halfBorderSize: Vector2
  _mat4: Matrix4

  constructor() {
    this._mat4 = new Matrix4()
    this._vec3 = new Vector3()
    this._position = new Vector4()
    this._vpSize = new Vector2()
    this._halfVPSize = new Vector2()
    this._halfBorderSize = new Vector2()
    this.borderScale = 1
  }

  _isInside(pos) {
    return Math.abs(pos.x) <= 1 && Math.abs(pos.y) <= 1 && Math.abs(pos.z) <= 1
  }

  update() {
    const position = this._position

    this.inside = false
    position.set(this.target.x, this.target.y, this.target.z, 1)

    position.applyMatrix4(this.camera.matrixWorldInverse).applyMatrix4(this.camera.projectionMatrix)

    if (position.w !== 1) {
      position.x /= position.w
      position.y /= position.w
      position.z /= position.w
    }

    // Flip coords of object behind the camera
    if (position.w < 0) {
      position.set(-position.x, -position.y, -position.z, 0)
    }

    if (this._isInside(position)) {
      this.inside = true
      return
    }

    //Convert to 0 to 1
    position.x = ((position.x + 1) * this._vpSize.width) / 2
    position.y = ((position.y + 1) * this._vpSize.height) / 2

    // Shift to center of the screen
    position.x -= this._halfVPSize.x
    position.y -= this._halfVPSize.y

    this.rotation = Math.atan2(position.y, position.x)

    const slope = position.y / position.x
    const ySign = Math.sign(position.y)

    const borderX = this._halfBorderSize.x * this.borderScale
    const borderY = this._halfBorderSize.y * this.borderScale

    position.set((ySign * borderY) / slope, ySign * borderY, 0, 0)

    if (position.x < -borderX) {
      //left side
      position.set(-borderX, -borderX * slope, 0, 0)
    } else if (position.x > borderX) {
      //right side
      position.set(borderX, borderX * slope, 0, 0)
    }

    // Undo above transformations
    position.x += this._halfVPSize.x
    position.y += this._halfVPSize.y
    position.x = (position.x / this._vpSize.width) * 2 - 1
    position.y = (position.y / this._vpSize.height) * 2 - 1
  }

  // NDC position
  get position(): Vector3 {
    const pos = this._position
    this._vec3.set(pos.x, pos.y, 0)
    return this._vec3
  }

  getWorldPos(z: number): Vector3 {
    const pos = this.position
    pos.z = z
    this._mat4.multiplyMatrices(this.camera.projectionMatrix, this.camera.matrixWorldInverse).invert()
    pos.applyMatrix4(this._mat4)
    return pos
  }

  setViewportSize(width: number, height: number) {
    this._vpSize.set(width, height)
    this._halfVPSize.set(width * 0.5, height * 0.5)
    this._halfBorderSize.set(width - width * this.margin, height - height * this.margin).multiplyScalar(0.5)
  }
}
