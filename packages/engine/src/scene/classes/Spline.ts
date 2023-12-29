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

// this file is not used

import {
  BoxGeometry,
  BufferAttribute,
  BufferGeometry,
  CatmullRomCurve3,
  Euler,
  Group,
  Line,
  LineBasicMaterial,
  Mesh,
  MeshLambertMaterial,
  Object3D,
  Vector3
} from 'three'

class SplineBase extends Object3D {
  _positions: Vector3[] = []
  _rotations: Euler[] = []
  _divisions: Vector3[] = []
  _curveType: string = 'catmullrom' as 'catmullrom' | 'centripetal' | 'chordal'
  _curve: CatmullRomCurve3

  addPoint(position?: Vector3, rotation?: Euler) {
    if (!position) position = new Vector3()
    this._positions.push(position)
    if (!rotation) rotation = new Euler()
    this._rotations.push(rotation)
    const division = new Vector3()
    this._divisions.push(division)
    return this._positions.length - 1
  }

  removePoint(index = 0) {
    this._positions.splice(index, 1)
    this._rotations.splice(index, 1)
    this._divisions.splice(index, 1)
  }

  getPointAlongCurve(index = 0) {
    if (!this._curve) {
      this._curve = new CatmullRomCurve3(this._positions)
      //this._curve.curveType = this._curveType
    }
  }
}

////////////////////////////////////////////////////////////////////////////////////////
// helper machinery
////////////////////////////////////////////////////////////////////////////////////////

import { ObjectLayers } from '../constants/ObjectLayers'
import { setObjectLayers } from '../functions/setObjectLayers'

const ARC_SEGMENTS = 200
const _point = new Vector3()
const helperGeometry = new BoxGeometry(0.1, 0.1, 0.1)
const helperMaterial = new MeshLambertMaterial({ color: 'white' })
const lineGeometry = new BufferGeometry()
lineGeometry.setAttribute('position', new BufferAttribute(new Float32Array(ARC_SEGMENTS * 3), 3))

export default class Spline extends SplineBase {
  helperLine: Line | null
  helperGroup: Group | null

  addHelper(position?: Vector3, rotation?: Euler) {
    this.addPoint(position, rotation)
    this.updateHelpers()
  }

  removeHelper(helper: Mesh) {
    if (!this.helperGroup) return
    this.helperGroup.remove(helper)
    this.updateHelpers()
  }

  getHelpers() {
    return this.helperGroup ? this.helperGroup.children : []
  }

  updateHelpers() {
    if (this._curve.points.length <= 2) {
      if (this.helperLine) this.helperLine.visible = false
      return
    }

    if (!this.helperLine) {
      this.helperLine = new Line(lineGeometry.clone(), new LineBasicMaterial({ color: 0xff0000, opacity: 0.35 }))
      this.helperLine.castShadow = true
      this.helperLine.layers.set(ObjectLayers.NodeHelper)
      super.add(this.helperLine)
    }
    this.helperLine.visible = true

    const positions = this.helperLine.geometry.attributes.position
    for (let i = 0; i < ARC_SEGMENTS; i++) {
      const t = i / (ARC_SEGMENTS - 1)
      this._curve.getPoint(t, _point)
      positions.setXYZ(i, _point.x, _point.y, _point.z)
    }
    positions.needsUpdate = true

    if (!this.helperGroup) {
      this.helperGroup = new Group()
      this.add(this.helperGroup)
    }
    const helper = new Mesh(helperGeometry, helperMaterial)
    //if (position) helper.position.copy(position)
    //if (rotation) helper.rotation.copy(rotation)
    helper.castShadow = true
    helper.receiveShadow = true
    this.helperGroup.add(helper)
    setObjectLayers(helper, ObjectLayers.NodeHelper)
    //this.addPoint(position)
    this.updateHelpers()
    return helper
  }
}
