import {
  BufferGeometry,
  DataTexture,
  Float32BufferAttribute,
  InstancedBufferAttribute,
  InstancedBufferGeometry,
  Matrix4,
  Mesh,
  NormalBlending,
  Points,
  RGBFormat,
  ShaderLib,
  ShaderMaterial,
  Texture,
  TextureLoader,
  UniformsUtils
} from 'three'

import { ParticleGeometry, ParticleMesh, ParticleMeshMaterial, particleMeshOptions } from '../interfaces'

// import { RGBFormat } from "three"
// import { DataTexture } from "three"
// import { TextureLoader } from "three"
// import { InstancedBufferGeometry } from "three"
const WHITE_TEXTURE = new DataTexture(new Uint8Array(3).fill(255), 1, 1, RGBFormat)
WHITE_TEXTURE.needsUpdate = true

const textureLoader = new TextureLoader()

// from threejs
const shaderIDs = {
  MeshDepthMaterial: 'depth',
  MeshDistanceMaterial: 'distanceRGBA',
  MeshNormalMaterial: 'normal',
  MeshBasicMaterial: 'basic',
  MeshLambertMaterial: 'lambert',
  MeshPhongMaterial: 'phong',
  MeshToonMaterial: 'toon',
  MeshStandardMaterial: 'physical',
  MeshPhysicalMaterial: 'physical',
  MeshMatcapMaterial: 'matcap',
  LineBasicMaterial: 'basic',
  LineDashedMaterial: 'dashed',
  PointsMaterial: 'points',
  ShadowMaterial: 'shadow',
  SpriteMaterial: 'sprite'
}

/**
 * Create particle mesh from options.
 * @param options Options to be applied on particle mesh.
 *
 * @returns Newly created particle mesh.
 */
export function createParticleMesh(options: particleMeshOptions): ParticleMesh {
  const config: particleMeshOptions = {
    particleCount: 1000,
    texture: '',
    textureFrame: { cols: 1, rows: 1 },
    style: 'particle',
    mesh: null,
    particleSize: 10,
    transparent: false,
    alphaTest: 0,
    depthWrite: true,
    depthTest: true,
    blending: NormalBlending,
    fog: false,
    usePerspective: true,
    useLinearMotion: true,
    useOrbitalMotion: true,
    useAngularMotion: true,
    useRadialMotion: true,
    useWorldMotion: true,
    useBrownianMotion: false,
    useVelocityScale: false,
    useFramesOrOrientation: true
  }

  Object.defineProperties(config, Object.getOwnPropertyDescriptors(options)) // preserves getters

  const isMesh = config.style === 'mesh'
  const geometry = isMesh ? new InstancedBufferGeometry().copy(config.mesh.geometry) : new BufferGeometry()

  updateGeometry(geometry, config)

  let shaderID = 'points'
  if (isMesh) {
    shaderID = shaderIDs[config.mesh.material.type] || 'physical'
  }
  const shader = ShaderLib[shaderID]

  const uniforms = UniformsUtils.merge([
    shader.uniforms,
    {
      time: { value: 0 },
      textureAtlas: { value: new Float32Array(2) }
    }
  ])

  // custom uniforms can only be used on ShaderMaterial and RawShaderMaterial
  const material = new ShaderMaterial({
    uniforms,
    vertexShader: shader.vertexShader,
    fragmentShader: shader.fragmentShader,
    defines: {},
    extensions: {
      derivatives: shaderID === 'physical' // I don't know who should set this!!
    },
    lights: isMesh // lights are automatically setup for various materials, but must be manually setup for ShaderMaterial
  })

  injectParticleShaderCode(material)

  updateMaterial(material as ParticleMeshMaterial, config)

  let particleMesh
  if (isMesh) {
    particleMesh = new Mesh(geometry, material)
    material['originalMaterial'] = config.mesh.material
  } else {
    particleMesh = new Points(geometry, material)
  }

  particleMesh.frustumCulled = false
  particleMesh.userData = {
    nextIndex: 0,
    meshConfig: config
  }

  return particleMesh
}

/**
 * Update geometry with provided configs.
 * @param geometry Geometry to be updated.
 * @param config Config which will be applied on geometry.
 */
