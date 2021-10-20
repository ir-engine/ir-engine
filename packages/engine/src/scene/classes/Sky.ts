import {
  BackSide,
  BoxBufferGeometry,
  CubeCamera,
  CubeTexture,
  DepthModes,
  MathUtils,
  Mesh,
  NeverDepth,
  Object3D,
  RGBAFormat,
  Scene,
  ShaderMaterial,
  UniformsLib,
  UniformsUtils,
  UnsignedByteType,
  Vector3,
  WebGLCubeRenderTarget,
  WebGLRenderer
} from 'three'
import { PMREMGenerator } from 'three'

/**
 * @author zz85 / https://github.com/zz85
 *
 * Based on "A Practical Analytic Model for Daylight"
 * aka The Preetham Model, the de facto standard analytic skydome model
 * http://www.cs.utah.edu/~shirley/papers/sunsky/sunsky.pdf
 *
 * First implemented by Simon Wallner
 * http://www.simonwallner.at/projects/atmospheric-scattering
 *
 * Improved by Martin Upitis
 * http://blenderartists.org/forum/showthread.php?245954-preethams-sky-impementation-HDR
 *
 * Three.js integration by zz85 http://twitter.com/blurspline
 */
const vertexShader = `
#include <common>
#include <fog_pars_vertex>
uniform vec3 sunPosition;
uniform float rayleigh;
uniform float turbidity;
uniform float mieCoefficient;
uniform float scale;
varying vec3 vWorldPosition;
varying vec3 vSunDirection;
varying float vSunfade;
varying vec3 vBetaR;
varying vec3 vBetaM;
varying float vSunE;
const vec3 up = vec3( 0.0, 1.0, 0.0 );
// constants for atmospheric scattering
const float e = 2.71828182845904523536028747135266249775724709369995957;
const float pi = 3.141592653589793238462643383279502884197169;
// wavelength of used primaries, according to preetham
const vec3 lambda = vec3( 680E-9, 550E-9, 450E-9 );
// this pre-calcuation replaces older TotalRayleigh(vec3 lambda) function:
// (8.0 * pow(pi, 3.0) * pow(pow(n, 2.0) - 1.0, 2.0) * (6.0 + 3.0 * pn)) / (3.0 * N * pow(lambda, vec3(4.0)) * (6.0 - 7.0 * pn))
const vec3 totalRayleigh = vec3( 5.804542996261093E-6, 1.3562911419845635E-5, 3.0265902468824876E-5 );
// mie stuff
// K coefficient for the primaries
const float v = 4.0;
const vec3 K = vec3( 0.686, 0.678, 0.666 );
// MieConst = pi * pow( ( 2.0 * pi ) / lambda, vec3( v - 2.0 ) ) * K
const vec3 MieConst = vec3( 1.8399918514433978E14, 2.7798023919660528E14, 4.0790479543861094E14 );
// earth shadow hack
// cutoffAngle = pi / 1.95;
const float cutoffAngle = 1.6110731556870734;
const float steepness = 1.5;
const float EE = 1000.0;
float sunIntensity( float zenithAngleCos ) {
  zenithAngleCos = clamp( zenithAngleCos, -1.0, 1.0 );
  return EE * max( 0.0, 1.0 - pow( e, -( ( cutoffAngle - acos( zenithAngleCos ) ) / steepness ) ) );
}
vec3 totalMie( float T ) {
  float c = ( 0.2 * T ) * 10E-18;
  return 0.434 * c * MieConst;
}
void main() {
  #include <begin_vertex>
  vec4 worldPosition = modelMatrix * vec4( position, 1.0 );
  vWorldPosition = worldPosition.xyz;
  #include <project_vertex>
  vSunDirection = normalize( sunPosition );
  vSunE = sunIntensity( dot( vSunDirection, up ) );
  vSunfade = 1.0 - clamp( 1.0 - exp( ( sunPosition.y / scale ) ), 0.0, 1.0 );
  float rayleighCoefficient = rayleigh - ( 1.0 * ( 1.0 - vSunfade ) );
  // extinction (absorbtion + out scattering)
  // rayleigh coefficients
  vBetaR = totalRayleigh * rayleighCoefficient;
  // mie coefficients
  vBetaM = totalMie( turbidity ) * mieCoefficient;
  #include <fog_vertex>
}
`
const fragmentShader = `
#include <common>
#include <fog_pars_fragment>
varying vec3 vWorldPosition;
varying vec3 vSunDirection;
varying float vSunfade;
varying vec3 vBetaR;
varying vec3 vBetaM;
varying float vSunE;
uniform float luminance;
uniform float mieDirectionalG;
const vec3 cameraPos = vec3( 0.0, 0.0, 0.0 );
// constants for atmospheric scattering
const float pi = 3.141592653589793238462643383279502884197169;
const float n = 1.0003; // refractive index of air
const float N = 2.545E25; // number of molecules per unit volume for air at
// 288.15K and 1013mb (sea level -45 celsius)
// optical length at zenith for molecules
const float rayleighZenithLength = 8.4E3;
const float mieZenithLength = 1.25E3;
const vec3 up = vec3( 0.0, 1.0, 0.0 );
// 66 arc seconds -> degrees, and the cosine of that
const float sunAngularDiameterCos = 0.999956676946448443553574619906976478926848692873900859324;
// 3.0 / ( 16.0 * pi )
const float THREE_OVER_SIXTEENPI = 0.05968310365946075;
// 1.0 / ( 4.0 * pi )
const float ONE_OVER_FOURPI = 0.07957747154594767;
float rayleighPhase( float cosTheta ) {
  return THREE_OVER_SIXTEENPI * ( 1.0 + pow( cosTheta, 2.0 ) );
}
float hgPhase( float cosTheta, float g ) {
  float g2 = pow( g, 2.0 );
  float inverse = 1.0 / pow( 1.0 - 2.0 * g * cosTheta + g2, 1.5 );
  return ONE_OVER_FOURPI * ( ( 1.0 - g2 ) * inverse );
}
// Filmic ToneMapping http://filmicgames.com/archives/75
const float A = 0.15;
const float B = 0.50;
const float C = 0.10;
const float D = 0.20;
const float E = 0.02;
const float F = 0.30;
const float whiteScale = 1.0748724675633854; // 1.0 / Uncharted2Tonemap(1000.0)
vec3 Uncharted2Tonemap( vec3 x ) {
  return ( ( x * ( A * x + C * B ) + D * E ) / ( x * ( A * x + B ) + D * F ) ) - E / F;
}
void main() {
  // optical length
  // cutoff angle at 90 to avoid singularity in next formula.
  vec3 direction = normalize( vWorldPosition - cameraPos );
  float zenithAngle = acos( max( 0.0, dot( up, direction ) ) );
  float inverse = 1.0 / ( cos( zenithAngle ) + 0.15 * pow( 93.885 - ( ( zenithAngle * 180.0 ) / pi ), -1.253 ) );
  float sR = rayleighZenithLength * inverse;
  float sM = mieZenithLength * inverse;
  // combined extinction factor
  vec3 Fex = exp( -( vBetaR * sR + vBetaM * sM ) );
  // in scattering
  float cosTheta = dot( direction, vSunDirection );
  float rPhase = rayleighPhase( cosTheta * 0.5 + 0.5 );
  vec3 betaRTheta = vBetaR * rPhase;
  float mPhase = hgPhase( cosTheta, mieDirectionalG );
  vec3 betaMTheta = vBetaM * mPhase;
  vec3 Lin = pow( vSunE * ( ( betaRTheta + betaMTheta ) / ( vBetaR + vBetaM ) ) * ( 1.0 - Fex ), vec3( 1.5 ) );
  Lin *= mix( vec3( 1.0 ), pow( vSunE * ( ( betaRTheta + betaMTheta ) / ( vBetaR + vBetaM ) ) * Fex, vec3( 1.0 / 2.0 ) ), clamp( pow( 1.0 - dot( up, vSunDirection ), 5.0 ), 0.0, 1.0 ) );
  // nightsky
  float theta = acos( direction.y ); // elevation --> y-axis, [-pi/2, pi/2]
  float phi = atan( direction.z, direction.x ); // azimuth --> x-axis [-pi/2, pi/2]
  vec2 uv = vec2( phi, theta ) / vec2( 2.0 * pi, pi ) + vec2( 0.5, 0.0 );
  vec3 L0 = vec3( 0.1 ) * Fex;
  // composition + solar disc
  float sundisk = smoothstep( sunAngularDiameterCos, sunAngularDiameterCos + 0.00002, cosTheta );
  L0 += ( vSunE * 19000.0 * Fex ) * sundisk;
  vec3 texColor = ( Lin + L0 ) * 0.04 + vec3( 0.0, 0.0003, 0.00075 );
  vec3 curr = Uncharted2Tonemap( ( log2( 2.0 / pow( luminance, 4.0 ) ) ) * texColor );
  vec3 color = curr * whiteScale;
  vec3 retColor = pow( color, vec3( 1.0 / ( 1.2 + ( 1.2 * vSunfade ) ) ) );
  gl_FragColor = vec4( retColor, 1.0 );
  #include <fog_fragment>
}
`
export class Sky extends Object3D {
  static shader = {
    uniforms: UniformsUtils.merge([
      UniformsLib.fog,
      {
        luminance: { value: 1 },
        turbidity: { value: 10 },
        rayleigh: { value: 2 },
        mieCoefficient: { value: 0.005 },
        mieDirectionalG: { value: 0.8 },
        sunPosition: { value: new Vector3() },
        scale: { value: 1000 }
      }
    ]),
    vertexShader,
    fragmentShader
  }

