import { MathUtils, Matrix4, Mesh } from 'three'
import { createPseudoRandom } from '../../common/functions/MathRandomFunctions'
import { ParticleEmitter, ParticleEmitterInterface } from '../interfaces'
import {
  loadTexturePackerJSON,
  needsUpdate,
  setAccelerationAt,
  setAngularAccelerationAt,
  setAngularVelocityAt,
  setBrownianAt,
  setColorsAt,
  setFrameAt,
  setMaterialTime,
  setMatrixAt,
  setOffsetAt,
  setOpacitiesAt,
  setOrientationsAt,
  setScalesAt,
  setTimingsAt,
  setVelocityAt,
  setVelocityScaleAt,
  setWorldAccelerationAt
} from './ParticleMesh'

const error = console.error
const FRAME_STYLES = ['sequence', 'randomsequence', 'random']
const DEG2RAD = MathUtils.DEG2RAD

const emitterRegistry = new Set<any>()
// let emitterRegistry = []

/**
 * Create particle emitter.
 * @param options Options for particle emitter.
 * @param matrixWorld Matrix world of particle emitter.
 * @param time Emitter time.
 *
 * @returns Newly created particle emitter.
 */
export function createParticleEmitter(
  options: ParticleEmitterInterface,
  matrixWorld: Matrix4,
  time = 0
): ParticleEmitter {
  const config = {
    particleMesh: null,
    enabled: true,
    count: -1, // use all available particles
    textureFrame: undefined,
    lifeTime: 1, // may also be [min,max]
    repeatTime: 0, // if 0, use the maximum lifeTime
    burst: 0, // if 1 all particles are spawned at once
    seed: undefined, // a number between 0 and 1
    worldUp: false, // particles relative to world UP (they will get rotated if the camera tilts)

    // per particle values
    atlas: 0,
    frames: [],
    colors: [{ r: 1, g: 1, b: 1 }],
    orientations: [0],
    scales: [1],
    opacities: [1],
    frameStyle: 'sequence',
    offset: { x: 0, y: 0, z: 0 },
    velocity: { x: 0, y: 0, z: 0 },
    acceleration: { x: 0, y: 0, z: 0 },
    radialVelocity: 0,
    radialAcceleration: 0,
    angularVelocity: { x: 0, y: 0, z: 0 },
    angularAcceleration: { x: 0, y: 0, z: 0 },
    orbitalVelocity: 0,
    orbitalAcceleration: 0,
    worldAcceleration: { x: 0, y: 0, z: 0 },
    brownianSpeed: 0,
    brownianScale: 0,
    velocityScale: 0,
    velocityScaleMin: 0.1,
    velocityScaleMax: 1
  } as any

  Object.defineProperties(config, Object.getOwnPropertyDescriptors(options)) // preserves getters

  const mesh = config.particleMesh as Mesh
  const geometry = mesh.geometry
  const id = emitterRegistry.size == 0 ? 0 : Array.from(emitterRegistry)[emitterRegistry.size - 1]['id'] + 1
  const startTime = time
  const startIndex = mesh.userData.nextIndex
  const meshParticleCount = mesh.userData.meshConfig.particleCount
  const count = config.count
  const burst = config.burst
  const lifeTime = config.lifeTime
  const seed = config.seed
  const rndFn = createPseudoRandom(seed)

  const particleRepeatTime = config.repeatTime

  const effectRepeatTime = Math.max(particleRepeatTime, Array.isArray(lifeTime) ? Math.max(...lifeTime) : lifeTime)
  const textureFrame = config.textureFrame ? config.textureFrame : mesh.userData.meshConfig.textureFrame

  if (config.count > 0 && startIndex + config.count > meshParticleCount) {
    error(`run out of particles, increase the particleCount for this ThreeParticleMesh`)
  }
  // clear previous Set()
  if (mesh.userData.nextIndex == 0) {
    emitterRegistry.clear()
  }
  const numParticles = count >= 0 ? count : meshParticleCount - mesh.userData.nextIndex
  mesh.userData.nextIndex += numParticles

  const endIndex = Math.min(meshParticleCount, startIndex + numParticles)

  const spawnDelta = (effectRepeatTime / numParticles) * (1 - burst)
  // const vertices = model3D && typeof config.offset === "function" && model3D.isMesh ? calcSpawnOffsetsFromGeometry(model3D.geometry) : undefined

  for (let i = startIndex; i < endIndex; i++) {
    const spawnTime = time + (i - startIndex) * spawnDelta
    spawn(geometry, matrixWorld, config, i, spawnTime, lifeTime, particleRepeatTime, textureFrame, seed, rndFn)
  }

  needsUpdate(geometry)
  if (mesh.userData.meshConfig.style === 'particle') {
    loadTexturePackerJSON(mesh, config, startIndex, endIndex)
  }

  const emitter = {
    startTime,
    startIndex,
    endIndex,
    mesh: mesh as any
  }

  emitterRegistry.add(emitter)
  return emitter as ParticleEmitter
}

