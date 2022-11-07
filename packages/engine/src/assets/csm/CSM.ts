import {
  Box3,
  DirectionalLight,
  Material,
  MathUtils,
  Matrix4,
  Mesh,
  Object3D,
  PerspectiveCamera,
  ShaderChunk,
  Shader as ShaderType,
  Vector2,
  Vector3
} from 'three'

import { OBCType } from '../../common/constants/OBCTypes'
import { addOBCPlugin, removeOBCPlugin } from '../../common/functions/OnBeforeCompilePlugin'
import Frustum from './Frustum'
import Shader from './Shader'

const _cameraToLightMatrix = new Matrix4()
const _lightSpaceFrustum = new Frustum()
const _center = new Vector3()
const _bbox = new Box3()
const _uniformArray = []
const _logArray = []

export const CSMModes = {
  UNIFORM: 'UNIFORM',
  LOGARITHMIC: 'LOGARITHMIC',
  PRACTICAL: 'PRACTICAL',
  CUSTOM: 'CUSTOM'
}

type CSMParams = {
  camera: PerspectiveCamera
  parent: Object3D
  cascades?: number
  maxFar?: number
  mode?: typeof CSMModes[keyof typeof CSMModes]
  shadowMapSize?: number
  shadowBias?: number
  lightDirection?: Vector3
  lightIntensity?: number
  lightNear?: number
  lightFar?: number
  lightMargin?: number
  light?: DirectionalLight
  customSplitsCallback?: (amount: number, near: number, far: number, target: number[]) => void
}

export class CSM {
  camera: PerspectiveCamera
  parent: Object3D
  cascades: number
  maxFar: number
  mode: typeof CSMModes[keyof typeof CSMModes]
  shadowMapSize: number
  shadowBias: number
  lightDirection: Vector3
  lightIntensity: number
  lightNear: number
  lightFar: number
  lightMargin: number
  customSplitsCallback?: (amount: number, near: number, far: number, target: number[]) => void
  fade: boolean
  mainFrustum: Frustum
  frustums: Frustum[]
  breaks: number[]
  sourceLight: DirectionalLight | null
  lights: DirectionalLight[]
  lightSourcesCount: number
  shaders: Map<Material, ShaderType> = new Map()

  constructor(data: CSMParams) {
    this.camera = data.camera
    this.parent = data.parent
    this.cascades = data.cascades || 3
    this.maxFar = data.maxFar || 100
    this.mode = data.mode || CSMModes.PRACTICAL
    this.shadowMapSize = data.shadowMapSize || 512
    this.shadowBias = -0.000003
    this.lightDirection = data.lightDirection || new Vector3(1, -1, 1).normalize()
    this.lightIntensity = data.lightIntensity || 1
    this.lightNear = data.lightNear || 1
    this.lightFar = data.lightFar || 2000
    this.lightMargin = data.lightMargin || 100
    this.customSplitsCallback = data.customSplitsCallback
    this.fade = true
    this.mainFrustum = new Frustum()
    this.frustums = []
    this.breaks = []

    this.lights = []

    this.createLights()
    this.updateFrustums()
    this.injectInclude()
  }

  changeLights(light: DirectionalLight): void {
    if (light === this.sourceLight) return
    this.remove()
    this.createLights(light)
    this.updateShadowBounds()
  }

  updateProperty(key: string, value: any): void {
    const props = key.split('.')
    const last = props[props.length - 1]
    this.lights.forEach((cascade) => {
      let obj = cascade

      for (let i = 0; i < props.length - 1; i++) {
        obj = obj[props[i]]
      }

      if (obj[last] && typeof obj[last].copy === 'function') {
        obj[last].copy(value)
      } else {
        obj[last] = value
      }
    })
  }

  createLights(light?: DirectionalLight): void {
    if (light) {
      this.sourceLight = light
      for (let i = 0; i < this.cascades; i++) {
        light = light?.clone()
        light.matrixAutoUpdate = true
        light.target = light.target.clone()
        light.castShadow = true
        light.visible = true
        this.parent.add(light, light.target)
        this.lights.push(light)
        light.name = 'CSM_' + light.name
        light.target.name = 'CSM_' + light.target.name
      }
      return
    }

    // if no lights are provided, create default ones

    for (let i = 0; i < this.cascades; i++) {
      const light = new DirectionalLight(0xffffff, this.lightIntensity)

      light.castShadow = true
      light.shadow.mapSize.width = this.shadowMapSize
      light.shadow.mapSize.height = this.shadowMapSize

      light.shadow.camera.near = this.lightNear
      light.shadow.camera.far = this.lightFar
      light.shadow.bias = this.shadowBias

      this.parent.add(light, light.target)
      this.lights.push(light)
      light.name = 'CSM_' + light.name
      light.target.name = 'CSM_' + light.target.name
    }
  }