export function updateGeometry(geometry: ParticleGeometry, config: particleMeshOptions): void {
  const particleCount = config.particleCount ?? 0
  const NUM_KEYFRAMES = 3

  const offsets = new Float32Array(particleCount * 3)
  const row1s = new Float32Array(particleCount * 4)
  const row2s = new Float32Array(particleCount * 4)
  const row3s = new Float32Array(particleCount * 4)
  const scales = new Float32Array(particleCount * NUM_KEYFRAMES) // scales over time (0 scale implies hidden)
  const orientations = new Float32Array(particleCount * (NUM_KEYFRAMES + 1)) // orientation over time + screen up
  const colors = new Float32Array(particleCount * (NUM_KEYFRAMES + 1)) // colors over time (rgb is packed into a single float) + frameInfo part 1
  const opacities = new Float32Array(particleCount * (NUM_KEYFRAMES + 1)).fill(1) // opacities over time + frameInfo part 2
  const timings = new Float32Array(particleCount * 4)

  const isInstancedBufferGeometry = geometry instanceof InstancedBufferGeometry
  const bufferFn = isInstancedBufferGeometry ? InstancedBufferAttribute : Float32BufferAttribute

  if (!isInstancedBufferGeometry) {
    // this.renderBufferDirect() in threejs assumes an attribute called *position* exists and uses the attribute's *count* to
    // determine the number of particles to draw!
    geometry.setAttribute('position', new Float32BufferAttribute(new Float32Array(particleCount * 3), 3))
  }

  geometry.setAttribute('row1', new bufferFn(row1s, row1s.length / particleCount))
  geometry.setAttribute('row2', new bufferFn(row2s, row2s.length / particleCount))
  geometry.setAttribute('row3', new bufferFn(row3s, row3s.length / particleCount))
  geometry.setAttribute('offset', new bufferFn(offsets, offsets.length / particleCount))
  geometry.setAttribute('scales', new bufferFn(scales, scales.length / particleCount))
  geometry.setAttribute('orientations', new bufferFn(orientations, orientations.length / particleCount))
  geometry.setAttribute('colors', new bufferFn(colors, colors.length / particleCount))
  geometry.setAttribute('opacities', new bufferFn(opacities, opacities.length / particleCount))
  geometry.setAttribute('timings', new bufferFn(timings, timings.length / particleCount))

  if (config.useLinearMotion || config.useRadialMotion) {
    const velocities = new Float32Array(particleCount * 4) // linearVelocity (xyz) + radialVelocity (w)
    const accelerations = new Float32Array(particleCount * 4) // linearAcceleration (xyz) + radialAcceleration (w)
    geometry.setAttribute('velocity', new bufferFn(velocities, velocities.length / particleCount))
    geometry.setAttribute('acceleration', new bufferFn(accelerations, accelerations.length / particleCount))
  }

  if (config.useAngularMotion || config.useOrbitalMotion) {
    const angularVelocities = new Float32Array(particleCount * 4) // angularVelocity (xyz) + orbitalVelocity (w)
    const angularAccelerations = new Float32Array(particleCount * 4) // angularAcceleration (xyz) + orbitalAcceleration (w)
    geometry.setAttribute('angularvelocity', new bufferFn(angularVelocities, angularVelocities.length / particleCount))
    geometry.setAttribute(
      'angularacceleration',
      new bufferFn(angularAccelerations, angularAccelerations.length / particleCount)
    )
  }

  if (config.useWorldMotion || config.useBrownianMotion) {
    const worldAccelerations = new Float32Array(particleCount * 4) // worldAcceleration (xyz) + brownian (w)
    geometry.setAttribute(
      'worldacceleration',
      new bufferFn(worldAccelerations, worldAccelerations.length / particleCount)
    )
  }

  if (config.useVelocityScale) {
    const velocityScales = new Float32Array(particleCount * 3) // velocityScale (x), velocityScaleMin (y), velocityScaleMax (z)
    geometry.setAttribute('velocityscale', new bufferFn(velocityScales, velocityScales.length / particleCount))
  }

  if (geometry instanceof InstancedBufferGeometry) {
    geometry.instanceCount = particleCount
  }

  const identity = new Matrix4()
  for (let i = 0; i < particleCount; i++) {
    setMatrixAt(geometry, i, identity)
  }
}

/**
 * Update material with provided configs.
 * @param material Material to be updated.
 * @param config Config which will be applied on material.
 */
export function updateMaterial(material: any, config: particleMeshOptions): void {
  updateOriginalMaterialUniforms(material)

  material.uniforms.textureAtlas.value[0] = 0 // 0,0 unpacked uvs
  material.uniforms.textureAtlas.value[1] = 0.50012207031 // 1.,1. unpacked uvs

  material.transparent = config.transparent
  material.blending = config.blending
  material.fog = config.fog
  material.depthWrite = config.depthWrite
  material.depthTest = config.depthTest

  const style = config.style?.toLowerCase()
  const defines = material.defines

  if (config.useAngularMotion) defines.USE_ANGULAR_MOTION = true
  if (config.useRadialMotion) defines.USE_RADIAL_MOTION = true
  if (config.useOrbitalMotion) defines.USE_ORBITAL_MOTION = true
  if (config.useLinearMotion) defines.USE_LINEAR_MOTION = true
  if (config.useWorldMotion) defines.USE_WORLD_MOTION = true
  if (config.useBrownianMotion) defines.USE_BROWNIAN_MOTION = true
  if (config.fog) defines.USE_FOG = true
  if (config.alphaTest) defines.ALPHATEST = config.alphaTest
  if (style === 'ribbon') defines.USE_RIBBON = true
  if (style === 'mesh') defines.USE_MESH = true
  defines.ATLAS_SIZE = 1

  if (style !== 'mesh') {
    if (config.useVelocityScale) defines.USE_VELOCITY_SCALE = true
    if (config.useFramesOrOrientation) defines.USE_FRAMES_OR_ORIENTATION = true
    if (config.usePerspective) defines.USE_SIZEATTENUATION = true
    material.uniforms.size.value = config.particleSize

    material.uniforms.map.value = WHITE_TEXTURE
    material.map = WHITE_TEXTURE // WARNING textures don't appear unless this is set to something

    if (config.texture) {
      if (config.texture instanceof Texture) {
        material.uniforms.map.value = config.texture
      } else {
        textureLoader.load(
          config.texture,
          (texture) => {
            material.uniforms.map.value = texture
          },
          undefined,
          (err) => console.error(err)
        )
      }
    }
  }

  Object.assign(material.defines, defines)

  material.needsUpdate = true
}

