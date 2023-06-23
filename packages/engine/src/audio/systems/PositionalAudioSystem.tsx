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

import { Not } from 'bitecs'
import React, { useEffect } from 'react'
import { Vector3 } from 'three'

import { defineActionQueue, getState } from '@etherealengine/hyperflux'

import { AvatarComponent } from '../../avatar/components/AvatarComponent'
import { getAvatarBoneWorldPosition } from '../../avatar/functions/avatarFunctions'
import { Engine } from '../../ecs/classes/Engine'
import { ComponentType, defineQuery, getComponent, useComponent } from '../../ecs/functions/ComponentFunctions'
import { useEntityContext } from '../../ecs/functions/EntityFunctions'
import { createQueryReactor, defineSystem } from '../../ecs/functions/SystemFunctions'
import { NetworkObjectComponent, NetworkObjectOwnedTag } from '../../networking/components/NetworkObjectComponent'
import { MediaSettingsState } from '../../networking/MediaSettingsState'
import { webcamAudioDataChannelType } from '../../networking/NetworkState'
import { AudioNodeGroups, createAudioNodeGroup, MediaElementComponent } from '../../scene/components/MediaComponent'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { AudioSettingAction, AudioState } from '../AudioState'
import { PositionalAudioComponent } from '../components/PositionalAudioComponent'
import { addPannerNode, removePannerNode, updateAudioPanner } from '../PositionalAudioFunctions'

const _vec3 = new Vector3()
const _rot = new Vector3()

/**
 * Scene Objects
 */
const positionalAudioQuery = defineQuery([PositionalAudioComponent, MediaElementComponent, TransformComponent])

/**
 * Avatars
 */
const networkedAvatarAudioQuery = defineQuery([AvatarComponent, NetworkObjectComponent, Not(NetworkObjectOwnedTag)])

const setMediaStreamVolumeActionQueue = defineActionQueue(AudioSettingAction.setMediaStreamVolume.matches)

/** Weak map entry is automatically GC'd when network object is removed */
const avatarAudioStreams: WeakMap<ComponentType<typeof NetworkObjectComponent>, MediaStream> = new WeakMap()

