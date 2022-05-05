import { MathUtils, Quaternion, Vector3 } from 'three'

import { Engine } from '../../ecs/classes/Engine'
import { accessEngineState } from '../../ecs/classes/EngineService'
import { getComponent } from '../../ecs/functions/ComponentFunctions'
import { useWorld } from '../../ecs/functions/SystemHooks'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { BotHooks, XRBotHooks } from '../enums/BotHooks'
import {
  getXRInputPosition,
  moveControllerStick,
  overrideXR,
  pressControllerButton,
  setXRInputPosition,
  startXR,
  tweenXRInputSource,
  updateController,
  updateHead,
  xrInitialized,
  xrSupported
} from './xrBotHookFunctions'

export const BotHookFunctions = {
  [BotHooks.InitializeBot]: initializeBot,
  [BotHooks.LocationLoaded]: locationLoaded,
  [BotHooks.SceneLoaded]: sceneLoaded,
  [BotHooks.GetPlayerPosition]: getPlayerPosition,
  [BotHooks.GetSceneMetadata]: getSceneMetadata,
  [BotHooks.RotatePlayer]: rotatePlayer,
  [BotHooks.GetClients]: getClients,
  [XRBotHooks.OverrideXR]: overrideXR,
  [XRBotHooks.XRSupported]: xrSupported,
  [XRBotHooks.XRInitialized]: xrInitialized,
  [XRBotHooks.StartXR]: startXR,
  [XRBotHooks.UpdateHead]: updateHead,
  [XRBotHooks.UpdateController]: updateController,
  [XRBotHooks.PressControllerButton]: pressControllerButton,
  [XRBotHooks.MoveControllerStick]: moveControllerStick,
  [XRBotHooks.GetXRInputPosition]: getXRInputPosition,
  [XRBotHooks.SetXRInputPosition]: setXRInputPosition,
  [XRBotHooks.TweenXRInputSource]: tweenXRInputSource
}

export function initializeBot() {
  Engine.instance.isBot = true
}

// === ENGINE === //

export function locationLoaded() {
  return accessEngineState().joinedWorld.value
}

export function sceneLoaded() {
  return accessEngineState().sceneLoaded.value
}

export function getPlayerPosition() {
  return getComponent(useWorld().localClientEntity, TransformComponent)?.position
}

export function getSceneMetadata() {
  return useWorld().sceneMetadata
}

/**
 * @param {object} args
 * @param {number} args.angle in degrees
 */
export function rotatePlayer({ angle }) {
  const transform = getComponent(useWorld().localClientEntity, TransformComponent)
  transform.rotation.multiply(new Quaternion().setFromAxisAngle(new Vector3(0, 1, 0), MathUtils.degToRad(angle)))
}

export function getClients() {
  return useWorld().clients
}
