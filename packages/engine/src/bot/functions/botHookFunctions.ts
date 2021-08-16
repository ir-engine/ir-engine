import { MathUtils, Quaternion, Vector3 } from 'three'
import { DebugHelpers } from '../../debug/systems/DebugHelpersSystem'
import { Engine } from '../../ecs/classes/Engine'
import { EngineEvents } from '../../ecs/classes/EngineEvents'
import { getComponent } from '../../ecs/functions/EntityFunctions'
import { Network } from '../../networking/classes/Network'
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

export const setupBotHooks = (): void => {
  globalThis.botHooks = BotHookFunctions
  globalThis.Engine = Engine
  globalThis.EngineEvents = EngineEvents
  globalThis.Network = Network
}

export const BotHookFunctions = {
  [BotHooks.InitializeBot]: initializeBot,
  [BotHooks.LocationLoaded]: locationLoaded,
  [BotHooks.GetPlayerPosition]: getPlayerPosition,
  [BotHooks.RotatePlayer]: rotatePlayer,
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

  DebugHelpers.toggleDebugPhysics(true)
  DebugHelpers.toggleDebugAvatar(true)
}

// === ENGINE === //

export function locationLoaded() {
  return Engine.hasJoinedWorld
}

export function getPlayerPosition() {
  return getComponent(Network.instance.localClientEntity, TransformComponent)?.position
}

/**
 * @param {object} args
 * @param {number} args.angle in degrees
 */
export function rotatePlayer({ angle }) {
  console.log('===============rotatePlayer', angle)
  const transform = getComponent(Network.instance.localClientEntity, TransformComponent)
  transform.rotation.multiply(new Quaternion().setFromAxisAngle(new Vector3(0, 1, 0), MathUtils.degToRad(angle)))
}