/**
 * Update Material uniforms
 * @param material Material to be updated.
 */
export function updateOriginalMaterialUniforms(material: ParticleMeshMaterial): void {
  if (material.originalMaterial) {
    for (const k in material.uniforms) {
      if (k in material) {
        material.uniforms[k].value = material.originalMaterial[k]
      }
    }
  }
}

/**
 * Update material time
 * @param material Material to be updated.
 * @param time Updated time.
 */
export function setMaterialTime(material: ParticleMeshMaterial, time: number): void {
  material.uniforms.time.value = time
}

/**
 * Load texture packer JSON file for provided mesh.
 * @param mesh Mesh for which texture packer JSON will be loaded.
 * @param config Configs.
 * @param startIndex Start index of the mesh geometry.
 * @param endIndex End index of the mesh geometry.
 */
export function loadTexturePackerJSON(mesh, config, startIndex, endIndex): void {
  const jsonFilename = mesh.userData.meshConfig.texture.replace(/\.[^.]+$/, '.json')

  if (!jsonFilename) {
    // console.warn('meshConfig.texture is empty', mesh.userData.meshConfig.texture)
    return
  }

  fetch(jsonFilename)
    .then((response) => {
      return response.json()
    })
    .then((atlasJSON) => {
      setTextureAtlas(mesh.material, atlasJSON)

      if (typeof config.atlas === 'string') {
        const atlasIndex = Array.isArray(atlasJSON.frames)
          ? atlasJSON.frames.findIndex((frame) => frame.filename === config.atlas)
          : Object.keys(atlasJSON.frames).findIndex((filename) => filename === config.atlas)

        if (atlasIndex < 0) {
          console.error(`unable to find atlas entry '${config.atlas}'`)
        }

        for (let i = startIndex; i < endIndex; i++) {
          setAtlasIndexAt(mesh.geometry, i, atlasIndex)
        }

        needsUpdate(mesh.geometry, ['colors', 'opacities'])
      }
    })
}

function packUVs(u, v) {
  // bring u,v into the range (0,0.5) then pack into 12 bits each
  // uvs have a maximum resolution of 1/2048
  // return value must be in the range (0,1]
  return ~~(u * 2048) / 4096 + ~~(v * 2048) / 16777216 // 2x12 bits = 24 bits
}

/**
 * Set texture atlas on material.
 * @param material Material of which texture atlas will be saved.
 * @param atlasJSON Atlas JSON to get texture atlas.
 */
export function setTextureAtlas(material, atlasJSON): void {
  if (!atlasJSON) {
    return
  }

  const parts = Array.isArray(atlasJSON.frames) ? atlasJSON.frames : Object.values(atlasJSON.frames)
  const imageSize = atlasJSON.meta.size
  const PARTS_PER_TEXTURE = 2
  const packedTextureAtlas = new Float32Array(PARTS_PER_TEXTURE * parts.length)

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i]
    const j = i * PARTS_PER_TEXTURE
    const frame = part.frame
    packedTextureAtlas[j] = packUVs(frame.x / imageSize.w, frame.y / imageSize.h)
    packedTextureAtlas[j + 1] = packUVs(frame.w / imageSize.w, frame.h / imageSize.h)
  }

  material.uniforms.textureAtlas.value = packedTextureAtlas
  material.defines.ATLAS_SIZE = parts.length
  material.needsUpdate = true
}

/**
 * Set matrix on geometry.
 * @param geometry Geometry for which matrix will be set.
 * @param i Index of geometry on which matrix will be set.
 * @param mat4 Matrix to be set on geometry.
 */
export function setMatrixAt(geometry, i, mat4): void {
  const m = mat4.elements
  const row1 = geometry.getAttribute('row1')
  const row2 = geometry.getAttribute('row2')
  const row3 = geometry.getAttribute('row3')
  row1.setXYZW(i, m[0], m[4], m[8], m[12])
  row2.setXYZW(i, m[1], m[5], m[9], m[13])
  row3.setXYZW(i, m[2], m[6], m[10], m[14])
}

