import _ from 'lodash'

import { BotUserAgent } from '@etherealengine/common/src/constants/BotUserAgent'
import { dispatchAction, getMutableState } from '@etherealengine/hyperflux'
import { WebLayerManager } from '@etherealengine/xrui'

import { loadDRACODecoderNode } from './assets/loaders/gltf/NodeDracoLoader'
import { AudioState } from './audio/AudioState'
import { Engine } from './ecs/classes/Engine'
import { EngineActions, EngineState } from './ecs/classes/EngineState'
import { EngineRenderer } from './renderer/WebGLRendererSystem'
import { ObjectLayers } from './scene/constants/ObjectLayers'
import { FontManager } from './xrui/classes/FontManager'

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
  Engine.instance.camera.layers.enable(ObjectLayers.TransformGizmo)

  getMutableState(EngineState).isBot.set(navigator.userAgent === BotUserAgent)

  // maybe needs to be awaited?
  FontManager.instance.getDefaultFont()

  EngineRenderer.instance.initialize()
  const renderer = EngineRenderer.instance.renderer
  if (!renderer) throw new Error('EngineRenderer.instance.renderer must exist before initializing XRUISystem')

  WebLayerManager.initialize(renderer)
  WebLayerManager.instance.ktx2Encoder.pool.setWorkerLimit(1)

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
