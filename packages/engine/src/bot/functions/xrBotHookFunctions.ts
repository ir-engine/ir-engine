// === SETUP WEBXR === //

import { Quaternion, Vector3 } from 'three'
import { Engine } from '../../ecs/classes/Engine'
import { EngineEvents } from '../../ecs/classes/EngineEvents'
import { getComponent } from '../../ecs/functions/EntityFunctions'
import { InputComponent } from '../../input/components/InputComponent'
import { BaseInput } from '../../input/enums/BaseInput'
import { Network } from '../../networking/classes/Network'
import { XRSystem } from '../../xr/systems/XRSystem'

export async function overrideXR() {
  // inject the webxr polyfill from the webxr emulator source - this is a script added by the bot
  globalThis.WebXRPolyfillInjection()
  new globalThis.CustomWebXRPolyfill()
  // override session supported request, it hangs indefinitely for some reason
  ;(navigator as any).xr.isSessionSupported = () => {
    return true
  }

  const deviceDefinition = {
    id: 'Oculus Quest',
    name: 'Oculus Quest',
    modes: ['inline', 'immersive-vr'],
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

export async function xrSupported() {
  const supported = await (navigator as any).xr.isSessionSupported('immersive-vr')
  Engine.xrSupported = supported
  return supported
}

export function xrInitialized() {
  return Boolean(Engine.xrSession)
}

export function startXR() {
  EngineEvents.instance.dispatchEvent({ type: EngineEvents.EVENTS.XR_START })
  window.dispatchEvent(
    new CustomEvent('webxr-pose', {
      detail: {
        position: [0, 1.6, 0],
        quaternion: [0, 0, 0, 1]
      }
    })
  )
  window.dispatchEvent(
    new CustomEvent('webxr-input-pose', {
      detail: {
        objectName: 'rightController',
        position: [0.5, 1.5, -1],
        quaternion: [0, 0, 0, 1]
      }
    })
  )
  window.dispatchEvent(
    new CustomEvent('webxr-input-pose', {
      detail: {
        objectName: 'leftController',
        position: [-0.5, 1.5, -1],
        quaternion: [0, 0, 0, 1]
      }
    })
  )

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
export function pressControllerButton(args) {
  window.dispatchEvent(
    new CustomEvent('webxr-input-button', {
      detail: args
    })
  )
}

/**
 * @param {object} args
 * @param {boolean} args.value
 * @param {string} args.objectName
 * @param {number} args.axesIndex
 * @returns {function}
 */
export function moveControllerStick(args) {
  window.dispatchEvent(
    new CustomEvent('webxr-input-axes', {
      detail: args
    })
  )
}

// is in world space, so subtract player pos from it
export function getXRInputPosition() {
  const input = getComponent(Network.instance.localClientEntity, InputComponent)
  const headInputValue = input.data.get(BaseInput.XR_HEAD)?.value
  const leftControllerInputValue = input.data.get(BaseInput.XR_CONTROLLER_LEFT_HAND)?.value
  const rightControllerInputValue = input.data.get(BaseInput.XR_CONTROLLER_RIGHT_HAND)?.value
  return {
    headInputValue,
    leftControllerInputValue,
    rightControllerInputValue
  }
}

type InputSource = 'head' | 'leftController' | 'rightController'

const headPosition = new Vector3(0, 1.6, 0)
const headRotation = new Quaternion()
const leftControllerPosition = new Vector3(-0.5, 1.5, -1)
const leftControllerRotation = new Quaternion()
const rightControllerPosition = new Vector3(0.5, 1.5, -1)
const rightControllerRotation = new Quaternion()

export const getInputSourcePosition = (inputSource: InputSource) => {
  switch (inputSource) {
    case 'head':
      return headPosition
    case 'leftController':
      return leftControllerPosition
    case 'rightController':
      return rightControllerPosition
  }
}
export const getInputSourceRotation = (inputSource: InputSource) => {
  switch (inputSource) {
    case 'head':
      return headRotation
    case 'leftController':
      return leftControllerRotation
    case 'rightController':
      return rightControllerRotation
  }
}

export const sendXRInputData = () => {
  window.dispatchEvent(
    new CustomEvent('webxr-pose', {
      detail: {
        position: headPosition.toArray(),
        quaternion: headRotation.toArray()
      }
    })
  )
  window.dispatchEvent(
    new CustomEvent('webxr-input-pose', {
      detail: {
        objectName: 'leftController',
        position: leftControllerPosition.toArray(),
        quaternion: leftControllerRotation.toArray()
      }
    })
  )
  window.dispatchEvent(
    new CustomEvent('webxr-input-pose', {
      detail: {
        objectName: 'rightController',
        position: rightControllerPosition.toArray(),
        quaternion: rightControllerRotation.toArray()
      }
    })
  )
}

export type InputSourceTweenProps = {
  objectName: InputSource
  time: number // in frames
  positionFrom: Vector3
  positionTo: Vector3
  quaternionFrom: Quaternion
  quaternionTo: Quaternion
  callback: () => void
}
const frameDelta = 1000 / 60

export function tweenXRInputSource(args: InputSourceTweenProps) {
  let counter = 0
  const vec3 = getInputSourcePosition(args.objectName)
  const quat = getInputSourceRotation(args.objectName)
  const interval = setInterval(() => {
    vec3.lerpVectors(args.positionFrom, args.positionTo, counter / args.time)
    quat.slerpQuaternions(args.quaternionFrom, args.quaternionTo, counter / args.time)
    if (counter >= args.time) {
      clearInterval(interval)
      args.callback()
    }
    counter++
  }, frameDelta)
}

/**
 * @param {object} args
 * @param {array} args.position
 * @param {array} args.quaternion
 */
export function updateHead(args) {
  headPosition.fromArray(args.position)
  headRotation.fromArray(args.rotation)
}

/**
 * @param {object} args
 * @param {array} args.position
 * @param {array} args.quaternion
 * @param {string} args.objectName
 * @returns {function}
 */
export function updateController(args) {
  if (args.objectName === 'leftController') {
    leftControllerPosition.fromArray(args.position)
    leftControllerRotation.fromArray(args.rotation)
  } else {
    rightControllerPosition.fromArray(args.position)
    rightControllerRotation.fromArray(args.rotation)
  }
}
