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
  AddOperation,
  Color,
  DepthTexture,
  EquirectangularReflectionMapping,
  Mesh,
  MeshPhongMaterial,
  NearestFilter,
  PerspectiveCamera,
  PlaneGeometry,
  RepeatWrapping,
  Scene,
  ShaderChunk,
  SRGBColorSpace,
  Texture,
  UnsignedShortType,
  Vector2,
  WebGLRenderer,
  WebGLRenderTarget
} from 'three'

import { AssetLoader } from '../../assets/classes/AssetLoader'
import { OBCType } from '../../common/constants/OBCTypes'
import { addOBCPlugin } from '../../common/functions/OnBeforeCompilePlugin'
import { insertAfterString, insertBeforeString } from '../../common/functions/string'
import { Entity } from '../../ecs/classes/Entity'
import { OceanComponent } from '../components/OceanComponent'
import { addError, removeError } from '../functions/ErrorFunctions'

const vertexUniforms = `uniform float time;
uniform sampler2D distortionMap;
uniform float bigWaveScale;
uniform vec2 bigWaveUVScale;
uniform vec2 bigWaveSpeed;
`

const pannerFunction = `vec2 panner(const in vec2 uv, const in float time, const in vec2 speed)
{
    return uv + speed * time;
}`

const vertexFunctions =
  pannerFunction +
  `
float getWaveHeight(const in vec2 uv)
{
    return texture( distortionMap, uv ).y * bigWaveScale;
}
vec3 calculateNormal(const in vec2 p)
{
    const float eps = .05;
    const vec2 h = vec2(eps,0.0);
    float height = getWaveHeight(p);
    return normalize(vec3( 
        getWaveHeight(p+h.xy) - height, 
        getWaveHeight(p+h.yx) - height,
        2.0
    ));
}`

const fragUniforms = `uniform sampler2D depthMap;
uniform sampler2D distortionMap;
uniform vec2 viewportSize;
uniform vec2 cameraNearFar;
uniform vec3 shallowWaterColor;
uniform vec2 opacityRange;
uniform float time;
uniform float shallowToDeepDistance;
uniform float opacityFadeDistance;
uniform float waveUVFactor;
uniform float waveDistortionFactor;
uniform vec2 waveDistortionSpeed;
uniform vec2 waveSpeed;
uniform vec3 foamColor;
uniform vec2 foamSpeed; 
uniform float foamScale;
`

const fragmentFunctions =
  pannerFunction +
  `
float getViewZ(const in float depth)
{
    return perspectiveDepthToViewZ(depth, cameraNearFar.x, cameraNearFar.y);
}
float depthDiff()
{
    vec2 depthUv = gl_FragCoord.xy / viewportSize;
    float sceneDepth = getViewZ( texture2D(depthMap, depthUv).x );
    float pixelDepth = getViewZ( gl_FragCoord.z );
    return pixelDepth - sceneDepth;
}
float depthFade(const in float fadeDistance)
{
    float diff = depthDiff();
    return saturate(diff / max(fadeDistance, EPSILON));
}
vec3 foam( const in vec3 waterColor )
{
    float diff = saturate( depthDiff() );

    vec2 displacement = texture2D( distortionMap, panner( foamScale * vUv, time, foamSpeed ) ).bb;
    displacement = ( displacement * 2.0 ) - 1.0 ;
    diff += displacement.x;

    return mix( foamColor, waterColor, step( 0.1 , diff ) );
}
`

const pixelData =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+ip1sAAAAASUVORK5CYII='