//needsUpdate
/**
 * Delete particle emitter.
 * @param emitter Emitter to be deleted.
 */
export function deleteParticleEmitter(emitter: ParticleEmitter): void {
  const shiftAmount = emitter.endIndex - emitter.startIndex
  emitterRegistry.delete(emitter)

  for (let i = emitter.startIndex; i < emitter.endIndex; i++) {
    despawn(emitter.mesh.geometry, i)
  }
  needsUpdate(emitter.mesh.geometry)

  const geometry = emitter.mesh.geometry

  for (let i = emitter.startIndex; i <= emitter.mesh.userData.nextIndex; i++) {
    copyEmitterAttrs(geometry, i, shiftAmount)
  }
  // console.log(geometry.attributes);
  emitter.mesh.userData.nextIndex -= shiftAmount
  const arrayEmitter: any[] = Array.from(emitterRegistry)
  for (let i = 0; i < emitterRegistry.size; i++) {
    if (
      i == 0 ? arrayEmitter[i]['startIndex'] != 0 : arrayEmitter[i - 1]['endIndex'] != arrayEmitter[i]['startIndex']
    ) {
      arrayEmitter[i]['startIndex'] -= shiftAmount
      arrayEmitter[i]['endIndex'] -= shiftAmount
    }
  }
}

// function copyEmitterAttrs(attributes, index, shiftAmount){
//   if(attributes.array.length == 400){
//     attributes.setXYZW(index,
//       attributes.getX(index + shiftAmount),
//       attributes.getY(index + shiftAmount),
//       attributes.getZ(index + shiftAmount),
//       attributes.getW(index + shiftAmount))
//   }
//   else if (attributes.array.length == 300){
//     attributes.setXYZ(index,
//       attributes.getX(index + shiftAmount),
//       attributes.getY(index + shiftAmount),
//       attributes.getZ(index + shiftAmount))
//   }
// }

/**
 * Copy emitter attributes from emitter geometry.
 * @param geometry Geometry to be copied.
 * @param index Index at which geometry will be copied.
 * @param shiftAmount Amount of shift to be applied on index to get the geometry to be copied.
 */
