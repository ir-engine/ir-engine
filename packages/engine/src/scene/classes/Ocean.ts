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
  sRGBEncoding
} from 'three'

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

    vec2 displacement = texture2D( distortionMap, panner( 2.0 * vUv, time, vec2(0.05, 0.0) ) ).bb;
    displacement = ( displacement * 2.0 ) - 1.0 ;
    diff += displacement.x;

    return mix( vec3(1.0), waterColor, step( 0.1 , diff ) );
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

export class Ocean extends Mesh {
  depthMap: WebGLRenderTarget
  shouldResize: boolean
  shallowWaterColor: Color
  opacityRange: Vector2
  color: Color

  shallowToDeepDistance: number
  opacityFadeDistance: number

  bigWaveScale: number
  bigWaveUVScale: Vector2
  bigWaveSpeed: Vector2
  // Small wave
  waveScale: Vector2
  waveDistortionSpeed: Vector2
  waveDistortionFactor: number
  waveUVFactor: number
  waveSpeed: Vector2

  constructor() {
    const planeGeometry = new PlaneBufferGeometry(10, 10, 100, 100)
    super(planeGeometry, new MeshPhongMaterial())

    this.setupMaterial()
    this.setupRenderTarget()

    this.rotation.x = -Math.PI * 0.5
    this.shouldResize = true
    this.shallowWaterColor = new Color()
    this.opacityRange = new Vector2()
    this.waveScale = new Vector2()
    this.color = new Color()
    this.bigWaveUVScale = new Vector2()
    this.bigWaveSpeed = new Vector2()
    this.waveDistortionSpeed = new Vector2()
    this.waveSpeed = new Vector2()

    window.addEventListener('resize', () => {
      this.shouldResize = true
    })

    //this.frustumCulled = false
  }

  async setupMaterial() {
    // To make the shader compiler insert vUv varying
    const pixel = await addImageProcess(pixelData)
    const tempTexture = new Texture(pixel)

    const material = this.material as MeshPhongMaterial
    material.normalMap = tempTexture
    material.color = this.color
    material.normalScale = this.waveScale
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
      shader.uniforms.shallowWaterColor = { value: this.shallowWaterColor }
      shader.uniforms.opacityRange = { value: this.opacityRange }
      shader.uniforms.bigWaveUVScale = { value: this.bigWaveUVScale }
      shader.uniforms.bigWaveSpeed = { value: this.bigWaveSpeed }
      shader.uniforms.bigWaveScale = { value: 0.7 }
      shader.uniforms.shallowToDeepDistance = { value: 0.1 }
      shader.uniforms.opacityFadeDistance = { value: 0.1 }
      shader.uniforms.waveDistortionFactor = { value: 7.0 }
      shader.uniforms.waveUVFactor = { value: 12.0 }
      shader.uniforms.waveDistortionSpeed = { value: this.waveDistortionSpeed }
      shader.uniforms.waveSpeed = { value: this.waveSpeed }

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

  _getMaterial(): MeshPhongMaterial {
    return this.material as MeshPhongMaterial
  }

  setDistortionMap(texture: Texture) {
    const shader = (this.material as any).userData.shader
    if (!shader) return
    texture.wrapS = RepeatWrapping
    texture.wrapT = RepeatWrapping
    shader.uniforms.distortionMap.value = texture
  }

  // Equirectangular
  setEnvMap(texture: Texture) {
    texture.mapping = EquirectangularReflectionMapping
    texture.encoding = sRGBEncoding
    this._getMaterial().envMap = texture
  }

  setNormalMap(texture: Texture) {
    texture.wrapS = RepeatWrapping
    texture.wrapT = RepeatWrapping
    this._getMaterial().normalMap = texture
  }

  set shininess(value: number) {
    this._getMaterial().shininess = value
  }

  get shininess() {
    return this._getMaterial().shininess
  }

  set reflectivity(value: number) {
    this._getMaterial().reflectivity = value
  }

  get reflectivity() {
    return this._getMaterial().reflectivity
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

    shader.uniforms.waveDistortionFactor.value = this.waveDistortionFactor
    shader.uniforms.waveUVFactor.value = this.waveUVFactor
    shader.uniforms.bigWaveScale.value = this.bigWaveScale
    shader.uniforms.opacityFadeDistance.value = this.opacityFadeDistance
    shader.uniforms.shallowToDeepDistance.value = this.shallowToDeepDistance
    shader.uniforms.depthMap.value = this.depthMap.depthTexture
    shader.uniforms.time.value += dt
  }

  copy(source: this, recursive = true) {
    super.copy(source, recursive)

    const material = (this as any).material as MeshPhongMaterial
    const sourceMaterial = (source as any).material as MeshPhongMaterial

    // material.uniforms.map.value = sourceMaterial.uniforms.map.value
    return this
  }
}
