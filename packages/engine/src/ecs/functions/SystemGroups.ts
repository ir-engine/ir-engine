import { defineSystem } from './SystemFunctions'

export const InputSystemGroup = defineSystem({
  uuid: 'ee.engine.input-group',
  insert: {}
})

/** Run inside of fixed pipeline */
export const SimulationSystemGroup = defineSystem({
  uuid: 'ee.engine.simulation-group',
  insert: {}
})

export const AnimationSystemGroup = defineSystem({
  uuid: 'ee.engine.animation-group',
  insert: {}
})

export const PresentationSystemGroup = defineSystem({
  uuid: 'ee.engine.presentation-group',
  insert: {}
})