  initCascades(): void {
    const camera = this.camera
    camera.updateProjectionMatrix()
    this.mainFrustum.setFromProjectionMatrix(camera.projectionMatrix, this.maxFar)
    this.mainFrustum.split(this.breaks, this.frustums)
  }

  updateShadowBounds(): void {
    const frustums = this.frustums
    for (let i = 0; i < frustums.length; i++) {
      const light = this.lights[i]

      const shadowCam = light.shadow.camera
      const frustum = this.frustums[i]

      // Get the two points that represent that furthest points on the frustum assuming
      // that's either the diagonal across the far plane or the diagonal across the whole
      // frustum itself.
      const nearVerts = frustum.vertices.near
      const farVerts = frustum.vertices.far
      const point1 = farVerts[0]
      let point2
      if (point1.distanceTo(farVerts[2]) > point1.distanceTo(nearVerts[2])) {
        point2 = farVerts[2]
      } else {
        point2 = nearVerts[2]
      }

      let squaredBBWidth = point1.distanceTo(point2)
      if (this.fade) {
        // expand the shadow extents by the fade margin if fade is enabled.
        const camera = this.camera
        const far = Math.max(camera.far, this.maxFar)
        const linearDepth = frustum.vertices.far[0].z / (far - camera.near)
        const margin = 0.25 * Math.pow(linearDepth, 2.0) * (far - camera.near)

        squaredBBWidth += margin
      }

      shadowCam.left = -squaredBBWidth / 2
      shadowCam.right = squaredBBWidth / 2
      shadowCam.top = squaredBBWidth / 2
      shadowCam.bottom = -squaredBBWidth / 2
      shadowCam.updateProjectionMatrix()

      light.shadow.bias = this.shadowBias * squaredBBWidth
    }
  }

  getBreaks(): void {
    const camera = this.camera
    const far = Math.min(camera.far, this.maxFar)
    this.breaks.length = 0

    switch (this.mode) {
      case CSMModes.UNIFORM:
        uniformSplit(this.cascades, camera.near, far, this.breaks)
        break
      case CSMModes.LOGARITHMIC:
        logarithmicSplit(this.cascades, camera.near, far, this.breaks)
        break
      case CSMModes.PRACTICAL:
        practicalSplit(this.cascades, camera.near, far, 0.5, this.breaks)
        break
      case CSMModes.CUSTOM:
        if (this.customSplitsCallback === undefined) console.error('CSM: Custom split scheme callback not defined.')
        this.customSplitsCallback!(this.cascades, camera.near, far, this.breaks)
        break
    }

    function uniformSplit(amount: number, near: number, far: number, target: number[]): void {
      for (let i = 1; i < amount; i++) {
        target.push((near + ((far - near) * i) / amount) / far)
      }

      target.push(1)
    }

    function logarithmicSplit(amount: number, near: number, far: number, target: number[]): void {
      for (let i = 1; i < amount; i++) {
        target.push((near * (far / near) ** (i / amount)) / far)
      }

      target.push(1)
    }

    function practicalSplit(amount: number, near: number, far: number, lambda: number, target: number[]): void {
      _uniformArray.length = 0
      _logArray.length = 0
      logarithmicSplit(amount, near, far, _logArray)
      uniformSplit(amount, near, far, _uniformArray)

      for (let i = 1; i < amount; i++) {
        target.push(MathUtils.lerp(_uniformArray[i - 1], _logArray[i - 1], lambda))
      }

      target.push(1)
    }
  }

