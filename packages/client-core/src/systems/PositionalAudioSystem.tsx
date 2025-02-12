/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/ir-engine/ir-engine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Infinite Reality Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Infinite Reality Engine team.

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2023 
Infinite Reality Engine. All Rights Reserved.
*/

import { Not } from 'bitecs'
import React, { useEffect } from 'react'
import { Vector3 } from 'three'

import { ComponentType, getComponent, useComponent } from '@ir-engine/ecs/src/ComponentFunctions'
import { ECSState } from '@ir-engine/ecs/src/ECSState'
import { useEntityContext } from '@ir-engine/ecs/src/EntityFunctions'
import { QueryReactor, defineQuery } from '@ir-engine/ecs/src/QueryFunctions'
import { defineSystem } from '@ir-engine/ecs/src/SystemFunctions'
import { PresentationSystemGroup } from '@ir-engine/ecs/src/SystemGroups'
import { MediaSettingsState } from '@ir-engine/engine/src/audio/MediaSettingsState'
import { getMutableState, getState, useHookstate } from '@ir-engine/hyperflux'
import { NetworkObjectComponent, NetworkObjectOwnedTag, NetworkState } from '@ir-engine/network'
import { TransformComponent } from '@ir-engine/spatial/src/transform/components/TransformComponent'

import { AudioState } from '@ir-engine/engine/src/audio/AudioState'
import {
  addPannerNode,
  removePannerNode,
  updateAudioPanner
} from '@ir-engine/engine/src/audio/PositionalAudioFunctions'
import { PositionalAudioComponent } from '@ir-engine/engine/src/audio/components/PositionalAudioComponent'
import { AvatarRigComponent } from '@ir-engine/engine/src/avatar/components/AvatarAnimationComponent'
import { AvatarComponent } from '@ir-engine/engine/src/avatar/components/AvatarComponent'
import {
  AudioNodeGroups,
  MediaElementComponent,
  createAudioNodeGroup
} from '@ir-engine/engine/src/scene/components/MediaComponent'
import { EngineState } from '@ir-engine/spatial/src/EngineState'
import { PeerMediaChannelState } from '../media/PeerMediaChannelState'

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

/** Weak map entry is automatically GC'd when network object is removed */
const avatarAudioStreams: WeakMap<ComponentType<typeof NetworkObjectComponent>, MediaStream> = new WeakMap()

