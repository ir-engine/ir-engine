import { Quaternion, Vector3 } from 'three'
import { Engine } from '../ecs/classes/Engine'
import { EngineEvents } from '../ecs/classes/EngineEvents'
import { getComponent, hasComponent } from '../ecs/functions/EntityFunctions'
import { GamePlayer } from '../game/components/GamePlayer'
import { getGameFromName } from '../game/functions/functions'
import { YourTurn } from '../game/templates/Golf/components/YourTurnTagComponent'
import { Input } from '../input/components/Input'
import { BaseInput } from '../input/enums/BaseInput'
import { Network } from '../networking/classes/Network'
import { TransformComponent } from '../transform/components/TransformComponent'
import { sendXRInputData, swingClub, updateController, updateHead, tweenXRInputSource } from './golfHooks'

export const setupBotHooks = (): void => {
  globalThis.botHooks = BotHooks
}

export const BotHooks = {
  initializeBot,
  overrideXR,
  xrSupported,
  xrInitialized,
  startXR,
  updateHead,
  updateController,
  pressControllerButton,
  moveControllerStick,
  getPlayerPosition,
  getBallPosition,
  getIsYourTurn,
  getXRInputPosition,
  tweenXRInputSource,
  swingClub
}

export const BotHooksTags = Object.fromEntries(
  Object.entries(BotHooks).map(([key]) => [key, key])
) as { [K in keyof typeof BotHooks]: K }

export function initializeBot () {
  Engine.isBot = true
}

// === SETUP WEBXR === //

export async function overrideXR () {
  // inject the webxr polyfill from the webxr emulator source - this is a script added by the bot
  globalThis.WebXRPolyfillInjection()
  new globalThis.CustomWebXRPolyfill();
  // override session supported request, it hangs indefinitely for some reason
  (navigator as any).xr.isSessionSupported = () => { return true }

  const deviceDefinition = {
    id: 'Oculus Quest',
    name: 'Oculus Quest',
    modes: [
      'inline',
      'immersive-vr'
    ],
    headset: {
      hasPosition: true,
      hasRotation: true
    },
    controllers: [
      {
        id: 'Oculus Touch (Right)',
        buttonNum: 7,
        primaryButtonIndex: 0,
        primarySqueezeButtonIndex: 1,
        hasPosition: true,
        hasRotation: true,
        hasSqueezeButton: true,
        isComplex: true
      },
      {
        id: 'Oculus Touch (Left)',
        buttonNum: 7,
        primaryButtonIndex: 0,
        primarySqueezeButtonIndex: 1,
        hasPosition: true,
        hasRotation: true,
        hasSqueezeButton: true,
        isComplex: true
      }
    ]
  }

  // send our device info to the polyfill API so it knows our capabilities
  window.dispatchEvent(new CustomEvent('webxr-device-init', { detail: { stereoEffect: false, deviceDefinition } }))
}

export async function xrSupported () {
  const supported = await (navigator as any).xr.isSessionSupported('immersive-vr')
  Engine.xrSupported = supported
  return supported
}

export function xrInitialized () {
  return Boolean(Engine.xrSession)
}

export function startXR () {
  EngineEvents.instance.dispatchEvent({ type: 'WEBXR_RENDERER_SYSTEM_XR_START' })
  window.dispatchEvent(new CustomEvent('webxr-pose', {
    detail: {
      position: [0, 1.6, 0],
      quaternion: [0, 0, 0, 1]
    }
  }))
  window.dispatchEvent(new CustomEvent('webxr-input-pose', {
    detail: {
      objectName: 'rightController',
      position: [0.5, 1.5, -1],
      quaternion: [0, 0, 0, 1]
    }
  }))
  window.dispatchEvent(new CustomEvent('webxr-input-pose', {
    detail: {
      objectName: 'leftController',
      position: [-0.5, 1.5, -1],
      quaternion: [0, 0, 0, 1]
    }
  }))

  // send our input data non stop
  setInterval(() => {
    sendXRInputData()
  }, 1000 / 60)
}

/**
 * @param {object} args
 * @param {boolean} args.pressed
 * @param {string} args.objectName
 * @param {number} args.buttonIndex
 * @returns {function}
 */
export function pressControllerButton (args) {
  window.dispatchEvent(new CustomEvent('webxr-input-button', {
    detail: args
  }))
}

/**
 * @param {object} args
 * @param {boolean} args.value
 * @param {string} args.objectName
 * @param {number} args.axesIndex
 * @returns {function}
 */
export function moveControllerStick (args) {
  window.dispatchEvent(new CustomEvent('webxr-input-axes', {
    detail: args
  }))
}

// === ENGINE === //

export function getPlayerPosition () {
  const pos = getComponent(Network.instance.localClientEntity, TransformComponent)?.position
  if (!pos) return
  // transform is centered on collider
  pos.y -= 0.9
  return pos
}

export function getBallPosition () {
  const { gameName, role } = getComponent(Network.instance.localClientEntity, GamePlayer)

  const playerNumber = Number(role.slice(0, 1))

  if (!gameName) return
  const game = getGameFromName(gameName)
  if (!game) {
    console.log('Game not found')
    return
  }
  // TODO: get player number
  const ballEntity = game.gameObjects.GolfBall[0]
  if (!ballEntity) {
    console.log('ball entity not found for player number', playerNumber, role)
    return
  }
  return getComponent(ballEntity, TransformComponent)?.position
}

export function getIsYourTurn () {
  return hasComponent(Network.instance.localClientEntity, YourTurn)
}

// is in world space, so subtract player pos from it
export function getXRInputPosition () {
  const input = getComponent(Network.instance.localClientEntity, Input)
  const headInputValue = input.data.get(BaseInput.XR_HEAD)?.value
  const leftControllerInputValue = input.data.get(BaseInput.XR_CONTROLLER_LEFT_HAND)?.value
  const rightControllerInputValue = input.data.get(BaseInput.XR_CONTROLLER_RIGHT_HAND)?.value
  return {
    headInputValue,
    leftControllerInputValue,
    rightControllerInputValue
  }
}
