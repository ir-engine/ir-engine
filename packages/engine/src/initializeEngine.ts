import _ from 'lodash'

import { BotUserAgent } from '@etherealengine/common/src/constants/BotUserAgent'
import { addActionReceptor, dispatchAction, getMutableState } from '@etherealengine/hyperflux'

import { AudioState } from './audio/AudioState'
import { Timer } from './common/functions/Timer'
import { destroyEngine, Engine } from './ecs/classes/Engine'
import { EngineActions, EngineEventReceptor, EngineState } from './ecs/classes/EngineState'
import FixedPipelineSystem from './ecs/functions/FixedPipelineSystem'
import { executeSystems, initSystemSync } from './ecs/functions/SystemFunctions'
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
  if (Engine.instance) {
    throw new Error('Engine already exists')
  }
  Engine.instance = new Engine()
  EngineRenderer.instance = new EngineRenderer()
  addActionReceptor(EngineEventReceptor)
  Engine.instance.engineTimer = Timer(executeSystems, Engine.instance.tickRate)
}

export const setupEngineActionSystems = () => {
  initSystemSync({
    uuid: 'xre.engine.FixedPipelineSystem',
    type: SystemUpdateType.UPDATE,
    systemFunction: FixedPipelineSystem
  })
  initSystemSync({
    uuid: 'xre.engine.IncomingActionSystem',
    type: SystemUpdateType.FIXED_EARLY,
    systemFunction: IncomingActionSystem
  })
  initSystemSync({
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
  const audioState = getMutableState(AudioState)

  const audioContext = new (globalThis.AudioContext || globalThis.webkitAudioContext)()
  audioContext.resume()
  audioState.audioContext.set(audioContext)

  const cameraGainNode = audioContext.createGain()
  audioState.cameraGainNode.set(cameraGainNode)
  cameraGainNode.connect(audioContext.destination)

  Engine.instance.camera.layers.disableAll()
  Engine.instance.camera.layers.enable(ObjectLayers.Scene)
  Engine.instance.camera.layers.enable(ObjectLayers.Avatar)
  Engine.instance.camera.layers.enable(ObjectLayers.UI)

  getMutableState(EngineState).isBot.set(navigator.userAgent === BotUserAgent)

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