function addImageProcess(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    let img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

export class Ocean extends Mesh<PlaneGeometry, MeshPhongMaterial> {
  depthMap: WebGLRenderTarget
  shouldResize: boolean
  _shallowWaterColor: Color
  _opacityRange: Vector2

  shallowToDeepDistance: number
  opacityFadeDistance: number

  bigWaveHeight: number
  _bigWaveTiling: Vector2
  _bigWaveSpeed: Vector2

  // Small wave
  _waveScale: Vector2
  _waveDistortionSpeed: Vector2
  waveDistortionTiling: number
  waveTiling: number
  _waveSpeed: Vector2

  //Foam
  _foamColor: Color
  _foamSpeed: Vector2
  foamTiling: number

  // Maps
  _envMap: string
  _normalMap: string
  _distortionMap: string
  _distortionTexture: Texture
  entity: Entity

  constructor(entity: Entity) {
    const planeGeometry = new PlaneGeometry(10, 10, 100, 100)
    super(planeGeometry, new MeshPhongMaterial({ color: 'red' }))
    this.rotation.x = -Math.PI * 0.5

    this.entity = entity
    this.shouldResize = true
    this._shallowWaterColor = new Color()
    this._opacityRange = new Vector2()
    this._waveScale = new Vector2()
    this._bigWaveTiling = new Vector2()
    this._bigWaveSpeed = new Vector2()
    this._waveDistortionSpeed = new Vector2()
    this._waveSpeed = new Vector2()
    this._foamColor = new Color()
    this._foamSpeed = new Vector2()

    this.setupMaterial()
    this.setupRenderTarget()

    window.addEventListener('resize', () => {
      this.shouldResize = true
    })
  }

  async setupMaterial() {
    // To make the three shader compiler insert vUv varying
    const pixel = await addImageProcess(pixelData)
    const tempTexture = new Texture(pixel)

    const material = this.material
    material.normalMap = tempTexture
    material.normalScale = this._waveScale
    material.transparent = true
    material.combine = AddOperation
    material.needsUpdate = true

    addOBCPlugin(material, {
      id: OBCType.OCEAN,
      compile: (shader) => {
        const viewportSize = new Vector2(window.innerWidth, window.innerHeight)

        shader.uniforms.time = { value: 0 }
        shader.uniforms.distortionMap = { value: null }
        shader.uniforms.depthMap = { value: null }
        shader.uniforms.viewportSize = { value: viewportSize }
        shader.uniforms.cameraNearFar = { value: new Vector2(0.1, 100) }
        shader.uniforms.shallowWaterColor = { value: this._shallowWaterColor }
        shader.uniforms.opacityRange = { value: this._opacityRange }
        shader.uniforms.bigWaveUVScale = { value: this._bigWaveTiling }
        shader.uniforms.bigWaveSpeed = { value: this._bigWaveSpeed }
        shader.uniforms.bigWaveScale = { value: 0.7 }
        shader.uniforms.shallowToDeepDistance = { value: 0.1 }
        shader.uniforms.opacityFadeDistance = { value: 0.1 }
        shader.uniforms.waveDistortionFactor = { value: 7.0 }
        shader.uniforms.waveUVFactor = { value: 12.0 }
        shader.uniforms.waveDistortionSpeed = { value: this._waveDistortionSpeed }
        shader.uniforms.waveSpeed = { value: this._waveSpeed }
        shader.uniforms.foamColor = { value: this._foamColor }
        shader.uniforms.foamSpeed = { value: this._foamSpeed }
        shader.uniforms.foamScale = { value: 2.0 }

        shader.vertexShader = insertBeforeString(shader.vertexShader, 'varying vec3 vViewPosition;', vertexUniforms)
        shader.vertexShader = insertBeforeString(shader.vertexShader, 'void main()', vertexFunctions)

        shader.vertexShader = insertBeforeString(
          shader.vertexShader,
          '#include <defaultnormal_vertex>',
          `
        vec2 waveUv = panner( bigWaveUVScale * uv, time, bigWaveSpeed );
        float waveHeight = getWaveHeight( waveUv );
        objectNormal = calculateNormal(waveUv);
        `
        )

        // Transform vertex
        shader.vertexShader = shader.vertexShader.replace(
          '#include <project_vertex>',
          `
        vec4 mvPosition = vec4( transformed, 1.0 );
        mvPosition = modelMatrix * mvPosition;
        mvPosition.y += waveHeight;
        mvPosition = viewMatrix * mvPosition;
        gl_Position = projectionMatrix * mvPosition;
        `
        )

        shader.fragmentShader = insertBeforeString(shader.fragmentShader, 'uniform vec3 diffuse;', fragUniforms)
        shader.fragmentShader = insertBeforeString(shader.fragmentShader, 'void main()', fragmentFunctions)

        shader.fragmentShader = insertAfterString(
          shader.fragmentShader,
          'vec4 diffuseColor = vec4( diffuse, opacity );',
          `float colorFade = depthFade(shallowToDeepDistance);
        diffuseColor.rgb = mix(shallowWaterColor, diffuse, colorFade);
        diffuseColor.rgb = foam(diffuseColor.rgb);
        float opacityFade = depthFade(opacityFadeDistance);
        diffuseColor.a = clamp(opacityFade, opacityRange.x, opacityRange.y);
        `
        )

        // Small wave normal map
        let normal_fragment_maps = ShaderChunk.normal_fragment_maps
        normal_fragment_maps = normal_fragment_maps.replace(
          'vec3 mapN = texture2D( normalMap, vUv ).xyz * 2.0 - 1.0;',
          `float waveDist = texture( distortionMap, panner( waveDistortionFactor * vUv, time, waveDistortionSpeed ) ).y * 0.05;
        vec3 mapN = texture( normalMap, panner( waveUVFactor * vUv, time, waveSpeed ) + waveDist ).xyz * 2.0 - 1.0;
        `
        )

        shader.fragmentShader = shader.fragmentShader.replace('#include <normal_fragment_maps>', normal_fragment_maps)
        this.material.userData.shader = shader
      }
    })
  }

  setupRenderTarget() {
    const size = new Vector2(window.innerWidth, window.innerHeight)
    this.depthMap = new WebGLRenderTarget(size.x, size.y)

    this.depthMap.texture.minFilter = NearestFilter
    this.depthMap.texture.magFilter = NearestFilter
    this.depthMap.texture.generateMipmaps = false
    this.depthMap.stencilBuffer = false
    this.depthMap.depthBuffer = true
    this.depthMap.depthTexture = new DepthTexture(size.x, size.y)
    this.depthMap.depthTexture.type = UnsignedShortType
  }

  onBeforeRender = (renderer: WebGLRenderer, scene: Scene, camera: PerspectiveCamera) => {
    const shader = this.material.userData.shader
    shader?.uniforms.cameraNearFar.value.set(camera.near, camera.far)

    if (this.shouldResize) {
      shader?.uniforms.viewportSize.value.set(window.innerWidth, window.innerHeight)
      const dpr = renderer.getPixelRatio()
      this.depthMap.setSize(window.innerWidth * dpr, window.innerHeight * dpr)
      this.shouldResize = false
    }

    // render scene into target
    // Depth texture update
    this.visible = false
    const currentRenderTarget = renderer.getRenderTarget()

    renderer.setRenderTarget(this.depthMap)
    renderer.state.buffers.depth.setMask(true)
    if (renderer.autoClear === false) renderer.clear()
    renderer.render(scene, camera)
    renderer.setRenderTarget(currentRenderTarget)

    this.visible = true
  }

  update(dt: number) {
    const shader = this.material.userData.shader
    if (!shader) return

    shader.uniforms.distortionMap.value = this._distortionTexture
    shader.uniforms.foamScale.value = this.foamTiling
    shader.uniforms.waveDistortionFactor.value = this.waveDistortionTiling
    shader.uniforms.waveUVFactor.value = this.waveTiling
    shader.uniforms.bigWaveScale.value = this.bigWaveHeight
    shader.uniforms.opacityFadeDistance.value = this.opacityFadeDistance
    shader.uniforms.shallowToDeepDistance.value = this.shallowToDeepDistance
    shader.uniforms.depthMap.value = this.depthMap.depthTexture
    shader.uniforms.time.value += dt
  }

  copy(source: this, recursive = true) {
    super.copy(source, recursive)
    return this
  }

  get _material(): MeshPhongMaterial {
    return this.material
  }

  get distortionMap(): string {
    return this._distortionMap
  }

  set distortionMap(path: string) {
    this._distortionMap = path

    AssetLoader.loadAsync(path)
      .then((texture) => {
        texture.wrapS = RepeatWrapping
        texture.wrapT = RepeatWrapping
        this._distortionTexture = texture
        removeError(this.entity, OceanComponent, 'DISTORTION_MAP_ERROR')
      })
      .catch((error) => {
        addError(this.entity, OceanComponent, 'DISTORTION_MAP_ERROR', error.message)
      })
  }

  get envMap(): string {
    return this._envMap
  }

  // Equirectangular
  set envMap(path: string) {
    this._envMap = path

    AssetLoader.loadAsync(path)
      .then((texture: Texture) => {
        texture.mapping = EquirectangularReflectionMapping
        texture.colorSpace = SRGBColorSpace
        this._material.envMap = texture
        removeError(this.entity, OceanComponent, 'ENVIRONMENT_MAP_ERROR')
      })
      .catch((error) => {
        addError(this.entity, OceanComponent, 'ENVIRONMENT_MAP_ERROR', error.message)
      })
  }

  get normalMap(): string {
    return this._normalMap
  }

  set normalMap(path: string) {
    this._normalMap = path

    AssetLoader.loadAsync(path)
      .then((texture) => {
        texture.wrapS = RepeatWrapping
        texture.wrapT = RepeatWrapping
        this._material.normalMap = texture
        removeError(this.entity, OceanComponent, 'NORMAL_MAP_ERROR')
      })
      .catch((error) => {
        addError(this.entity, OceanComponent, 'NORMAL_MAP_ERROR', error.message)
      })
  }

  set shininess(value: number) {
    this._material.shininess = value
  }

  get shininess() {
    return this._material.shininess
  }

  set reflectivity(value: number) {
    this._material.reflectivity = value
  }

  get reflectivity() {
    return this._material.reflectivity
  }

  get color(): Color {
    return this._material.color
  }

  set color(value) {
    if (typeof value === 'string') this._material.color.set(value)
    else this._material.color.copy(value)
  }

  get shallowWaterColor(): Color {
    return this._shallowWaterColor
  }

  set shallowWaterColor(value: Color) {
    if (typeof value === 'string') this._shallowWaterColor.set(value)
    else this._shallowWaterColor.copy(value)
  }

  get opacityRange(): Vector2 {
    return this._opacityRange
  }

  set opacityRange(value: Vector2) {
    this._opacityRange.copy(value).clampScalar(0.0, 1.0)
  }

  get foamColor(): Color {
    return this._foamColor
  }

  set foamColor(value: Color) {
    this._foamColor.copy(value)
  }

  get foamSpeed(): Vector2 {
    return this._foamSpeed
  }

  set foamSpeed(value: Vector2) {
    this._foamSpeed.copy(value)
  }

  get bigWaveTiling(): Vector2 {
    return this._bigWaveTiling
  }

  set bigWaveTiling(value: Vector2) {
    this._bigWaveTiling.copy(value)
  }

  get bigWaveSpeed(): Vector2 {
    return this._bigWaveSpeed
  }

  set bigWaveSpeed(value: Vector2) {
    this._bigWaveSpeed.copy(value)
  }

  get waveScale(): Vector2 {
    return this._waveScale
  }

  set waveScale(value: Vector2) {
    this._waveScale.copy(value)
  }

  get waveDistortionSpeed(): Vector2 {
    return this._waveDistortionSpeed
  }

  set waveDistortionSpeed(value: Vector2) {
    this._waveDistortionSpeed.copy(value)
  }

  get waveSpeed(): Vector2 {
    return this._waveSpeed
  }

  set waveSpeed(value: Vector2) {
    this._waveSpeed.copy(value)
  }
}
