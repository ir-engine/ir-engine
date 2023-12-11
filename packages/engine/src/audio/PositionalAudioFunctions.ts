/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/EtherealEngine/etherealengine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Ethereal Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Ethereal Engine team.

All portions of the code written by the Ethereal Engine team are Copyright © 2021-2023 
Ethereal Engine. All Rights Reserved.
*/

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
  // firefox only supports the deprecated API
  if (!panner.positionX) {
    panner.setPosition(position.x, position.y, position.z)
    panner.setOrientation(_rot.x, _rot.y, _rot.z)
  } else {
    panner.positionX.linearRampToValueAtTime(position.x, endTime)
    panner.positionY.linearRampToValueAtTime(position.y, endTime)
    panner.positionZ.linearRampToValueAtTime(position.z, endTime)
    panner.orientationX.linearRampToValueAtTime(_rot.x, endTime)
    panner.orientationY.linearRampToValueAtTime(_rot.y, endTime)
    panner.orientationZ.linearRampToValueAtTime(_rot.z, endTime)
  }
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
