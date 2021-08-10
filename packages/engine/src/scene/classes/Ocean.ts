import {
  Mesh,
  PlaneBufferGeometry,
  Vector3,
  Vector2,
  Color,
  MeshPhongMaterial,
  AddOperation,
  ShaderChunk,
  WebGLRenderTarget,
  DepthTexture,
  RGBFormat,
  NearestFilter,
  DepthFormat,
  UnsignedShortType
} from 'three'
import { Engine } from '../../ecs/classes/Engine'
import { EngineRenderer } from '../../renderer/WebGLRendererSystem'

// Vertex Uniforms
const vertexUniforms = `uniform float time;
uniform sampler2D distortionMap;`

// Vertex Functions
const vertexFunctions = `vec2 panner(const in vec2 uv, const in float time, const in vec2 speed)
{
    return uv + speed * time;
}
float getWaveHeight(const in vec2 uv)
{
    return texture( distortionMap, uv ).y * 0.7;
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

// Fragment Uniforms
const fragUniforms = `uniform sampler2D depthMap;
uniform sampler2D distortionMap;
uniform vec2 viewportSize;
uniform vec2 cameraNearFar;
uniform vec3 shallowWaterColor;
uniform vec2 opacityRange;
uniform float time;`

// Fragment Functions
const fragmentFunctions = `
vec2 panner(const in vec2 uv, const in float time, const in vec2 speed)
{
    return uv + speed * time;
}
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

export class Ocean extends Mesh {
  depthMap: WebGLRenderTarget
  shouldResize: boolean

  constructor() {
    const planeGeometry = new PlaneBufferGeometry(1, 1, 100, 100)

    const material = new MeshPhongMaterial({
      normalMap: null,
      envMap: null,
      color: new Color(0.158628, 0.465673, 0.869792), // Deep water color
      shininess: 40,
      reflectivity: 0.25,
      normalScale: new Vector2(0.25, 0.25),
      transparent: true,
      combine: AddOperation
    })

    super(planeGeometry, material)

    //this.setupMaterial()

    this.rotation.x = -Math.PI * 0.5

    window.addEventListener('resize', () => {
      this.shouldResize = true
    })
    //this.frustumCulled = false
  }

  setupMaterial() {
    ;(this.material as MeshPhongMaterial).onBeforeCompile = (shader) => {
      const viewportSize = new Vector2()
      Engine.renderer.getSize(viewportSize)

      shader.uniforms.time = { value: 0 }
      shader.uniforms.distortionMap = { value: null }
      shader.uniforms.depthMap = { value: null }
      shader.uniforms.viewportSize = { value: viewportSize }
      shader.uniforms.cameraNearFar = { value: new Vector2(Engine.camera.near, Engine.camera.far) }
      shader.uniforms.shallowWaterColor = { value: new Vector3(0.190569, 0.765519, 0.869792) }
      shader.uniforms.opacityRange = { value: new Vector2(0.6, 0.9) }

      shader.vertexShader = insertBeforeString(shader.vertexShader, 'varying vec3 vViewPosition;', vertexUniforms)
      shader.vertexShader = insertBeforeString(shader.vertexShader, 'void main()', vertexFunctions)

      shader.vertexShader = insertBeforeString(
        shader.vertexShader,
        '#include <defaultnormal_vertex>',
        `
      vec2 waveUv = panner( 1.5 * uv, time, vec2(.02, .0) );
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
        `float colorFade = depthFade(1.2);
      diffuseColor.rgb = mix(shallowWaterColor, diffuse, colorFade);
      diffuseColor.rgb = foam(diffuseColor.rgb);
      float opacityFade = depthFade(1.0);
      diffuseColor.a = clamp(opacityFade, opacityRange.x, opacityRange.y);
      `
      )

      // Small wave normal map
      let normal_fragment_maps = ShaderChunk.normal_fragment_maps
      normal_fragment_maps = normal_fragment_maps.replace(
        'vec3 mapN = texture2D( normalMap, vUv ).xyz * 2.0 - 1.0;',
        `float waveDist = texture( distortionMap, panner( 7.0 * vUv, time, vec2(0.08) ) ).y * 0.05;
      vec3 mapN = texture( normalMap, panner( 12.0 * vUv, time, vec2(0.08, 0.0) ) + waveDist ).xyz * 2.0 - 1.0;
      `
      )

      shader.fragmentShader = shader.fragmentShader.replace('#include <normal_fragment_maps>', normal_fragment_maps)
      ;(this.material as any).userData.shader = shader
    }
  }

  setupRenderTarget() {
    const size = new Vector2()
    Engine.renderer.getSize(size)
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

    EngineRenderer.instance.addRenderTarget(this.depthMap)
  }

  setDistortionMap(texture) {
    const shader = (this.material as any).userData.shader
    if (!shader) return
    shader.uniforms.distortionMap.value = texture
  }

  setEnvMap(texture) {
    ;(this.material as MeshPhongMaterial).envMap = texture
  }

  setNormalMap(texture) {
    ;(this.material as MeshPhongMaterial).normalMap = texture
  }

  // Depth texture update
  onBeforeRender = (renderer, scene, camera) => {
    if (this.shouldResize) {
      const shader = (this.material as any).userData.shader
      shader && Engine.renderer.getSize(shader.uniforms.viewportSize.value)
      this.shouldResize = false
    }

    if (!Engine.renderer) {
      console.log('Renderer not available')
      return
    }

    if (!this.depthMap) {
      this.setupRenderTarget()
    }

    this.visible = false
    const currentRenderTarget = renderer.getRenderTarget()

    // render scene into target
    renderer.setRenderTarget(this.depthMap)
    renderer.render(scene, camera)

    renderer.setRenderTarget(currentRenderTarget)

    this.visible = true
  }

  update(dt: number) {
    const shader = (this.material as any).userData.shader
    if (!shader) return

    shader.uniforms.depthMap.value = this.depthMap
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
