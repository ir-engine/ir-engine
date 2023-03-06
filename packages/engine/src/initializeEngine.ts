import _ from 'lodash'

import { BotUserAgent } from '@etherealengine/common/src/constants/BotUserAgent'
import { addActionReceptor, dispatchAction, getState } from '@etherealengine/hyperflux'

import { Timer } from './common/functions/Timer'
import { Engine } from './ecs/classes/Engine'
import { EngineActions, EngineEventReceptor, EngineState } from './ecs/classes/EngineState'
import { createWorld, destroyWorld } from './ecs/classes/World'
import FixedPipelineSystem from './ecs/functions/FixedPipelineSystem'
import { initSystemSync } from './ecs/functions/SystemFunctions'
import { SystemUpdateType } from './ecs/functions/SystemUpdateType'
import IncomingActionSystem from './networking/systems/IncomingActionSystem'
import OutgoingActionSystem from './networking/systems/OutgoingActionSystem'
import { EngineRenderer } from './renderer/WebGLRendererSystem'
import { ObjectLayers } from './scene/constants/ObjectLayers'
import { FontManager } from './xrui/classes/FontManager'

/**
 * Creates a new instance of the engine and engine renderer. This initializes all properties and state for the engine,
 * adds action receptors and creates a new world.
 * @returns {Engine}
 */
export const createEngine = () => {
  if (Engine.instance?.currentWorld) {
    destroyWorld(Engine.instance.currentWorld)
  }
  Engine.instance = new Engine()
  createWorld()
  EngineRenderer.instance = new EngineRenderer()
  addActionReceptor(EngineEventReceptor)
  Engine.instance.engineTimer = Timer(executeWorlds, Engine.instance.tickRate)
}

export const setupEngineActionSystems = () => {
  const world = Engine.instance.currentWorld
  initSystemSync(world, {
    uuid: 'xre.engine.FixedPipelineSystem',
    type: SystemUpdateType.UPDATE,
    systemFunction: FixedPipelineSystem
  })
  initSystemSync(world, {
    uuid: 'xre.engine.IncomingActionSystem',
    type: SystemUpdateType.FIXED_EARLY,
    systemFunction: IncomingActionSystem
  })
  initSystemSync(world, {
    uuid: 'xre.engine.OutgoingActionSystem',
    type: SystemUpdateType.FIXED_LATE,
    systemFunction: OutgoingActionSystem
  })
}

/**
 * initializeBrowser
 *
 * initializes everything for the browser context
 */
export const initializeBrowser = () => {
  const audioContext = new (globalThis.AudioContext || globalThis.webkitAudioContext)()
  audioContext.resume()
  Engine.instance.audioContext = audioContext
  Engine.instance.cameraGainNode = audioContext.createGain()
  Engine.instance.cameraGainNode.connect(audioContext.destination)
  const world = Engine.instance.currentWorld
  world.camera.layers.disableAll()
  world.camera.layers.enable(ObjectLayers.Scene)
  world.camera.layers.enable(ObjectLayers.Avatar)
  world.camera.layers.enable(ObjectLayers.UI)

  Engine.instance.isBot = navigator.userAgent === BotUserAgent

  // maybe needs to be awaited?
  FontManager.instance.getDefaultFont()

  EngineRenderer.instance.initialize()
  setupInitialClickListener()
  Engine.instance.engineTimer.start()
}

const setupInitialClickListener = () => {
  const canvas = EngineRenderer.instance.renderer.domElement
  const initialClickListener = () => {
    dispatchAction(EngineActions.setUserHasInteracted({}))
    window.removeEventListener('click', initialClickListener)
    window.removeEventListener('touchend', initialClickListener)
    canvas.removeEventListener('click', initialClickListener)
    canvas.removeEventListener('touchend', initialClickListener)
  }
  window.addEventListener('click', initialClickListener)
  window.addEventListener('touchend', initialClickListener)
  canvas.addEventListener('click', initialClickListener)
  canvas.addEventListener('touchend', initialClickListener)
}

/**
 * initializeNode
 *
 * initializes everything for the node context
 */
export const initializeNode = () => {
  Engine.instance.engineTimer.start()
}

const executeWorlds = (elapsedTime) => {
  const engineState = getState(EngineState)
  engineState.frameTime.set(elapsedTime)
  for (const world of Engine.instance.worlds) {
    world.execute(elapsedTime)
  }
}
