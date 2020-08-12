import * as THREE from "three"
import { createPseudoRandom } from "../../common/functions/MathRandomFunctions"
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
} from "./ParticleMesh"
import { ParticleEmitterInterface, ParticleEmitter } from "../interfaces"

const error = console.error
const FRAME_STYLES = ["sequence", "randomsequence", "random"]
const DEG2RAD = THREE.MathUtils.DEG2RAD

export function createParticleEmitter(
  options: ParticleEmitterInterface,
  matrixWorld: THREE.Matrix4,
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
    frameStyle: "sequence",
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
  }

  Object.defineProperties(config, Object.getOwnPropertyDescriptors(options)) // preserves getters

  const mesh = config.particleMesh
  const geometry = mesh.geometry
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
  if (mesh.userData.meshConfig.style === "particle") {
    loadTexturePackerJSON(mesh, config, startIndex, endIndex)
  }

  return { startTime, startIndex, endIndex, mesh }
}

export function deleteParticleEmitter(emitter: ParticleEmitter): void {
  //emitter.mesh.userData.nextIndex = emitter.startIndex;
  for (let i = emitter.startIndex; i < emitter.endIndex; i++) {
    despawn(emitter.mesh.geometry, i)
  }

  needsUpdate(emitter.mesh.geometry)
}

function despawn(geometry, index) {
  // TODO: cleanup mesh!
  setTimingsAt(geometry, index, 0, 0, 0, 0)
}

export function setEmitterTime(emitter: ParticleEmitter, time: number): void {
  setMaterialTime(emitter.mesh.material, time)
}

export function setEmitterMatrixWorld(emitter: ParticleEmitter, matrixWorld: THREE.Matrix4, time: number, deltaTime: number): void {
  const geometry = emitter.mesh.geometry
  const endIndex = emitter.endIndex
  const startIndex = emitter.startIndex
  const timings = geometry.getAttribute("timings")
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
    needsUpdate(geometry, ["row1", "row2", "row3"])
  }
}

function spawn(geometry, matrixWorld, config, index, spawnTime, lifeTime, repeatTime, textureFrame, seed, rndFn) {
  const velocity = config.velocity
  const acceleration = config.acceleration
  const angularVelocity = config.angularVelocity
  const angularAcceleration = config.angularAcceleration
  const worldAcceleration = config.worldAcceleration

  const particleLifeTime = Array.isArray(lifeTime) ? rndFn() * (lifeTime[1] - lifeTime[0]) + lifeTime[0] : lifeTime
  const orientations = config.orientations.map(o => o * DEG2RAD)
  const frames = config.frames
  const atlas = config.atlas

  const startFrame = frames.length > 0 ? frames[0] : 0
  const endFrame =
    frames.length > 1 ? frames[1] : frames.length > 0 ? frames[0] : textureFrame.cols * textureFrame.rows - 1
  const frameStyleIndex = FRAME_STYLES.indexOf(config.frameStyle) >= 0 ? FRAME_STYLES.indexOf(config.frameStyle) : 0
  const atlasIndex = typeof atlas === "number" ? atlas : 0

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
//   const pos = new THREE.Vector3()
//   const inverseObjectMatrix = new THREE.Matrix4()
//   const mat4 = new THREE.Matrix4()
//
//   geometry.object3D.updateMatrixWorld()
//   inverseObjectMatrix.getInverse(geometry.object3D.matrixWorld)
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
