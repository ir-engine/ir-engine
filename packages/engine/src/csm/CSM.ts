import {
  Vector2,
  Vector3,
  DirectionalLight,
  MathUtils,
  ShaderChunk,
  Matrix4,
  Box3,
  Object3D,
  WebGLRenderTarget,
  PerspectiveCamera,
  Material,
  Shader as ShaderType,
  Mesh
} from 'three'
import Frustum from './Frustum'
import Shader from './Shader'

const _cameraToLightMatrix = new Matrix4()
const _lightSpaceFrustum = new Frustum()
const _center = new Vector3()
const _bbox = new Box3()
const _uniformArray = []
const _logArray = []

export enum CSMModes {
  UNIFORM,
  LOGARITHMIC,
  PRACTICAL,
  CUSTOM
}

type CSMParams = {
  camera: PerspectiveCamera
  parent: Object3D
  cascades?: number
  maxFar?: number
  mode?: CSMModes
  shadowMapSize?: number
  shadowBias?: number
  lightDirection?: Vector3
  lightIntensity?: number
  lightNear?: number
  lightFar?: number
  lightMargin?: number
  lights?: DirectionalLight[]
  customSplitsCallback?: (amount: number, near: number, far: number, target: number[]) => void
}

export class CSM {
  camera: PerspectiveCamera
  parent: Object3D
  cascades: number
  maxFar: number
  mode: CSMModes
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
  lights: DirectionalLight[][]
  lightSourcesCount: number
  shaders: Map<Material, ShaderType> = new Map()
  materials: Map<Mesh, Material> = new Map()

  constructor(data: CSMParams) {
    this.camera = data.camera
    this.parent = data.parent
    this.cascades = data.cascades || 3
    this.maxFar = data.maxFar || 100
    this.mode = data.mode || CSMModes.PRACTICAL
    this.shadowMapSize = data.shadowMapSize || 512
    this.shadowBias = data.shadowBias || 0.05
    this.lightDirection = data.lightDirection || new Vector3(1, -1, 1).normalize()
    this.lightIntensity = data.lightIntensity || 1
    this.lightNear = data.lightNear || 1
    this.lightFar = data.lightFar || 100
    this.lightMargin = data.lightMargin || 50
    this.customSplitsCallback = data.customSplitsCallback
    this.fade = true
    this.mainFrustum = new Frustum()
    this.frustums = []
    this.breaks = []

    this.lights = []

    this.createLights(data.lights)
    this.updateFrustums()
    this.injectInclude()
  }

  createLights(lights?: DirectionalLight[]): void {
    // TODO: support multiple lights (requires shader changes)

    // for (const sourceLightIndex in lights) {
    if (lights?.length) {
      const sourceLightIndex = 0
      const sourceLight = lights[sourceLightIndex]
      this.lights[sourceLightIndex] = []

      for (let i = 0; i < this.cascades; i++) {
        const light = sourceLight.clone()
        light.target = sourceLight.target.clone()
        light.castShadow = true
        this.parent.add(light, light.target)
        this.lights[sourceLightIndex].push(light)
      }
      return
    }

    // if no lights are provided, create default ones

    this.lights[0] = []

    for (let i = 0; i < this.cascades; i++) {
      const light = new DirectionalLight(0xffffff, this.lightIntensity)

      light.castShadow = true
      light.shadow.mapSize.width = this.shadowMapSize
      light.shadow.mapSize.height = this.shadowMapSize

      light.shadow.camera.near = this.lightNear
      light.shadow.camera.far = this.lightFar
      light.shadow.bias = this.shadowBias

      this.parent.add(light, light.target)
      this.lights[0].push(light)
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
      for (const lights of this.lights) {
        const light = lights[i]

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
      }
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
      for (const lights of this.lights) {
        const light = lights[i]
        const shadowCam = light.shadow.camera

        const texelWidth = (shadowCam.right - shadowCam.left) / light.shadow.mapSize.x
        const texelHeight = (shadowCam.top - shadowCam.bottom) / light.shadow.mapSize.y

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
  }

  injectInclude(): void {
    ShaderChunk.lights_fragment_begin = Shader.lights_fragment_begin
    ShaderChunk.lights_pars_begin = Shader.lights_pars_begin
  }

  setupMaterial(mesh: Mesh): void {
    mesh.userData._CSM_OLD_MATERIAL = mesh.material
    const material = (mesh.material as Material).clone()
    mesh.material = material
    material.defines = material.defines || {}
    material.defines.USE_CSM = 1
    material.defines.CSM_CASCADES = this.cascades

    if (this.fade) {
      material.defines.CSM_FADE = ''
    }

    const breaksVec2 = []
    const shaders = this.shaders

    material.onBeforeCompile = (shader: ShaderType) => {
      const far = Math.min(this.camera.far, this.maxFar)
      this.getExtendedBreaks(breaksVec2)

      shader.uniforms.CSM_cascades = { value: breaksVec2 }
      shader.uniforms.cameraNear = { value: this.camera.near }
      shader.uniforms.shadowFar = { value: far }

      shaders.set(material, shader)
    }

    shaders.set(material, null!)
    this.materials.set(mesh, material)
  }

  updateUniforms(): void {
    const far = Math.min(this.camera.far, this.maxFar)
    const shaders = this.shaders

    shaders.forEach(function (shader: ShaderType, material: Material) {
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
    this.lights.forEach((light) => {
      light.forEach((cascade) => {
        cascade.removeFromParent()
        cascade.target.removeFromParent()
        cascade.dispose()
      })
    })
    this.lights = []
  }

  dispose(): void {
    const shaders = this.shaders
    shaders.forEach(function (shader: ShaderType, material: Material) {
      material.onBeforeCompile = null!
      material.defines!.USE_CSM = null!
      material.defines!.CSM_CASCADES = null!
      material.defines!.CSM_FADE = null!

      if (shader !== null) {
        delete shader.uniforms.CSM_cascades
        delete shader.uniforms.cameraNear
        delete shader.uniforms.shadowFar
      }

      material.needsUpdate = true
    })
    shaders.clear()
    this.materials.forEach(function (material: Material, mesh: Mesh) {
      const originalMaterial = mesh.userData._CSM_OLD_MATERIAL
      mesh.material = originalMaterial
      material.dispose()
    })
    this.materials.clear()
  }
}
