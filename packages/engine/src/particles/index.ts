export * from "./classes/ParticleEmitter"
export * from "./classes/ParticleMesh"
export * from "./components/Keyframe"
export * from "./components/ParticleEmitter"
export * from "./functions/Keyframes"
export * from "./systems/KeyframeSystem"
export * from "./systems/ParticleSystem"

import { isBrowser } from "../common/functions/isBrowser"
import { World } from "../ecs/classes/World"
import { registerSystem } from "../ecs/functions/SystemFunctions"
import { ParticleSystem } from "./systems/ParticleSystem"

const DEFAULT_OPTIONS = {
  mouse: true,
  keyboard: true,
  touchscreen: true,
  gamepad: true,
  debug: false
}

export function initializeParticleSystem(world: World, options = DEFAULT_OPTIONS): void {
  if (options.debug) console.log("Initializing particle system...")

  if (!isBrowser) return console.error("Couldn't initialize particles, are you in a browser?")

  if (window && options.debug) (window as any).DEBUG_INPUT = true

  if (options.debug) {
    console.log("Registering particle system with the following options:")
    console.log(options)
  }
  registerSystem(ParticleSystem)

  if (options.debug) console.log("INPUT: Registered particle system.")
}