/**
 * Set offset of geometry at provided index.
 * @param geometry Geometry for which offset will be set.
 * @param i Index of geometry on which offset will be set.
 * @param x
 * @param y
 * @param z
 */
export function setOffsetAt(geometry: any, i: number, x: number, y?: number, z?: number): void {
  const offset = geometry.getAttribute('offset')
  if (Array.isArray(x)) {
    z = x[2]
    y = x[1]
    x = x[0]
  } else if (typeof x === 'object') {
    z = (x as any).z
    y = (x as any).y
    x = (x as any).x
  }

  offset.setXYZ(i, x, y, z)
}

function packRGB(r, g, b) {
  return ~~(r * 255) / 256 + ~~(g * 255) / 65536 + ~~(b * 255) / 16777216 // 3x8 bits = 24 bits
}

/**
 * Set color of geometry at provided index.
 * @param geometry Geometry for which color will be set.
 * @param i Index of geometry on which color will be set.
 * @param colorArray Color array to be set on geometry.
 */
export function setColorsAt(geometry: any, i: any, colorArray: any): void {
  const colors = geometry.getAttribute('colors')
  const color0 = colorArray[0]
  const color1 = colorArray[1]
  const color2 = colorArray[2]
  let packedR, packedG, packedB

  // white
  if (colorArray.length === 0) packedR = packedG = packedB = packRGB(1, 1, 1)
  else if (colorArray.length === 1) {
    packedR = packRGB(color0.r, color0.r, color0.r)
    packedG = packRGB(color0.g, color0.g, color0.g)
    packedB = packRGB(color0.b, color0.b, color0.b)
  } else if (colorArray.length === 2) {
    packedR = packRGB(color0.r, 0.5 * (color0.r + color1.r), color1.r)
    packedG = packRGB(color0.g, 0.5 * (color0.g + color1.g), color1.g)
    packedB = packRGB(color0.b, 0.5 * (color0.b + color1.b), color1.b)
  } else {
    packedR = packRGB(color0.r, color1.r, color2.r)
    packedG = packRGB(color0.g, color1.g, color2.g)
    packedB = packRGB(color0.b, color1.b, color2.b)
  }

  colors.setXYZ(i, packedR, packedG, packedB)
}

/**
 * Set opacity of geometry at provided index.
 * @param geometry Geometry for which opacity will be set.
 * @param i Index of geometry on which opacity will be set.
 * @param opacityArray Opacity array to be set on geometry.
 */
export function setOpacitiesAt(geometry, i, opacityArray): void {
  const opacities = geometry.getAttribute('opacities')
  setKeyframesAt(opacities, i, opacityArray, 1)
}

/**
 * Set timings of geometry at provided index.
 * @param geometry Geometry for which timings will be set.
 * @param i Index of geometry on which timings will be set.
 */
export function setTimingsAt(geometry, i, spawnTime, lifeTime, repeatTime, seed = Math.random()): void {
  const timings = geometry.getAttribute('timings')
  timings.setXYZW(i, spawnTime, lifeTime, repeatTime, seed)
}

/**
 * Set frame of geometry at provided index.
 * @param geometry Geometry for which frame will be set.
 * @param i Index of geometry on which frame will be set.
 * @param atlasIndex Atlas index of frame.
 * @param frameStyle Style of the frame.
 * @param startFrame Start frame.
 * @param endFrame End frame.
 * @param cols Columns of the frame.
 * @param rows Rows of the frames.
 */
export function setFrameAt(geometry, i, atlasIndex, frameStyle, startFrame, endFrame, cols, rows): void {
  const colors = geometry.getAttribute('colors')
  const opacities = geometry.getAttribute('opacities')
  const packA = ~~cols + ~~rows / 64 + ~~startFrame / 262144
  const packB = frameStyle + Math.max(0, atlasIndex) / 64 + ~~endFrame / 262144
  colors.setW(i, packA)
  opacities.setW(i, packB)
}

/**
 * Set atlas index of geometry at provided index.
 * @param geometry Geometry for which atlas index will be set.
 * @param i Index of geometry on which atlas index will be set.
 * @param atlasIndex Atlas index to be set.
 */
export function setAtlasIndexAt(geometry, i, atlasIndex): void {
  const opacities = geometry.getAttribute('opacities')
  const packB = opacities.getW(i)
  opacities.setW(i, Math.floor(packB) + Math.max(0, atlasIndex) / 64 + ((packB * 262144) % 4096) / 262144)
}

/**
 * Set scale of geometry at provided index.
 * @param geometry Geometry for which scale will be set.
 * @param i Index of geometry on which scale will be set.
 * @param scaleArray Scale to be set.
 */
export function setScalesAt(geometry, i, scaleArray) {
  const scales = geometry.getAttribute('scales')
  setKeyframesAt(scales, i, scaleArray, 1)
}

