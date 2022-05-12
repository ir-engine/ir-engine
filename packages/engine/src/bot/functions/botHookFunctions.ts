import { MathUtils, Quaternion, Vector3 } from 'three'

import { Engine } from '../../ecs/classes/Engine'
import { getEngineState } from '../../ecs/classes/EngineState'
import { getComponent, hasComponent } from '../../ecs/functions/ComponentFunctions'
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

// === ENGINE === //

export function locationLoaded() {
  return getEngineState().joinedWorld.value
}

export function sceneLoaded() {
  return getEngineState().sceneLoaded.value
}

export function getPlayerPosition() {
  // console.log('get player position', Engine.instance.currentWorld.localClientEntity, hasComponent(Engine.instance.currentWorld.localClientEntity, TransformComponent))
  const pos = getComponent(Engine.instance.currentWorld.localClientEntity, TransformComponent)?.position
  // console.log(pos)
  if (!pos) return
  console.log(pos.x, pos.y, pos.z)
  return getComponent(Engine.instance.currentWorld.localClientEntity, TransformComponent)?.position
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
