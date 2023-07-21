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

import * as THREE from 'three'
import { WebGLRenderTarget } from 'three'

import dropFragmentShader from './shaders/waves/drop_fragment'
import updateFragmentShader from './shaders/waves/update_fragment'
import vertexShader from './shaders/waves/vertex'

export class WaveSimulator {
  _camera
  _geometry
  _targetA: WebGLRenderTarget
  _targetB: WebGLRenderTarget
  target: WebGLRenderTarget
  _dropMesh
  _updateMesh

  constructor(waterSize) {
    this._camera = new THREE.OrthographicCamera(0, 1, 1, 0, 0, 2000)

    this._geometry = new THREE.PlaneGeometry(2, 2)

    this._targetA = new THREE.WebGLRenderTarget(waterSize, waterSize, { type: THREE.FloatType })
    this._targetB = new THREE.WebGLRenderTarget(waterSize, waterSize, { type: THREE.FloatType })
    this.target = this._targetA

    const dropMaterial = new THREE.RawShaderMaterial({
      uniforms: {
        center: { value: [0, 0] },
        radius: { value: 0 },
        strength: { value: 0 },
        texture: { value: null }
      },
      vertexShader: vertexShader,
      fragmentShader: dropFragmentShader
    })

    const updateMaterial = new THREE.RawShaderMaterial({
      uniforms: {
        delta: { value: [1 / 216, 1 / 216] }, // TODO: Remove this useless uniform and hardcode it in shaders?
        texture: { value: null }
      },
      vertexShader: vertexShader,
      fragmentShader: updateFragmentShader
    })

    this._dropMesh = new THREE.Mesh(this._geometry, dropMaterial)
    this._updateMesh = new THREE.Mesh(this._geometry, updateMaterial)
  }

  // Add a drop of water at the (x, y) coordinate (in the range [-1, 1])
  addDrop(renderer, x, y, radius, strength) {
    this._dropMesh.material.uniforms['center'].value = [x, y]
    this._dropMesh.material.uniforms['radius'].value = radius
    this._dropMesh.material.uniforms['strength'].value = strength

    this._render(renderer, this._dropMesh)
  }

  stepSimulation(renderer) {
    this._render(renderer, this._updateMesh)
  }

  _render(renderer, mesh) {
    // Swap textures
    const _oldTarget = this.target
    const _newTarget = this.target === this._targetA ? this._targetB : this._targetA

    const oldTarget = renderer.getRenderTarget()

    renderer.setRenderTarget(_newTarget)

    mesh.material.uniforms['texture'].value = _oldTarget.texture

    // TODO Camera is useless here, what should be done?
    renderer.render(mesh, this._camera)

    renderer.setRenderTarget(oldTarget)

    this.target = _newTarget
  }
}