/**
 * Set orientation of geometry at provided index.
 * @param geometry Geometry for which orientation will be set.
 * @param i Index of geometry on which orientation will be set.
 * @param orientationArray Orientation to be set.
 * @param worldUp Should Maintain world Up?
 */
export function setOrientationsAt(geometry, i, orientationArray, worldUp = 0): void {
  const orientations = geometry.getAttribute('orientations')
  setKeyframesAt(orientations, i, orientationArray, 0)
  orientations.setW(i, worldUp)
}

/**
 * Set velocity of geometry at provided index.
 * @param geometry Geometry for which velocity will be set.
 * @param i Index of geometry on which velocity will be set.
 */
export function setVelocityAt(geometry, i, x, y, z, radial = 0): void {
  const velocity = geometry.getAttribute('velocity')
  if (velocity) {
    velocity.setXYZW(i, x, y, z, radial)
  }
}

/**
 * Set acceleration of geometry at provided index.
 * @param geometry Geometry for which acceleration will be set.
 * @param i Index of geometry on which acceleration will be set.
 */
export function setAccelerationAt(geometry, i, x, y, z, radial = 0): void {
  const acceleration = geometry.getAttribute('acceleration')
  if (acceleration) {
    acceleration.setXYZW(i, x, y, z, radial)
  }
}

/**
 * Set angular velocity of geometry at provided index.
 * @param geometry Geometry for which angular velocity will be set.
 * @param i Index of geometry on which angular velocity will be set.
 */
export function setAngularVelocityAt(geometry, i, x, y, z, orbital = 0): void {
  const angularvelocity = geometry.getAttribute('angularvelocity')
  if (angularvelocity) {
    angularvelocity.setXYZW(i, x, y, z, orbital)
  }
}

/**
 * Set angular acceleration of geometry at provided index.
 * @param geometry Geometry for which angular acceleration will be set.
 * @param i Index of geometry on which angular acceleration will be set.
 */
export function setAngularAccelerationAt(geometry, i, x, y, z, orbital = 0): void {
  const angularacceleration = geometry.getAttribute('angularacceleration')
  if (angularacceleration) {
    angularacceleration.setXYZW(i, x, y, z, orbital)
  }
}

/**
 * Set world acceleration of geometry at provided index.
 * @param geometry Geometry for which world acceleration will be set.
 * @param i Index of geometry on which world acceleration will be set.
 */
export function setWorldAccelerationAt(geometry, i, x, y, z): void {
  const worldacceleration = geometry.getAttribute('worldacceleration')
  if (worldacceleration) {
    worldacceleration.setXYZ(i, x, y, z)
  }
}

function packBrownain(speed, scale) {
  return ~~(speed * 64) / 4096 + ~~(scale * 64) / 16777216
}

/**
 * Set brownian speed and scale of geometry at provided index.
 * @param geometry Geometry for which brownian speed and scale will be set.
 * @param i Index of geometry on which brownian speed and scale will be set.
 * @param brownianSpeed Brownian speed to be set.
 * @param brownianScale Brownian scale to be set.
 */
export function setBrownianAt(geometry, i, brownianSpeed, brownianScale): void {
  console.assert(brownianSpeed >= 0 && brownianSpeed < 64)
  console.assert(brownianScale >= 0 && brownianScale < 64)
  const worldacceleration = geometry.getAttribute('worldacceleration')
  if (worldacceleration) {
    worldacceleration.setW(i, packBrownain(brownianSpeed, brownianScale))
  }
}

/**
 * Set velocity scale of geometry at provided index.
 * @param geometry Geometry for which velocity scale will be set.
 * @param i Index of geometry on which velocity scale will be set.
 * @param velocityScale Velocity scale to be applied.
 * @param velocityMin Minimum velocity to be applied.
 * @param velocityMax Maximum velocity to be applied.
 */
export function setVelocityScaleAt(geometry, i, velocityScale, velocityMin, velocityMax): void {
  const vs = geometry.getAttribute('velocityscale')
  if (vs) {
    vs.setXYZ(i, velocityScale, velocityMin, velocityMax)
  }
}

/**
 * Set Key frame of geometry at provided index.
 * @param geometry Geometry for which Key frame will be set.
 * @param i Index of geometry on which Key frame will be set.
 * @param valueArray Key frame to be applied.
 * @param defaultValue Default value of the frame.
 */
export function setKeyframesAt(attribute, i, valueArray, defaultValue): void {
  const x = valueArray[0],
    y = valueArray[1],
    z = valueArray[2]
  if (valueArray.length === 0) attribute.setXYZ(i, defaultValue, defaultValue, defaultValue)
  else if (valueArray.length === 1) attribute.setXYZ(i, x, x, x)
  if (valueArray.length === 1) attribute.setXYZ(i, x, 0.5 * (x + y), y)
  else attribute.setXYZ(i, x, y, z)
}

/**
 * Set needsUpdate property of the geometry attributes.
 * @param geometry Geometry.
 * @param attrs List of attributes to be updated.
 */
