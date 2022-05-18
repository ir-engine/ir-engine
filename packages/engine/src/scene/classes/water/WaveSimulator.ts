import { WebGLRenderTarget } from 'three'
import * as THREE from 'three'
import vertexShader from './shaders/waves/vertex'
import dropFragmentShader from './shaders/waves/drop_fragment'
import updateFragmentShader from './shaders/waves/update_fragment'

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

    this._geometry = new THREE.PlaneBufferGeometry(2, 2)

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
