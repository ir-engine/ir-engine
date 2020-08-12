import {
  Color,
  LinearFilter,
  Matrix4,
  Mesh,
  PerspectiveCamera,
  Plane,
  RGBFormat,
  ShaderMaterial,
  UniformsUtils,
  Vector3,
  Vector4,
  WebGLRenderTarget
} from "three"

function isPowerOfTwo(x) {
  return (Math.log(x) / Math.log(2)) % 1 === 0
}

export class Mirror extends Mesh {
  options: any
  color
  textureWidth
  textureHeight
  clipBias
  shader
  recursion
  onAfterRender2

  mirrorPlane = new Plane()
  normal = new Vector3()
  mirrorWorldPosition = new Vector3()
  cameraWorldPosition = new Vector3()
  rotationMatrix = new Matrix4()
  lookAtPosition = new Vector3(0, 0, -1)
  clipPlane = new Vector4()
  material = new ShaderMaterial({
    uniforms: UniformsUtils.clone(this.shader.uniforms),
    fragmentShader: this.shader.fragmentShader,
    vertexShader: this.shader.vertexShader,
    transparent: this.options.transparent
  })
  view = new Vector3()
  target = new Vector3()
  q = new Vector4()
  parameters = {
    minFilter: LinearFilter,
    magFilter: LinearFilter,
    format: RGBFormat,
    stencilBuffer: false
  }
  renderTarget = new WebGLRenderTarget(this.textureWidth, this.textureHeight, this.parameters)
  textureMatrix = new Matrix4()
  virtualCamera = new PerspectiveCamera()
  static MirrorShader: any