export function needsUpdate(geometry, attrs?): void {
  attrs = attrs || [
    'row1',
    'row2',
    'row3',
    'offset',
    'scales',
    'colors',
    'opacities',
    'orientations',
    'timings',
    'velocity',
    'acceleration',
    'worldacceleration',
    'velocityscale'
  ]
  if (attrs)
    for (const attr of attrs) {
      const attribute = geometry.getAttribute(attr)
      if (attribute) {
        attribute.needsUpdate = true
      }
    }
}

// eulerToQuaternion() from https://github.com/mrdoob/js/blob/master/src/math/Quaternion.js
// axisAngleToQuaternion() from http://www.euclideanspace.com/maths/geometry/orientations/conversions/angleToQuaternion/index.htm
// fbm3() from https://github.com/yiwenl/glsl-fbm
// instead of rand3() should we generate a random point on a sphere?
function injectParticleShaderCode(material) {
  material.vertexShader = material.vertexShader.replace(
    'void main()',
    `
attribute vec4 row1;
attribute vec4 row2;
attribute vec4 row3;
attribute vec3 offset;
attribute vec3 scales;
attribute vec4 orientations;
attribute vec4 colors;
attribute vec4 opacities;
attribute vec4 timings;

#if defined(USE_LINEAR_MOTION) || defined(USE_RADIAL_MOTION)
attribute vec4 velocity;
attribute vec4 acceleration;
#endif

#if defined(USE_ANGULAR_MOTION) || defined(USE_ORBITAL_MOTION)
attribute vec4 angularvelocity;
attribute vec4 angularacceleration;
#endif

#if defined(USE_WORLD_MOTION) || defined(USE_BROWNIAN_MOTION)
attribute vec4 worldacceleration;
#endif

#if defined(USE_VELOCITY_SCALE)
attribute vec4 velocityscale;
#endif

uniform float time;
uniform vec2 textureAtlas[ATLAS_SIZE];

varying mat3 vUvTransform;
varying vec4 vParticleColor;

vec3 rand3( vec2 co )
{
  float v0 = rand(co);
  float v1 = rand(vec2(co.y, v0));
  float v2 = rand(vec2(co.x, v1));
  return vec3(v0, v1, v2);
}

#if defined(USE_BROWNIAN_MOTION)
#define NUM_OCTAVES 5

float mod289(float x){return x - floor(x * (1.0 / 289.0)) * 289.0;}
vec4 mod289(vec4 x){return x - floor(x * (1.0 / 289.0)) * 289.0;}
vec4 perm(vec4 x){return mod289(((x * 34.0) + 1.0) * x);}

float noise3(vec3 p)
{
  vec3 a = floor(p);
  vec3 d = p - a;
  d = d * d * (3.0 - 2.0 * d);

  vec4 b = a.xxyy + vec4(0.0, 1.0, 0.0, 1.0);
  vec4 k1 = perm(b.xyxy);
  vec4 k2 = perm(k1.xyxy + b.zzww);

  vec4 c = k2 + a.zzzz;
  vec4 k3 = perm(c);
  vec4 k4 = perm(c + 1.0);

  vec4 o1 = fract(k3 * (1.0 / 41.0));
  vec4 o2 = fract(k4 * (1.0 / 41.0));

  vec4 o3 = o2 * d.z + o1 * (1.0 - d.z);
  vec2 o4 = o3.yw * d.x + o3.xz * (1.0 - d.x);

  return o4.y * d.y + o4.x * (1.0 - d.y);
}

float fbm3(vec3 x)
{
  float v = 0.0;
  float a = 0.5;
  vec3 shift = vec3(100);
  for (int i = 0; i < NUM_OCTAVES; ++i) {
    v += a * noise3(x);
    x = x * 2.0 + shift;
    a *= 0.5;
  }
  return v;
}
#endif // USE_BROWNIAN_MOTION

vec3 unpackFrame( float pack )
{
  float y = fract( pack ) * 64.;
  return floor( vec3( pack, y, fract( y ) * 4096. ) );
}

vec2 unpackUVs( float pack )
{
  float x = pack * 4096.;
  return floor( vec2( x, fract( x ) * 4096. ) ) / 2048.;
}

vec3 unpackRGB( float pack )
{
  vec3 enc = fract( pack * vec3( 1., 256., 65536. ) );
  enc -= enc.yzz * vec3( 1./256., 1./256., 0. );
  return enc;
}

vec2 unpackBrownian( float pack ) {
  float a = pack*4096.;
  return floor( vec2( a, fract( a )*4096. ) ) / 64.;
}

float interpolate( const vec3 keys, const float r )
{
  float k = r*2.;
  return k < 1. ? mix( keys.x, keys.y, k ) : mix( keys.y, keys.z, k - 1. );
}

// assumes euler order is YXZ
vec4 eulerToQuaternion( const vec3 euler )
{
  vec3 c = cos( euler * .5 );
  vec3 s = sin( euler * .5 );

  return vec4(
    s.x * c.y * c.z + c.x * s.y * s.z,
    c.x * s.y * c.z - s.x * c.y * s.z,
    c.x * c.y * s.z - s.x * s.y * c.z,
    c.x * c.y * c.z + s.x * s.y * s.z
  );
}

vec4 axisAngleToQuaternion( const vec3 axis, const float angle ) 
{
  return vec4( axis * sin( angle*.5 ), cos( angle*.5 ) );
}

vec3 applyQuaternion( const vec3 v, const vec4 q )
{
  return v + 2. * cross( q.xyz, cross( q.xyz, v ) + q.w * v );
}

vec4 calcGlobalMotion( const mat4 particleMatrix, float distance, vec3 direction, const float age, const float spawnTime, const vec2 brownian, const vec3 orbitalAxis )
{
#if defined(USE_RADIAL_MOTION)
  distance += ( .5 * acceleration.w * age + velocity.w ) * age;
#endif

#if defined(USE_ANGULAR_MOTION)
  if ( length( angularacceleration.xyz ) > 0. || length( angularvelocity.xyz ) > 0. )
  {
    vec3 angularMotion = ( .5 * angularacceleration.xyz * age + angularvelocity.xyz ) * age;
    direction = applyQuaternion( direction, eulerToQuaternion( angularMotion ) );
  }
#endif

#if defined(USE_ORBITAL_MOTION)
  if ( angularacceleration.w != 0. || angularvelocity.w != 0. ) 
  {
    float orbitalMotion = ( .5 * angularacceleration.w * age + angularvelocity.w ) * age;

    vec3 axis = normalize( cross( direction, orbitalAxis ) );
    direction = applyQuaternion( direction, axisAngleToQuaternion( axis, orbitalMotion ) );
  }
#endif

  vec3 localMotion = direction * distance;

#if defined(USE_LINEAR_MOTION)
  localMotion += ( .5 * acceleration.xyz * age + velocity.xyz ) * age;
#endif

  vec4 globalMotion = particleMatrix * vec4( localMotion, 1. );

#if defined(USE_WORLD_MOTION)
  globalMotion.xyz += .5 * worldacceleration.xyz * age * age;
#endif

#if defined(USE_BROWNIAN_MOTION)
  float r = age*brownian.x;
  float nx = fbm3( globalMotion.xyz - rand( vec2(localMotion.x, spawnTime) )*r ) - .5;
  float ny = fbm3( globalMotion.yzx + rand( vec2(localMotion.y, spawnTime) )*r ) - .5;
  float nz = fbm3( globalMotion.zxy - rand( vec2(localMotion.z, spawnTime) )*r ) - .5;
  globalMotion.xyz += vec3(nx, ny, nz)*brownian.y;
#endif

  return globalMotion;
}

void main()`
  )

  material.vertexShader = material.vertexShader.replace(
    '#include <project_vertex>',
    `

vec4 globalMotion = vec4(0.);

float spawnTime = timings.x;
float lifeTime = timings.y;
float repeatTime = timings.z;
float age = mod( time - spawnTime, max( repeatTime, lifeTime ) );
float timeRatio = age / lifeTime;
float particleScale = interpolate( scales, timeRatio );

{
  float seed = timings.w;

  float particleOpacity = interpolate( opacities.xyz, timeRatio );
  vec3 particleColor = vec3(
    interpolate( unpackRGB( colors.x ), timeRatio ),
    interpolate( unpackRGB( colors.y ), timeRatio ),
    interpolate( unpackRGB( colors.z ), timeRatio )
  );

  mat4 particleMatrix = mat4(
    vec4( row1.x, row2.x, row3.x, 0. ),
    vec4( row1.y, row2.y, row3.y, 0. ),
    vec4( row1.z, row2.z, row3.z, 0. ),
    vec4( row1.w, row2.w, row3.w, 1. )
  );

  float distance = length( offset );
  vec3 direction = distance == 0. ? normalize( rand3( vec2(spawnTime, seed) )*2. - .5 ) : offset / distance;

#if defined(USE_BROWNIAN_MOTION)
  vec2 brownian = unpackBrownian(worldacceleration.w);
#else
  vec2 brownian = vec2(0.);
#endif

#if defined(USE_ORBITAL_MOTION)
  vec3 orbitalAxis = normalize( rand3( vec2(spawnTime, seed) )*2. - .5 );
#else
  vec3 orbitalAxis = vec3(0.);
#endif

  globalMotion = calcGlobalMotion( particleMatrix, distance, direction, age, spawnTime, brownian, orbitalAxis );
  vec4 screenPosition = projectionMatrix * modelViewMatrix * globalMotion;

  vParticleColor = vec4( particleColor, particleOpacity );
  vUvTransform = mat3( 1. );

#if defined(USE_FRAMES_OR_ORIENTATION) || defined(USE_VELOCITY_SCALE)

  float orientation = interpolate( orientations.xyz, timeRatio );

#if defined(USE_VELOCITY_SCALE)
  vec4 futureMotion = calcGlobalMotion( particleMatrix, distance, direction, age + .01, spawnTime, brownian, orbitalAxis );
  vec4 screenFuture = projectionMatrix * modelViewMatrix * futureMotion;
  vec2 delta = screenFuture.xy / screenFuture.z - screenPosition.xy / screenPosition.z;

  float lenDelta = length( delta );
  float velocityOrientation = atan( delta.x, delta.y );

  if (velocityscale.x > 0.) {
    orientation -= velocityOrientation;
    particleScale *= clamp(velocityscale.x*100.*lenDelta*screenFuture.z, velocityscale.y, velocityscale.z );
  }
#endif // USE_VELOCITY_SCALE

  vec4 upView = modelViewMatrix * vec4(0., 1., 0., 1.) - modelViewMatrix * vec4(0., 0., 0., 1.);
  float viewOrientation = atan( upView.x, upView.y );
  orientation -= viewOrientation * orientations.w;

  vec3 frameInfoA = unpackFrame( colors.w );
  vec3 frameInfoB = unpackFrame( opacities.w );

  float frameCols = frameInfoA.x;
  float frameRows = frameInfoA.y;
  float startFrame = frameInfoA.z;
  float endFrame = frameInfoB.z;

  int atlasIndex = int( frameInfoB.y );
  vec2 atlasUV = unpackUVs( textureAtlas[atlasIndex].x );
  vec2 atlasSize = unpackUVs( textureAtlas[atlasIndex].y );
  vec2 frameUV = atlasSize/frameInfoA.xy;

  float frameStyle = frameInfoB.x;
  float numFrames = endFrame - startFrame + 1.;
  float currentFrame = floor( mix( startFrame, endFrame + .99999, timeRatio ) );

  currentFrame = frameStyle == 0. ? currentFrame 
    : frameStyle == 1. ? ( floor( rand( vec2(currentFrame * 6311., seed) ) * numFrames ) + startFrame  )
    : ( floor( seed * numFrames ) + startFrame );

  float tx = mod( currentFrame, frameCols ) * frameUV.x + atlasUV.x;
  float ty = 1. - floor( currentFrame / frameCols ) * frameUV.y - atlasUV.y;
  float sx = frameUV.x;
  float sy = frameUV.y;
  float cx = .5 * sx;
  float cy = -.5 * sy;
  float c = cos( orientation );
  float s = sin( orientation );

  mat3 uvrot = mat3( vec3( c, -s, 0. ), vec3( s, c, 0. ), vec3( 0., 0., 1.) );
  mat3 uvtrans = mat3( vec3( 1., 0., 0. ), vec3( 0., 1., 0. ), vec3( tx + cx, ty + cy, 1. ) );
  mat3 uvscale = mat3( vec3( sx, 0., 0. ), vec3( 0., sy, 0. ), vec3( 0., 0., 1.) );
  mat3 uvcenter = mat3( vec3( 1., 0., 0. ), vec3( 0., 1., 0. ), vec3( -cx / sx, cy / sy, 1. ) );  

  vUvTransform = uvtrans * uvscale * uvrot * uvcenter;

#endif // USE_FRAMES_OR_ORIENTATION || VELOCITY_SCALE

}

#if defined(USE_RIBBON) || defined(USE_MESH)
  transformed = particleScale * transformed + globalMotion.xyz;
#else
  transformed += globalMotion.xyz;
#endif

#include <project_vertex>

if (particleScale <= 0. || timeRatio < 0. || timeRatio > 1. )
{
  gl_Position.w = -2.; // don't draw
}`
  )

  // style particles only
  material.vertexShader = material.vertexShader.replace(
    'if ( isPerspective ) gl_PointSize *= ( scale / - mvPosition.z );',
    `
if ( isPerspective ) gl_PointSize *= ( scale * particleScale / -mvPosition.z );`
  )

  material.fragmentShader = material.fragmentShader.replace(
    'void main()',
    `
varying mat3 vUvTransform;
varying vec4 vParticleColor;

void main()`
  )

  // style particles only
  material.fragmentShader = material.fragmentShader.replace(
    '#include <map_particle_fragment>',
    `
#if defined( USE_MAP ) || defined( USE_ALPHAMAP )

	vec2 uv = ( uvTransform * vUvTransform * vec3( gl_PointCoord.x, 1.0 - gl_PointCoord.y, 1 ) ).xy;

#endif

#ifdef USE_MAP

	vec4 mapTexel = texture2D( map, uv );
  diffuseColor *= mapTexelToLinear( mapTexel );

#endif

#ifdef USE_ALPHAMAP

	diffuseColor.a *= texture2D( alphaMap, uv ).g;

#endif`
  )

  // style mesh or ribbon
  material.fragmentShader = material.fragmentShader.replace(
    '#include <color_fragment>',
    `
diffuseColor *= vParticleColor;

#include <color_fragment>`
  )
}