const execute = () => {
  const audioState = getState(AudioState)
  const audioContext = audioState.audioContext
  if (!audioContext) return

  const network = NetworkState.mediaNetwork
  const mediaSettings = getState(MediaSettingsState)
  const immersiveMedia = mediaSettings.immersiveMedia

  /**
   * Scene Objects
   */

  /**
   * No need to update pose of positional audio objects if the audio context is not running
   */
  if (audioContext.state !== 'running') return

  const peerMediaState = getState(PeerMediaChannelState)

  /**
   * Avatars
   * lazily detect when consumers are created and destroyed
   */
  const networkedAvatarAudioEntities = networkedAvatarAudioQuery()
  for (const entity of networkedAvatarAudioEntities) {
    if (!network) continue

    const networkObject = getComponent(entity, NetworkObjectComponent)
    const ownerID = networkObject.ownerId
    const peers = Object.values(network.peers).filter((peer) => peer.userId === ownerID)

    const peer = peers.find((peer) => Object.keys(peerMediaState).includes(peer.peerID))
    if (!peer) {
      if (avatarAudioStreams.has(networkObject)) avatarAudioStreams.delete(networkObject)
      continue
    }

    const videoMediaStream = peerMediaState[peer.peerID].cam.videoMediaStream
    if (!videoMediaStream) {
      if (avatarAudioStreams.has(networkObject)) avatarAudioStreams.delete(networkObject)
      continue
    }
    const track = videoMediaStream.getVideoTracks()[0]

    // avatar still exists but audio stream does not
    if (!track) {
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
    /** @todo we need to properly handle this */
    const existingAudioObject = document.getElementById(`${ownerID}_audio`)! as HTMLAudioElement
    if (!existingAudioObject) continue

    // mute existing stream
    existingAudioObject.muted = true
    // todo, refactor this out of event listener
    existingAudioObject.addEventListener('volumechange', () => {
      audioNodes.gain.gain.setTargetAtTime(existingAudioObject.volume, audioContext.currentTime, 0.01)
    })

    // audio streams exists but has not been handled
    const stream = new MediaStream([track.clone()])

    const audioNodes = createAudioNodeGroup(
      stream,
      audioContext.createMediaStreamSource(stream),
      audioState.gainNodeMixBuses.mediaStreams
    )
    audioNodes.gain.gain.setTargetAtTime(existingAudioObject.volume, audioContext.currentTime, 0.01)

    if (immersiveMedia) addPannerNode(audioNodes, mediaSettings)

    avatarAudioStreams.set(networkObject, stream)
  }

  const endTime = audioContext.currentTime + getState(ECSState).deltaSeconds

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

    const panner = AudioNodeGroups.get(audioObj)?.panner
    if (!panner) continue

    TransformComponent.getWorldPosition(getComponent(entity, AvatarRigComponent).bonesToEntities.head, _vec3)

    const { rotation } = getComponent(entity, TransformComponent)

    updateAudioPanner(panner, _vec3, rotation, endTime, mediaSettings)
  }

  const viewerEntity = getState(EngineState).viewerEntity
  if (!viewerEntity) return

  /**
   * Update camera listener position
   */
  const { position, rotation } = getComponent(viewerEntity, TransformComponent)
  if (isNaN(position.x)) return
  _rot.set(0, 0, -1).applyQuaternion(rotation)
  if (isNaN(_rot.x)) return
  // firefox only supports the deprecated API
  if (!audioContext.listener.positionX) {
    audioContext.listener.setPosition(position.x, position.y, position.z)
    audioContext.listener.setOrientation(_rot.x, _rot.y, _rot.z, 0, 1, 0)
    return
  }
  audioContext.listener.positionX.linearRampToValueAtTime(position.x, endTime)
  audioContext.listener.positionY.linearRampToValueAtTime(position.y, endTime)
  audioContext.listener.positionZ.linearRampToValueAtTime(position.z, endTime)
  audioContext.listener.forwardX.linearRampToValueAtTime(_rot.x, endTime)
  audioContext.listener.forwardY.linearRampToValueAtTime(_rot.y, endTime)
  audioContext.listener.forwardZ.linearRampToValueAtTime(_rot.z, endTime)

  /** @todo support different world ups */
  audioContext.listener.upX.linearRampToValueAtTime(0, endTime)
  audioContext.listener.upY.linearRampToValueAtTime(1, endTime)
  audioContext.listener.upZ.linearRampToValueAtTime(0, endTime)
}

function PositionalAudioPannerReactor() {
  const entity = useEntityContext()
  const mediaElement = useComponent(entity, MediaElementComponent)
  const positionalAudio = useComponent(entity, PositionalAudioComponent)

  useEffect(() => {
    const audioGroup = AudioNodeGroups.get(mediaElement.element.value as HTMLMediaElement)! // is it safe to assume this?
    addPannerNode(audioGroup, positionalAudio.value)
    return () => removePannerNode(audioGroup)
  }, [mediaElement, positionalAudio])

  return null
}

const reactor = () => {
  const mediaStreamVolume = useHookstate(getMutableState(AudioState).mediaStreamVolume)

  /**
   * Update avatar volume when the value is changed
   */
  useEffect(() => {
    const audioContext = getState(AudioState).audioContext

    for (const entity of networkedAvatarAudioQuery()) {
      const networkObject = getComponent(entity, NetworkObjectComponent)
      const audioObj = avatarAudioStreams.get(networkObject)!
      if (!audioObj) continue
      const gain = AudioNodeGroups.get(audioObj)?.gain
      if (gain) gain.gain.setTargetAtTime(mediaStreamVolume.value, audioContext.currentTime, 0.01)
    }
  }, [mediaStreamVolume])

  return (
    <QueryReactor
      Components={[PositionalAudioComponent, TransformComponent]}
      ChildEntityReactor={PositionalAudioPannerReactor}
    />
  )
}

export const PositionalAudioSystem = defineSystem({
  uuid: 'ee.engine.PositionalAudioSystem',
  insert: { after: PresentationSystemGroup },
  execute,
  reactor
})
