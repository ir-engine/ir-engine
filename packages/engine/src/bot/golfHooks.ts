import { Euler, Quaternion, Vector3 } from "three"

const frameDelta = 1000 / 60;

const headPosition = new Vector3(0, 1.6, 0)
const headRotation = new Quaternion()
const leftControllerPosition = new Vector3(-0.5, 1.5, -1)
const leftControllerRotation = new Quaternion()
const rightControllerPosition = new Vector3(0.5, 1.5, -1)
const rightControllerRotation = new Quaternion()

type InputSource = 'head' | 'leftController' | 'rightController'

const getInputSourcePosition = (inputSource: InputSource) => {
  switch (inputSource) {
    case 'head': return headPosition;
    case 'leftController': return leftControllerPosition;
    case 'rightController': return rightControllerPosition;
  }
}
const getInputSourceRotation = (inputSource: InputSource) => {
  switch (inputSource) {
    case 'head': return headRotation;
    case 'leftController': return leftControllerRotation;
    case 'rightController': return rightControllerRotation;
  }
}

export const sendXRInputData = () => {
  window.dispatchEvent(new CustomEvent('webxr-pose', {
    detail: {
      position: headPosition.toArray(),
      quaternion: headRotation.toArray()
    }
  }))
  window.dispatchEvent(new CustomEvent('webxr-input-pose', {
    detail: {
      objectName: 'leftController',
      position: leftControllerPosition.toArray(),
      quaternion: leftControllerRotation.toArray()
    }
  }))
  window.dispatchEvent(new CustomEvent('webxr-input-pose', {
    detail: {
      objectName: 'rightController',
      position: rightControllerPosition.toArray(),
      quaternion: rightControllerRotation.toArray()
    }
  }))
}

export type InputSourceTweenProps = {
  objectName: InputSource,
  time: number // in frames
  positionFrom: Vector3,
  positionTo: Vector3,
  quaternionFrom: Quaternion
  quaternionTo: Quaternion
  callback: () => void
}

/**
 * @param {object} args 
 * @param {array} args.position
 * @param {array} args.quaternion
 * @returns {function}
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
  if(args.objectName === 'leftController') {
    leftControllerPosition.fromArray(args.position)
    leftControllerRotation.fromArray(args.rotation)
  } else {
    rightControllerPosition.fromArray(args.position)
    rightControllerRotation.fromArray(args.rotation)
  }
}

export function tweenXRInputSource (args: InputSourceTweenProps) {
  let counter = 0
  const vec3 = getInputSourcePosition(args.objectName)
  const quat = getInputSourceRotation(args.objectName)
  const interval = setInterval(() => {
    vec3.lerpVectors(args.positionFrom, args.positionTo, counter / args.time)
    quat.slerpQuaternions(args.quaternionFrom, args.quaternionTo, counter / args.time)
    if (counter >= args.time) {
      clearInterval(interval);
      args.callback()
    }
    counter++;
  }, frameDelta)
}

export function swingClub() {
  return new Promise<void>((resolve) => {
    tweenXRInputSource({
      objectName: 'rightController',
      time: 20, // 1 second
      positionFrom: new Vector3(0.5, 1, 0.04),
      positionTo: new Vector3(-0.5, 1, 0.04),
      quaternionFrom: eulerToQuaternion(-1.54, 0, 0),
      quaternionTo: eulerToQuaternion(-1.54, 0, 0),
      callback: resolve
    })
  })
}

const eulerToQuaternion = (x, y, z, order = 'XYZ') => {
  return new Quaternion().setFromEuler(new Euler(x, y, z, order))
}