const execute = () => {
  const audioState = getState(AudioState)

  const audioContext = audioState.audioContext
  const network = Engine.instance.mediaNetwork
  const mediaSettings = getState(MediaSettingsState)
  const immersiveMedia = mediaSettings.immersiveMedia

  /**
   * Scene Objects
   */

  /**
   * No need to update pose of positional audio objects if the audio context is not running
   */
  if (audioContext.state !== 'running') return

  /**
   * Avatars
   * lazily detect when consumers are created and destroyed
   */
  const networkedAvatarAudioEntities = networkedAvatarAudioQuery()
  for (const entity of networkedAvatarAudioEntities) {
    const networkObject = getComponent(entity, NetworkObjectComponent)
    const peerID = networkObject.ownerId
    const consumer = network?.consumers.find(
      (c) =>
        c.appData.mediaTag === webcamAudioDataChannelType &&
        Array.from(network.peers.values()).find(
          (peer) => c.appData.peerID === peer.peerID && peer.userId === networkObject.ownerId
        )
    )

    // avatar still exists but audio stream does not
    if (!consumer) {
      if (avatarAudioStreams.has(networkObject)) avatarAudioStreams.delete(networkObject)
      continue
    }

    const existingAudioObj = avatarAudioStreams.get(networkObject)

    if (existingAudioObj) {
      // only force positional audio for avatar media streams in XR
      const audioNodes = AudioNodeGroups.get(existingAudioObj)!
      if (audioNodes.panner && !immersiveMedia) removePannerNode(audioNodes)
      else if (!audioNodes.panner && immersiveMedia) addPannerNode(audioNodes, mediaSettings)

      // audio stream exists and has already been handled
      continue
    }

    // get existing stream - need to wait for UserWindowMedia to populate
    const existingAudioObject = document.getElementById(`${peerID}_audio`)! as HTMLAudioElement
    if (!existingAudioObject) continue

    // mute existing stream
    existingAudioObject.muted = true
    // todo, refactor this out of event listener
    existingAudioObject.addEventListener('volumechange', () => {
      audioNodes.gain.gain.setTargetAtTime(existingAudioObject.volume, audioContext.currentTime, 0.01)
    })

    // audio streams exists but has not been handled
    const mediaTrack = consumer.track as MediaStreamTrack
    const stream = new MediaStream([mediaTrack.clone()])

    const audioNodes = createAudioNodeGroup(
      stream,
      audioContext.createMediaStreamSource(stream),
      audioState.gainNodeMixBuses.mediaStreams
    )
    audioNodes.gain.gain.setTargetAtTime(existingAudioObject.volume, audioContext.currentTime, 0.01)

    if (immersiveMedia) addPannerNode(audioNodes, mediaSettings)

    avatarAudioStreams.set(networkObject, stream)
  }

  /**
   * Update avatar volume when the value is changed
   */
  for (const action of setMediaStreamVolumeActionQueue()) {
    for (const entity of networkedAvatarAudioEntities) {
      const networkObject = getComponent(entity, NetworkObjectComponent)
      const audioObj = avatarAudioStreams.get(networkObject)!
      if (!audioObj) continue
      const gain = AudioNodeGroups.get(audioObj)?.gain!
      if (gain) gain.gain.setTargetAtTime(action.value, audioContext.currentTime, 0.01)
    }
  }

  const endTime = audioContext.currentTime + Engine.instance.deltaSeconds

  /**
   * Update panner nodes
   */
  for (const entity of positionalAudioQuery()) {
    const element = getComponent(entity, MediaElementComponent).element
    const { position, rotation } = getComponent(entity, TransformComponent)
    const positionalAudio = getComponent(entity, PositionalAudioComponent)
    const audioObject = AudioNodeGroups.get(element)!
    audioObject.panner && updateAudioPanner(audioObject.panner, position, rotation, endTime, positionalAudio)
  }

  /** @todo, only apply this to closest 8 (configurable) avatars #7261 */

  for (const entity of networkedAvatarAudioEntities) {
    const networkObject = getComponent(entity, NetworkObjectComponent)

    const audioObj = avatarAudioStreams.get(networkObject)!
    if (!audioObj) continue

    const panner = AudioNodeGroups.get(audioObj)?.panner!
    if (!panner) continue

    getAvatarBoneWorldPosition(entity, 'Head', _vec3)
    const { rotation } = getComponent(entity, TransformComponent)

    updateAudioPanner(panner, _vec3, rotation, endTime, mediaSettings)
  }

  /**
   * Update camera listener position
   */
  const { position, rotation } = getComponent(Engine.instance.cameraEntity, TransformComponent)
  if (isNaN(position.x)) return
  _rot.set(0, 0, -1).applyQuaternion(rotation)
  if (isNaN(_rot.x)) return
  audioContext.listener.positionX.linearRampToValueAtTime(position.x, endTime)
  audioContext.listener.positionY.linearRampToValueAtTime(position.y, endTime)
  audioContext.listener.positionZ.linearRampToValueAtTime(position.z, endTime)
  audioContext.listener.forwardX.linearRampToValueAtTime(_rot.x, endTime)
  audioContext.listener.forwardY.linearRampToValueAtTime(_rot.y, endTime)
  audioContext.listener.forwardZ.linearRampToValueAtTime(_rot.z, endTime)

  /** @todo support different world ups */
  // audioContext.listener.upX.linearRampToValueAtTime(camera.up.x, endTime)
  // audioContext.listener.upY.linearRampToValueAtTime(camera.up.y, endTime)
  // audioContext.listener.upZ.linearRampToValueAtTime(camera.up.z, endTime)
}

const PositionalAudioPanner = createQueryReactor(
  [PositionalAudioComponent, TransformComponent],
  function PositionalAudioPannerReactor(props) {
    const entity = useEntityContext()
    const mediaElement = useComponent(entity, MediaElementComponent)
    const positionalAudio = useComponent(entity, PositionalAudioComponent)
    useEffect(() => {
      const audioGroup = AudioNodeGroups.get(mediaElement.element.value)! // is it safe to assume this?
      addPannerNode(audioGroup, positionalAudio.value)
      return () => removePannerNode(audioGroup)
    }, [mediaElement, positionalAudio])
    return null
  }
)

const reactor = () => {
  return <PositionalAudioPanner />
}

export const PositionalAudioSystem = defineSystem({
  uuid: 'ee.engine.PositionalAudioSystem',
  execute,
  reactor
})