function copyEmitterAttrs(geometry, index, shiftAmount) {
  const shiftIndex = index + shiftAmount

  const velocity = geometry.getAttribute('velocity')
  const row1 = geometry.getAttribute('row1')
  const row2 = geometry.getAttribute('row2')
  const row3 = geometry.getAttribute('row3')
  const offset = geometry.getAttribute('offset')
  const scales = geometry.getAttribute('scales')
  const orientations = geometry.getAttribute('orientations')
  const colors = geometry.getAttribute('colors')
  const opacities = geometry.getAttribute('opacities')
  const timings = geometry.getAttribute('timings')
  const acceleration = geometry.getAttribute('acceleration')
  const angularvelocity = geometry.getAttribute('angularvelocity')
  const angularacceleration = geometry.getAttribute('angularacceleration')
  const worldacceleration = geometry.getAttribute('worldacceleration')
  const velocityscale = geometry.getAttribute('velocityscale')

  velocity.setXYZW(
    index,
    velocity.getX(shiftIndex),
    velocity.getY(shiftIndex),
    velocity.getZ(shiftIndex),
    velocity.getW(shiftIndex)
  )

  row1.setXYZW(index, row1.getX(shiftIndex), row1.getY(shiftIndex), row1.getZ(shiftIndex), row1.getW(shiftIndex))

  row2.setXYZW(index, row2.getX(shiftIndex), row2.getY(shiftIndex), row2.getZ(shiftIndex), row2.getW(shiftIndex))

  row3.setXYZW(index, row3.getX(shiftIndex), row3.getY(shiftIndex), row3.getZ(shiftIndex), row3.getW(shiftIndex))

  offset.setXYZ(index, offset.getX(shiftIndex), offset.getY(shiftIndex), offset.getZ(shiftIndex))

  // scales.setW(index - 1, scales.getW(shiftIndex))
  scales.setXYZ(index, scales.getX(shiftIndex), scales.getY(shiftIndex), scales.getZ(shiftIndex))

  // orientations.setX(index, orientations.getX(shiftIndex))
  orientations.setXYZW(
    index,
    orientations.getX(shiftIndex),
    orientations.getY(shiftIndex),
    orientations.getZ(shiftIndex),
    orientations.getW(shiftIndex)
  )

  colors.setXYZW(
    index,
    colors.getX(shiftIndex),
    colors.getY(shiftIndex),
    colors.getZ(shiftIndex),
    colors.getW(shiftIndex)
  )

  opacities.setXYZW(
    index,
    opacities.getX(shiftIndex),
    opacities.getY(shiftIndex),
    opacities.getZ(shiftIndex),
    opacities.getW(shiftIndex)
  )

  timings.setXYZW(
    index,
    timings.getX(shiftIndex),
    timings.getY(shiftIndex),
    timings.getZ(shiftIndex),
    timings.getW(shiftIndex)
  )

  acceleration.setXYZW(
    index,
    acceleration.getX(shiftIndex),
    acceleration.getY(shiftIndex),
    acceleration.getZ(shiftIndex),
    acceleration.getW(shiftIndex)
  )

  angularvelocity.setXYZW(
    index,
    angularvelocity.getX(shiftIndex),
    angularvelocity.getY(shiftIndex),
    angularvelocity.getZ(shiftIndex),
    angularvelocity.getW(shiftIndex)
  )

  angularacceleration.setXYZW(
    index,
    angularacceleration.getX(shiftIndex),
    angularacceleration.getY(shiftIndex),
    angularacceleration.getZ(shiftIndex),
    angularacceleration.getW(shiftIndex)
  )

  worldacceleration.setXYZ(
    index,
    worldacceleration.getX(shiftIndex),
    worldacceleration.getY(shiftIndex),
    worldacceleration.getZ(shiftIndex)
  )

  velocityscale.setXYZ(
    index,
    velocityscale.getX(shiftIndex),
    velocityscale.getY(shiftIndex),
    velocityscale.getZ(shiftIndex)
  )
}

/**
 * Despawn all the particles.
 * @param geometry Geometry to be despawned.
 * @param index Index of the geometry.
 */
function despawn(geometry, index): void {
  // TODO: cleanup mesh!

  // matrixWorld = null
  const matrixWorld = {
    elements: []
  }

  setMatrixAt(geometry, index, matrixWorld)
  setOffsetAt(geometry, index, 0)
  setScalesAt(geometry, index, 0)
  setColorsAt(geometry, index, [{}])
  setOrientationsAt(geometry, index, 0, 0)
  setOpacitiesAt(geometry, index, 0)
  setFrameAt(geometry, index, 0, 0, 0, 0, 0, 0)

  setTimingsAt(geometry, index, 0, 0, 0, 0)
  setVelocityAt(geometry, index, 0, 0, 0, 0)
  setAccelerationAt(geometry, index, 0, 0, 0, 0)
  setAngularVelocityAt(geometry, index, 0, 0, 0, 0)
  setAngularAccelerationAt(geometry, index, 0, 0, 0, 0)
  setWorldAccelerationAt(geometry, index, 0, 0, 0)
  setBrownianAt(geometry, index, 0, 0)
  setVelocityScaleAt(geometry, index, 0, 0, 0)
}

/**
 * Set particle emitter time.
 * @param emitter Particle emitter.
 * @param time Time of the particle emitter.
 */
export function setEmitterTime(emitter: ParticleEmitter, time: number): void {
  setMaterialTime(emitter.mesh.material, time)
}

/**
 * Apply matrix world to particle emitter.
 * @param emitter Particle emitter.
 * @param matrixWorld Matrix world to be applied on particle emitter.
 * @param time Time to be applied on particle emitter.
 * @param deltaTime Time since last frame.
 */
export function setEmitterMatrixWorld(
  emitter: ParticleEmitter,
  matrixWorld: Matrix4,
  time: number,
  deltaTime: number
): void {
  const geometry = emitter.mesh.geometry
  const endIndex = emitter.endIndex
  const startIndex = emitter.startIndex
  const timings = geometry.getAttribute('timings')
  let isMoved = false

  for (let i = startIndex; i < endIndex; i++) {
    const startTime = timings.getX(i)
    const lifeTime = timings.getY(i)
    const repeatTime = timings.getZ(i)
    const age = (time - startTime) % Math.max(repeatTime, lifeTime)
    if (age > 0 && age < deltaTime) {
      setMatrixAt(geometry, i, matrixWorld)
      isMoved = true
    }
  }

  if (isMoved) {
    needsUpdate(geometry, ['row1', 'row2', 'row3'])
  }
}

