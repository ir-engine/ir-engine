import { MathUtils, Quaternion, Vector3 } from 'three'
import { Engine } from '../../ecs/classes/Engine'
import { getComponent } from '../../ecs/functions/ComponentFunctions'
import { useWorld } from '../../ecs/functions/SystemHooks'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { BotHooks, XRBotHooks } from '../enums/BotHooks'
import {
  getXRInputPosition,
  moveControllerStick,
  overrideXR,
  pressControllerButton,
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
  [BotHooks.GetPlayerPosition]: getPlayerPosition,
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
  [XRBotHooks.TweenXRInputSource]: tweenXRInputSource
}

export function initializeBot() {
  Engine.isBot = true
}

// === ENGINE === //

export function locationLoaded() {
  return Engine.hasJoinedWorld
}

export function getPlayerPosition() {
  return getComponent(useWorld().localClientEntity, TransformComponent)?.position
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
