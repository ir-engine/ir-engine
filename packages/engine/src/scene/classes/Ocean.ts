import {
  RepeatWrapping,
  Mesh,
  PlaneBufferGeometry,
  Vector2,
  Color,
  MeshPhongMaterial,
  AddOperation,
  WebGLRenderTarget,
  DepthTexture,
  RGBFormat,
  NearestFilter,
  DepthFormat,
  UnsignedShortType,
  Texture,
  ShaderChunk,
  EquirectangularReflectionMapping,
  sRGBEncoding,
  TextureLoader
} from 'three'
import { TGALoader } from '../../assets/loaders/tga/TGALoader'
import { Updatable } from '../interfaces/Updatable'

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

function insertBeforeString(source, searchTerm, addition) {
  const position = source.indexOf(searchTerm)
  return [source.slice(0, position), addition, source.slice(position)].join('\n')
}

function insertAfterString(source, searchTerm, addition) {
  const position = source.indexOf(searchTerm)
  return [source.slice(0, position + searchTerm.length), addition, source.slice(position + searchTerm.length)].join(
    '\n'
  )
}

function addImageProcess(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    let img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

function loadTexture(src): Promise<Texture> {
  const loader = src.endsWith('tga') ? new TGALoader() : new TextureLoader()
  return new Promise((resolve, reject) => {
    loader.load(src, resolve, null, (error) => reject(error))
  })
}

export class Ocean extends Mesh implements Updatable {
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

  constructor() {
    const planeGeometry = new PlaneBufferGeometry(10, 10, 100, 100)
    super(planeGeometry, new MeshPhongMaterial({ color: 'red' }))
    this.rotation.x = -Math.PI * 0.5

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

    const material = this.material as MeshPhongMaterial
    material.normalMap = tempTexture
    material.normalScale = this._waveScale
    material.transparent = true
    material.combine = AddOperation
    material.needsUpdate = true

    material.onBeforeCompile = (shader) => {
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
      ;(this.material as any).userData.shader = shader
    }
  }

  setupRenderTarget() {
    const size = new Vector2(window.innerWidth, window.innerHeight)
    this.depthMap = new WebGLRenderTarget(size.x, size.y)

    this.depthMap.texture.format = RGBFormat
    this.depthMap.texture.minFilter = NearestFilter
    this.depthMap.texture.magFilter = NearestFilter
    this.depthMap.texture.generateMipmaps = false
    this.depthMap.stencilBuffer = false
    this.depthMap.depthBuffer = true
    this.depthMap.depthTexture = new DepthTexture(size.x, size.y)
    this.depthMap.depthTexture.format = DepthFormat
    this.depthMap.depthTexture.type = UnsignedShortType
  }

  onBeforeRender = (renderer, scene, camera) => {
    const shader = (this.material as any).userData.shader
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
    const shader = (this.material as any).userData.shader
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
    return this.material as MeshPhongMaterial
  }

  get distortionMap(): string {
    return this._distortionMap
  }

  set distortionMap(path: string) {
    this._distortionMap = path

    loadTexture(path)
      .then((texture) => {
        texture.wrapS = RepeatWrapping
        texture.wrapT = RepeatWrapping
        this._distortionTexture = texture
      })
      .catch(console.error)
  }

  get envMap(): string {
    return this._envMap
  }

  // Equirectangular
  set envMap(path: string) {
    this._envMap = path

    loadTexture(path)
      .then((texture) => {
        texture.mapping = EquirectangularReflectionMapping
        texture.encoding = sRGBEncoding
        this._material.envMap = texture
      })
      .catch(console.error)
  }

  get normalMap(): string {
    return this._normalMap
  }

  set normalMap(path: string) {
    this._normalMap = path

    loadTexture(path)
      .then((texture) => {
        texture.wrapS = RepeatWrapping
        texture.wrapT = RepeatWrapping
        this._material.normalMap = texture
      })
      .catch(console.error)
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
