import { Quaternion, Vector3 } from 'three'

import { getState } from '@etherealengine/hyperflux'

import { AudioNodeGroup } from '../scene/components/MediaComponent'
import { AudioState } from './AudioState'
import { PositionalAudioInterface } from './components/PositionalAudioComponent'

export const addPannerNode = (audioNodes: AudioNodeGroup, opts: PositionalAudioInterface) => {
  const panner = getState(AudioState).audioContext.createPanner()
  panner.refDistance = opts.refDistance
  panner.rolloffFactor = opts.rolloffFactor
  panner.maxDistance = opts.maxDistance
  panner.distanceModel = opts.distanceModel
  panner.coneInnerAngle = opts.coneInnerAngle
  panner.coneOuterAngle = opts.coneOuterAngle
  panner.coneOuterGain = opts.coneOuterGain

  audioNodes.source.disconnect()
  audioNodes.source.connect(panner)
  panner.connect(audioNodes.gain)
  audioNodes.panner = panner

  return panner
}

const _rot = new Vector3()

export const updateAudioPanner = (
  panner: PannerNode,
  position: Vector3,
  rotation: Quaternion,
  endTime: number,
  settings: PositionalAudioInterface
) => {
  if (isNaN(position.x)) return
  _rot.set(0, 0, 1).applyQuaternion(rotation)
  if (isNaN(_rot.x)) return
  panner.positionX.linearRampToValueAtTime(position.x, endTime)
  panner.positionY.linearRampToValueAtTime(position.y, endTime)
  panner.positionZ.linearRampToValueAtTime(position.z, endTime)
  panner.orientationX.linearRampToValueAtTime(_rot.x, endTime)
  panner.orientationY.linearRampToValueAtTime(_rot.y, endTime)
  panner.orientationZ.linearRampToValueAtTime(_rot.z, endTime)
  panner.refDistance = settings.refDistance
  panner.rolloffFactor = settings.rolloffFactor
  panner.maxDistance = settings.maxDistance
  panner.distanceModel = settings.distanceModel
  panner.coneInnerAngle = settings.coneInnerAngle
  panner.coneOuterAngle = settings.coneOuterAngle
  panner.coneOuterGain = settings.coneOuterGain
}

export const removePannerNode = (audioNodes: AudioNodeGroup) => {
  audioNodes.source.disconnect()
  audioNodes.source.connect(audioNodes.gain)
  audioNodes.panner?.disconnect()
  audioNodes.panner = undefined
}