  static geometry = new BoxBufferGeometry(1, 1, 1)
  static material: ShaderMaterial

  skyScene: Scene
  cubeCamera: CubeCamera
  sky: Mesh
  _inclination: number
  _azimuth: number
  _distance: number

  constructor() {
    super()

    Sky.material = new ShaderMaterial({
      fragmentShader: Sky.shader.fragmentShader,
      vertexShader: Sky.shader.vertexShader,
      uniforms: UniformsUtils.clone(Sky.shader.uniforms),
      side: BackSide,
      fog: true,
      depthWrite: false
    })

    this.skyScene = new Scene()
    this.cubeCamera = new CubeCamera(
      1,
      100000,
      new WebGLCubeRenderTarget(512, { format: RGBAFormat, type: UnsignedByteType })
    )
    this.skyScene.add(this.cubeCamera)
    this.sky = new Mesh(Sky.geometry, Sky.material)
    this.sky.name = 'Sky'
    this.add(this.sky)
    this._inclination = 0
    this._azimuth = 0.15
    this.distance = 1000
  }

  get _material(): ShaderMaterial {
    return this.sky.material as ShaderMaterial
  }

  get turbidity() {
    return this._material.uniforms.turbidity.value
  }
  set turbidity(value) {
    this._material.uniforms.turbidity.value = value
  }
  get rayleigh() {
    return this._material.uniforms.rayleigh.value
  }
  set rayleigh(value) {
    this._material.uniforms.rayleigh.value = value
  }
  get luminance() {
    return this._material.uniforms.luminance.value
  }
  set luminance(value) {
    this._material.uniforms.luminance.value = value
  }
  get mieCoefficient() {
    return this._material.uniforms.mieCoefficient.value
  }
  set mieCoefficient(value) {
    this._material.uniforms.mieCoefficient.value = value
  }
  get mieDirectionalG() {
    return this._material.uniforms.mieDirectionalG.value
  }
  set mieDirectionalG(value) {
    this._material.uniforms.mieDirectionalG.value = value
  }
  get inclination() {
    return this._inclination
  }
  set inclination(value) {
    this._inclination = value
    this.updateSunPosition()
  }
  get azimuth() {
    return this._azimuth
  }
  set azimuth(value) {
    this._azimuth = value
    this.updateSunPosition()
  }
  get distance() {
    return this._distance
  }
  set distance(value) {
    this._distance = value
    this._material.uniforms.scale.value = value
    this.updateSunPosition()
  }
  updateSunPosition() {
    const distance = this._distance
    const theta = Math.PI * (this._inclination - 0.5)
    const phi = 2 * Math.PI * (this._azimuth - 0.5)
    const x = Math.cos(phi)
    const y = Math.sin(phi) * Math.sin(theta)
    const z = Math.sin(phi) * Math.cos(theta)
    this._material.uniforms.sunPosition.value.set(x, y, z)
    this.sky.scale.setScalar(distance)
  }

  generateSkybox(renderer: WebGLRenderer) {
    this.skyScene.add(this.sky)
    this.cubeCamera.update(renderer, this.skyScene)
    this.add(this.sky)

    const pmremGenerator = new PMREMGenerator(renderer)
    const pmremRT = pmremGenerator.fromCubemap(this.cubeCamera.renderTarget.texture)
    pmremGenerator.dispose()

    return pmremRT.texture
  }

  copy(source, recursive = true) {
    if (recursive) {
      ;(this as any).remove(this.sky)
    }
    super.copy(source, recursive)
    if (recursive) {
      const skyIndex = source.children.indexOf(source.sky)
      if (skyIndex !== -1) {
        ;(this.sky as any) = (this as any).children[skyIndex]
      }
    }
    this.turbidity = source.turbidity
    this.rayleigh = source.rayleigh
    this.luminance = source.luminance
    this.mieCoefficient = source.mieCoefficient
    this.mieDirectionalG = source.mieDirectionalG
    this.inclination = source.inclination
    this.azimuth = source.azimuth
    this.distance = source.distance
    return this
  }
}
