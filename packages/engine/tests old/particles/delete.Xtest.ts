import { expect, test } from '@jest/globals'
import { ParticleMesh } from '../../src/particles/interfaces'
import { createParticleEmitter, createParticleMesh, deleteParticleEmitter } from '../../src/particles'
import { Matrix4 } from 'three'

let sharedParticleMesh: ParticleMesh
const options = {
  emitter1: {
    particleMesh: null,
    radialVelocity: 1,
    count: 10
  },
  emitter2: {
    particleMesh: null,
    radialVelocity: 2,
    count: 20
  },
  emitter3: {
    particleMesh: null,
    radialVelocity: 3,
    count: 30
  }
}

function createSharedMesh() {
  sharedParticleMesh = createParticleMesh({
    //texture: "assets/spritesheet.png",
    particleCount: 100,
    alphaTest: 0.3,
    useBrownianMotion: true,
    useVelocityScale: true,
    transparent: true,
    depthWrite: false
  })

  options.emitter1.particleMesh = sharedParticleMesh
  options.emitter2.particleMesh = sharedParticleMesh
  options.emitter3.particleMesh = sharedParticleMesh
}

function clearSharedMesh() {
  sharedParticleMesh = null
  options.emitter1.particleMesh = null
  options.emitter2.particleMesh = null
  options.emitter3.particleMesh = null
}

describe('nextIndex and emitters data properly updated', () => {
  createSharedMesh()

  const emitter1 = createParticleEmitter(options.emitter1, new Matrix4(), 0)
  const emitter2 = createParticleEmitter(options.emitter2, new Matrix4(), 0)
  const emitter3 = createParticleEmitter(options.emitter3, new Matrix4(), 0)

  deleteParticleEmitter(emitter2)

  test('nextIndex', () => {
    expect(sharedParticleMesh.userData.nextIndex).toBe(40)
  })
  test('emitter1: startIndex,endIndex', () => {
    expect([emitter1.startIndex, emitter1.endIndex]).toStrictEqual([0, 9])
  })
  test('emitter2: startIndex,endIndex', () => {
    expect([emitter3.startIndex, emitter3.endIndex]).toStrictEqual([10, 39])
  })

  clearSharedMesh()
})

test('delete correctly updates geometry', () => {
  createSharedMesh()

  createParticleEmitter(options.emitter1, new Matrix4(), 0)
  const emitter2 = createParticleEmitter(options.emitter2, new Matrix4(), 0)
  createParticleEmitter(options.emitter3, new Matrix4(), 0)
  createParticleEmitter(options.emitter1, new Matrix4(), 0)

  deleteParticleEmitter(emitter2)

  const velocity = sharedParticleMesh.geometry.getAttribute('velocity')
  const emmitter1_first_radial = velocity.getW(0)
  const emmitter1_last_radial = velocity.getW(9)
  const emmitter3_first_radial = velocity.getW(10)
  const emmitter3_last_radial = velocity.getW(39)
  const emmitter4_first_radial = velocity.getW(40)
  const emmitter4_last_radial = velocity.getW(49)

  const result = [
    emmitter1_first_radial,
    emmitter1_last_radial,
    emmitter3_first_radial,
    emmitter3_last_radial,
    emmitter4_first_radial,
    emmitter4_last_radial
  ]
  const expected = [1, 1, 3, 3, 1, 1]
  console.log('result', result)
  console.log('expected', expected)

  expect(result).toStrictEqual(expected)

  clearSharedMesh()
})