/**
 * Spawn particles.
 * @param geometry Geometry to be spawned.
 * @param matrixWorld Matrix world to be applied on geometry.
 * @param config Configs for particles.
 * @param index Index of particles.
 * @param spawnTime Spawn time to be set on particles.
 * @param lifeTime Life time of particles.
 * @param repeatTime Repeat time for particles to be respawned.
 * @param textureFrame Texture frame for particles.
 * @param seed Random seed.
 * @param rndFn Random function for randomness.
 */
function spawn(geometry, matrixWorld, config, index, spawnTime, lifeTime, repeatTime, textureFrame, seed, rndFn): void {
  const velocity = config.velocity
  const acceleration = config.acceleration
  const angularVelocity = config.angularVelocity
  const angularAcceleration = config.angularAcceleration
  const worldAcceleration = config.worldAcceleration

  const particleLifeTime = Array.isArray(lifeTime) ? rndFn() * (lifeTime[1] - lifeTime[0]) + lifeTime[0] : lifeTime
  const orientations = config.orientations.map((o) => o * DEG2RAD)
  const frames = config.frames
  const atlas = config.atlas

  const startFrame = frames.length > 0 ? frames[0] : 0
  const endFrame =
    frames.length > 1 ? frames[1] : frames.length > 0 ? frames[0] : textureFrame.cols * textureFrame.rows - 1
  const frameStyleIndex = FRAME_STYLES.indexOf(config.frameStyle) >= 0 ? FRAME_STYLES.indexOf(config.frameStyle) : 0
  const atlasIndex = typeof atlas === 'number' ? atlas : 0

  setMatrixAt(geometry, index, matrixWorld)
  setOffsetAt(geometry, index, config.offset)
  setScalesAt(geometry, index, config.scales)
  setColorsAt(geometry, index, config.colors)
  setOrientationsAt(geometry, index, orientations, config.worldUp ? 1 : 0)
  setOpacitiesAt(geometry, index, config.opacities)
  setFrameAt(geometry, index, atlasIndex, frameStyleIndex, startFrame, endFrame, textureFrame.cols, textureFrame.rows)

  setTimingsAt(geometry, index, spawnTime, particleLifeTime, repeatTime, config.seed)
  setVelocityAt(geometry, index, velocity.x, velocity.y, velocity.z, config.radialVelocity)
  setAccelerationAt(geometry, index, acceleration.x, acceleration.y, acceleration.z, config.radialAcceleration)
  setAngularVelocityAt(
    geometry,
    index,
    angularVelocity.x * DEG2RAD,
    angularVelocity.y * DEG2RAD,
    angularVelocity.z * DEG2RAD,
    config.orbitalVelocity * DEG2RAD
  )
  setAngularAccelerationAt(
    geometry,
    index,
    angularAcceleration.x * DEG2RAD,
    angularAcceleration.y * DEG2RAD,
    angularAcceleration.z * DEG2RAD,
    config.orbitalAcceleration * DEG2RAD
  )
  setWorldAccelerationAt(geometry, index, worldAcceleration.x, worldAcceleration.y, worldAcceleration.z)
  setBrownianAt(geometry, index, config.brownianSpeed, config.brownianScale)
  setVelocityScaleAt(geometry, index, config.velocityScale, config.velocityScaleMin, config.velocityScaleMax)
}

// function calcSpawnOffsetsFromGeometry(geometry): any {
//   if (!geometry || !geometry.object3D) {
//     return undefined
//   }
//
//   const worldPositions = []
//   const pos = new Vector3()
//   const inverseObjectMatrix = new Matrix4()
//   const mat4 = new Matrix4()
//
//   geometry.object3D.updateMatrixWorld()
//   inverseObjectMatrix.copy(geometry.object3D.matrixWorld).invert()
//
//   geometry.object3D.traverse(node => {
//     if (!node.geometry || !node.geometry.getAttribute) {
//       return
//     }
//
//     const position = node.geometry.getAttribute("position")
//     if (!position || position.itemSize !== 3) {
//       return
//     }
//
//     for (let i = 0; i < position.count; i++) {
//       mat4.copy(node.matrixWorld).multiply(inverseObjectMatrix)
//       pos.fromBufferAttribute(position, i).applyMatrix4(mat4)
//       worldPositions.push(pos.x, pos.y, pos.z)
//     }
//   })
//
//   return Float32Array.from(worldPositions)
// }
