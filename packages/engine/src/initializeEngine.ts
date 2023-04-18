import _ from 'lodash'

import { addActionReceptor } from '@etherealengine/hyperflux'

import { Timer } from './common/functions/Timer'
import { Engine } from './ecs/classes/Engine'
import { EngineEventReceptor } from './ecs/classes/EngineState'
import { executeSystems } from './ecs/functions/EngineFunctions'
import { EngineRenderer } from './renderer/WebGLRendererSystem'

/**
 * Creates a new instance of the engine and engine renderer. This initializes all properties and state for the engine,
 * adds action receptors and creates a new world.
 * @returns {Engine}
 */
export const createEngine = () => {
  if (Engine.instance) {
    throw new Error('Engine already exists')
  }
  Engine.instance = new Engine()
  EngineRenderer.instance = new EngineRenderer()
  addActionReceptor(EngineEventReceptor)
  Engine.instance.engineTimer = Timer(executeSystems, Engine.instance.tickRate)
}