  update(): void {
    const camera = this.camera
    const frustums = this.frustums
    for (let i = 0; i < frustums.length; i++) {
      const light = this.lights[i]
      const shadowCam = light.shadow.camera

      const texelWidth = (shadowCam.right - shadowCam.left) / light.shadow.mapSize.x
      const texelHeight = (shadowCam.top - shadowCam.bottom) / light.shadow.mapSize.y

      light.updateMatrixWorld(true)
      light.shadow.camera.updateMatrixWorld(true)
      _cameraToLightMatrix.multiplyMatrices(light.shadow.camera.matrixWorldInverse, camera.matrixWorld)
      frustums[i].toSpace(_cameraToLightMatrix, _lightSpaceFrustum)

      const nearVerts = _lightSpaceFrustum.vertices.near
      const farVerts = _lightSpaceFrustum.vertices.far
      _bbox.makeEmpty()
      for (let j = 0; j < 4; j++) {
        _bbox.expandByPoint(nearVerts[j])
        _bbox.expandByPoint(farVerts[j])
      }

      _bbox.getCenter(_center)
      _center.z = _bbox.max.z + this.lightMargin
      _center.x = Math.floor(_center.x / texelWidth) * texelWidth
      _center.y = Math.floor(_center.y / texelHeight) * texelHeight
      _center.applyMatrix4(light.shadow.camera.matrixWorld)

      light.position.copy(_center)
      light.target.position.copy(_center)

      light.target.position.x += this.lightDirection.x
      light.target.position.y += this.lightDirection.y
      light.target.position.z += this.lightDirection.z
    }
  }

  injectInclude(): void {
    ShaderChunk.lights_fragment_begin = Shader.lights_fragment_begin
    ShaderChunk.lights_pars_begin = Shader.lights_pars_begin
  }

  setupMaterial(mesh: Mesh): void {
    const material = mesh.material as Material
    if (material.userData.IGNORE_CSM || material.userData.CSMPlugin) return
    material.defines = material.defines || {}
    material.defines.USE_CSM = 1
    material.defines.CSM_CASCADES = this.cascades

    if (this.fade) material.defines.CSM_FADE = ''

    const breaksVec2 = []
    const shaders = this.shaders

    const self = this

    material.userData.CSMPlugin = {
      id: OBCType.CSM,
      compile: function (shader: ShaderType) {
        if (!self.camera) return
        const far = Math.min(self.camera.far, self.maxFar)
        self.getExtendedBreaks(breaksVec2)

        shader.uniforms.CSM_cascades = { value: breaksVec2 }
        shader.uniforms.cameraNear = { value: self.camera.near }
        shader.uniforms.shadowFar = { value: far }

        shaders.set(material, shader)
      }
    }

    addOBCPlugin(material, material.userData.CSMPlugin)

    shaders.set(material, null!)
  }

  updateUniforms(): void {
    const far = Math.min(this.camera.far, this.maxFar)
    this.shaders.forEach(function (shader: ShaderType, material: Material) {
      if (shader !== null) {
        const uniforms = shader.uniforms
        this.getExtendedBreaks(uniforms.CSM_cascades.value)
        uniforms.cameraNear.value = this.camera.near
        uniforms.shadowFar.value = far
      }

      if (!this.fade && 'CSM_FADE' in material.defines!) {
        delete material.defines.CSM_FADE
        material.needsUpdate = true
      } else if (this.fade && !('CSM_FADE' in material.defines!)) {
        material.defines!.CSM_FADE = ''
        material.needsUpdate = true
      }
    }, this)
  }

  getExtendedBreaks(target: Vector2[]): void {
    while (target.length < this.breaks.length) {
      target.push(new Vector2())
    }

    target.length = this.breaks.length

    for (let i = 0; i < this.cascades; i++) {
      const amount = this.breaks[i]
      const prev = this.breaks[i - 1] || 0
      target[i].x = prev
      target[i].y = amount
    }
  }

  updateFrustums(): void {
    this.getBreaks()
    this.initCascades()
    this.updateShadowBounds()
    this.updateUniforms()
  }

  remove(): void {
    this.lights.forEach((cascade) => {
      cascade.removeFromParent()
      cascade.target.removeFromParent()
      cascade.dispose()
    })
    this.lights = []
  }

  dispose(): void {
    this.shaders.forEach(function (shader: ShaderType, material: Material) {
      removeOBCPlugin(material, material.userData.CSMPlugin)
      delete material.defines!.USE_CSM
      delete material.defines!.CSM_CASCADES
      delete material.defines!.CSM_FADE

      if (shader !== null) {
        delete shader.uniforms.CSM_cascades
        delete shader.uniforms.cameraNear
        delete shader.uniforms.shadowFar
      }

      material.needsUpdate = true
    })
    this.shaders.clear()
  }
}