  constructor({ options }) {
    super()
    this.options = options
    this.color = options.color !== undefined ? new Color(options.color) : new Color(0x7f7f7f)
    this.textureWidth = options.textureWidth || 512
    this.textureHeight = options.textureHeight || 512
    this.clipBias = options.clipBias || 0
    this.shader = options.shader || Mirror.MirrorShader
    this.recursion = options.recursion !== undefined ? options.recursion : 0

    this.mirrorPlane = new Plane()
    this.normal = new Vector3()
    this.mirrorWorldPosition = new Vector3()
    this.cameraWorldPosition = new Vector3()
    this.rotationMatrix = new Matrix4()
    this.lookAtPosition = new Vector3(0, 0, -1)
    this.clipPlane = new Vector4()

    this.view = new Vector3()
    this.target = new Vector3()
    this.q = new Vector4()

    this.textureMatrix = new Matrix4()
    this.virtualCamera = new PerspectiveCamera()

    this.renderTarget.texture.generateMipmaps = isPowerOfTwo(this.textureWidth) && isPowerOfTwo(this.textureHeight)

    this.material.uniforms["tDiffuse"].value = this.renderTarget.texture
    this.material.uniforms["color"].value = this.color
    this.material.uniforms["textureMatrix"].value = this.textureMatrix
  }
  onBeforeRender = function(renderer, scene, camera) {
    this.onBeforeRender2 && this.onBeforeRender2(renderer, scene, camera)

    if ("recursion" in camera.userData) {
      if (camera.userData.recursion === this.recursion) return

      camera.userData.recursion++
    }

    this.mirrorWorldPosition.setFromMatrixPosition(this.matrixWorld)
    this.cameraWorldPosition.setFromMatrixPosition(camera.matrixWorld)

    this.rotationMatrix.extractRotation(this.matrixWorld)

    this.normal.set(0, 0, 1)
    this.normal.applyMatrix4(this.rotationMatrix)

    this.view.subVectors(this.mirrorWorldPosition, this.cameraWorldPosition)

    // Avoid rendering when mirror is facing away

    if (this.view.dot(this.normal) > 0) return

    this.view.reflect(this.normal).negate()
    this.view.add(this.mirrorWorldPosition)

    this.rotationMatrix.extractRotation(camera.matrixWorld)

    this.lookAtPosition.set(0, 0, -1)
    this.lookAtPosition.applyMatrix4(this.rotationMatrix)
    this.lookAtPosition.add(this.cameraWorldPosition)

    this.target.subVectors(this.mirrorWorldPosition, this.lookAtPosition)
    this.target.reflect(this.normal).negate()
    this.target.add(this.mirrorWorldPosition)

    this.virtualCamera.position.copy(this.view)
    this.virtualCamera.up.set(0, 1, 0)
    this.virtualCamera.up.applyMatrix4(this.rotationMatrix)
    this.virtualCamera.up.reflect(this.normal)
    this.virtualCamera.lookAt(this.target)

    this.virtualCamera.far = camera.far // Used in WebGLBackground

    this.virtualCamera.updateMatrixWorld()
    this.virtualCamera.projectionMatrix.copy(camera.projectionMatrix)

    this.virtualCamera.userData.recursion = 0

    // Update the texture matrix
    this.textureMatrix.set(0.5, 0.0, 0.0, 0.5, 0.0, 0.5, 0.0, 0.5, 0.0, 0.0, 0.5, 0.5, 0.0, 0.0, 0.0, 1.0)
    this.textureMatrix.multiply(this.virtualCamera.projectionMatrix)
    this.textureMatrix.multiply(this.virtualCamera.matrixWorldInverse)
    this.textureMatrix.multiply(this.matrixWorld)

    // Now update projection matrix with new clip plane, implementing code from: http://www.terathon.com/code/oblique.html
    // Paper explaining this technique: http://www.terathon.com/lengyel/Lengyel-Oblique.pdf
    this.mirrorPlane.setFromNormalAndCoplanarPoint(this.normal, this.mirrorWorldPosition)
    this.mirrorPlane.applyMatrix4(this.virtualCamera.matrixWorldInverse)

    this.clipPlane.set(
      this.mirrorPlane.normal.x,
      this.mirrorPlane.normal.y,
      this.mirrorPlane.normal.z,
      this.mirrorPlane.constant
    )

    const projectionMatrix = this.virtualCamera.projectionMatrix

    this.q.x = (Math.sign(this.clipPlane.x) + projectionMatrix.elements[8]) / projectionMatrix.elements[0]
    this.q.y = (Math.sign(this.clipPlane.y) + projectionMatrix.elements[9]) / projectionMatrix.elements[5]
    this.q.z = -1.0
    this.q.w = (1.0 + projectionMatrix.elements[10]) / projectionMatrix.elements[14]

    // Calculate the scaled plane vector
    this.clipPlane.multiplyScalar(2.0 / this.clipPlane.dot(this.q))

    // Replacing the third row of the projection matrix
    projectionMatrix.elements[2] = this.clipPlane.x
    projectionMatrix.elements[6] = this.clipPlane.y
    projectionMatrix.elements[10] = this.clipPlane.z + 1.0 - this.clipBias
    projectionMatrix.elements[14] = this.clipPlane.w

    // Render

    this.visible = false

    const currentRenderTarget = renderer.getRenderTarget()

    const currentVrEnabled = renderer.vr.enabled
    const currentShadowAutoUpdate = renderer.shadowMap.autoUpdate

    renderer.vr.enabled = false // Avoid camera modification and recursion
    renderer.shadowMap.autoUpdate = false // Avoid re-computing shadows

    renderer.setRenderTarget(this.renderTarget)
    renderer.clear()
    renderer.render(scene, this.virtualCamera)

    renderer.vr.enabled = currentVrEnabled
    renderer.shadowMap.autoUpdate = currentShadowAutoUpdate

    renderer.setRenderTarget(currentRenderTarget)

    // Restore viewport

    const viewport = camera.viewport

    if (viewport !== undefined) {
      renderer.state.viewport(viewport)
    }

    this.visible = true
  }
  onAfterRender = (renderer, scene, camera) => {
    if (this.onAfterRender2 !== undefined) this.onAfterRender2(renderer, scene, camera)
  }

  getRenderTarget = function() {
    return this.renderTarget
  }
}

Mirror.prototype = Object.create(Mesh.prototype)
Mirror.prototype.constructor = Mirror

Mirror.MirrorShader = {
  uniforms: {
    color: {
      value: null
    },

    tDiffuse: {
      value: null
    },

    textureMatrix: {
      value: null
    }
  },

  vertexShader: [
    "uniform mat4 textureMatrix;",
    "varying vec4 vUv;",

    "void main() {",

    "	vUv = textureMatrix * vec4( position, 1.0 );",

    "	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

    "}"
  ].join("\n"),

  fragmentShader: [
    "uniform vec3 color;",
    "uniform sampler2D tDiffuse;",
    "varying vec4 vUv;",

    "float blendOverlay( float base, float blend ) {",

    "	return( base < 0.5 ? ( 2.0 * base * blend ) : ( 1.0 - 2.0 * ( 1.0 - base ) * ( 1.0 - blend ) ) );",

    "}",

    "vec3 blendOverlay( vec3 base, vec3 blend ) {",

    "	return vec3( blendOverlay( base.r, blend.r ), blendOverlay( base.g, blend.g ), blendOverlay( base.b, blend.b ) );",

    "}",

    "void main() {",

    "	vec4 base = texture2DProj( tDiffuse, vUv );",
    "	gl_FragColor = vec4( blendOverlay( base.rgb, color ), 1.0 );",

    "}"
  ].join("\n")
}
