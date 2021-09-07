import { expect, test } from '@jest/globals'
import { ParticleMesh } from '../../src/particles/interfaces'
import { createParticleEmitter, createParticleMesh } from '../../src/particles'
import { Matrix4 } from 'three'

let sharedParticleMesh: ParticleMesh

beforeEach(() => {
  sharedParticleMesh = createParticleMesh({
    //texture: "assets/spritesheet.png",
    particleCount: 20000,
    alphaTest: 0.3,
    useBrownianMotion: true,
    useVelocityScale: true,
    transparent: true,
    depthWrite: false
  })
})

afterEach(() => {
  sharedParticleMesh = null
})

test('nextIndex properly set', () => {
  const emitter = {
    particleMesh: sharedParticleMesh,
    count: 100
  }

  createParticleEmitter(emitter, new Matrix4(), 0)
  expect(sharedParticleMesh.userData.nextIndex).toBe(100)
})

test('geometry values bounds correct', () => {
  const options = {
    emitter1: {
      particleMesh: sharedParticleMesh,
      radialVelocity: 1,
      count: 10
    },
    emitter2: {
      particleMesh: sharedParticleMesh,
      radialVelocity: 2,
      count: 20
    },
    emitter3: {
      particleMesh: sharedParticleMesh,
      radialVelocity: 3,
      count: 30
    }
  }

  createParticleEmitter(options.emitter1, new Matrix4(), 0)
  createParticleEmitter(options.emitter2, new Matrix4(), 0)
  createParticleEmitter(options.emitter3, new Matrix4(), 0)

  const velocity = sharedParticleMesh.geometry.getAttribute('velocity')
  const emmitter1_first_radial = velocity.getW(0)
  const emmitter1_last_radial = velocity.getW(9)
  const emmitter2_first_radial = velocity.getW(10)
  const emmitter2_last_radial = velocity.getW(29)
  const emmitter3_first_radial = velocity.getW(30)
  const emmitter3_last_radial = velocity.getW(59)

  const result = [
    emmitter1_first_radial,
    emmitter1_last_radial,
    emmitter2_first_radial,
    emmitter2_last_radial,
    emmitter3_first_radial,
    emmitter3_last_radial
  ]
  const expected = [1, 1, 2, 2, 3, 3]

  expect(result).toStrictEqual(expected)
})
