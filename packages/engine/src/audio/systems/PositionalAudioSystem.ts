import { Audio as AudioObject } from 'three'
import { AvatarComponent } from '../../avatar/components/AvatarComponent'
import { Engine } from '../../ecs/classes/Engine'
import { LocalInputTagComponent } from '../../input/components/LocalInputTagComponent'
import { NetworkObjectComponent } from '../../networking/components/NetworkObjectComponent'
import { EngineEvents } from '../../ecs/classes/EngineEvents'
import { Entity } from '../../ecs/classes/Entity'
import { defineQuery, getComponent, hasComponent } from '../../ecs/functions/ComponentFunctions'
import { MediaStreams } from '../../networking/systems/MediaStreamSystem'
import {
  PositionalAudioSettingsComponent,
  PositionalAudioSettingsComponentType
} from '../../scene/components/AudioSettingsComponent'
import { AudioTagComponent } from '../components/AudioTagComponent'
import { AudioComponentType } from '../components/AudioComponent'
import { System } from '../../ecs/classes/System'
import { World } from '../../ecs/classes/World'
import { EngineActionType } from '../../ecs/classes/EngineService'
import { Object3DComponent } from '../../scene/components/Object3DComponent'
import {
  deserializeAudio,
  SCENE_COMPONENT_AUDIO,
  SCENE_COMPONENT_AUDIO_DEFAULT_VALUES
} from '../../scene/functions/loaders/AudioFunctions'
import { AudioType } from '../constants/AudioConstants'
import { parseProperties } from '../../common/functions/deserializers'

const SHOULD_CREATE_SILENT_AUDIO_ELS = typeof navigator !== 'undefined' && /chrome/i.test(navigator.userAgent)
function createSilentAudioEl(streamsLive) {
  const audioEl = new Audio()
  audioEl.setAttribute('autoplay', 'autoplay')
  audioEl.setAttribute('playsinline', 'playsinline')
  audioEl.srcObject = streamsLive
  audioEl.volume = 0 // we don't actually want to hear audio from this element
  return audioEl
}

/** System class which provides methods for Positional Audio system. */

export default async function PositionalAudioSystem(world: World): Promise<System> {
  const avatarAudioQuery = defineQuery([AudioTagComponent, AvatarComponent])
  const audioQuery = defineQuery([AudioTagComponent])
  const settingsQuery = defineQuery([PositionalAudioSettingsComponent])

  const avatarAudioStream: Map<Entity, any> = new Map()

  let audioContextSuspended = true
  let startSuspendedContexts = false
  let suspendPositionalAudio = false
  Engine.currentWorld.receptors.push((action: EngineActionType) => {
    switch (action.type) {
      case EngineEvents.EVENTS.START_SUSPENDED_CONTEXTS:
        startSuspendedContexts = true
        audioContextSuspended = false
        console.log('starting suspended audio nodes')
        break
      case EngineEvents.EVENTS.SUSPEND_POSITIONAL_AUDIO:
        suspendPositionalAudio = true
        break
    }
  })

  let positionalAudioSettings: PositionalAudioSettingsComponentType

  const applyMediaAudioSettings = (props: AudioComponentType, setVolume = true): AudioComponentType => {
    props.audioType = positionalAudioSettings.usePositionalAudio ? AudioType.Positional : AudioType.Stereo
    props.distanceModel = positionalAudioSettings.mediaDistanceModel
    props.maxDistance = positionalAudioSettings.mediaMaxDistance
    props.refDistance = positionalAudioSettings.mediaRefDistance
    props.rolloffFactor = positionalAudioSettings.mediaRolloffFactor
    if (setVolume) props.volume = positionalAudioSettings.mediaVolume

    return props
  }

  return () => {
    if (startSuspendedContexts) {
      for (const entity of avatarAudioQuery()) {
        const audio = getComponent(entity, Object3DComponent).value
        const audioEl = audio?.userData.audioEl
        if (audioEl && audioEl.context?.state === 'suspended') audioEl.context.resume()
      }
      startSuspendedContexts = false
    }

    if (suspendPositionalAudio) {
      for (const entity of avatarAudioQuery()) {
        const audio = getComponent(entity, Object3DComponent).value
        const audioEl = audio?.userData.audioEl
        if (audioEl && audioEl.context) audioEl.context.suspend()
      }
      suspendPositionalAudio = false
    }

    for (const entity of settingsQuery.enter()) {
      positionalAudioSettings = getComponent(entity, PositionalAudioSettingsComponent)
    }

    for (const entity of audioQuery.exit()) {
      const obj3d = getComponent(entity, Object3DComponent, true)
      if (obj3d && obj3d.value.userData.audioEl) obj3d.value.userData.audioEl.disconnect()
    }

    for (const entity of avatarAudioQuery.enter()) {
      const entityNetworkObject = getComponent(entity, NetworkObjectComponent)
      if (entityNetworkObject) {
        const peerId = entityNetworkObject.ownerId
        const consumer = MediaStreams.instance?.consumers.find(
          (c: any) => c.appData.peerId === peerId && c.appData.mediaTag === 'cam-audio'
        )
        if (consumer == null && avatarAudioStream.get(entity) != null) {
          avatarAudioStream.delete(entity)
        }
      }

      const props = applyMediaAudioSettings(SCENE_COMPONENT_AUDIO_DEFAULT_VALUES)
      deserializeAudio(entity, { name: SCENE_COMPONENT_AUDIO, props })
    }

    for (const entity of avatarAudioQuery.exit()) {
      avatarAudioStream.delete(entity)
    }

    for (const entity of avatarAudioQuery()) {
      if (hasComponent(entity, LocalInputTagComponent)) continue

      const entityNetworkObject = getComponent(entity, NetworkObjectComponent)
      let consumer
      if (entityNetworkObject != null) {
        const peerId = entityNetworkObject.ownerId
        consumer = MediaStreams.instance?.consumers.find(
          (c: any) => c.appData.peerId === peerId && c.appData.mediaTag === 'cam-audio'
        )
      }

      if (!consumer) continue
      if (avatarAudioStream.has(entity) && consumer.id === avatarAudioStream.get(entity).id) continue

      const consumerLive = consumer.track
      avatarAudioStream.set(entity, consumerLive)
      const streamsLive = new MediaStream([consumerLive.clone()])

      if (SHOULD_CREATE_SILENT_AUDIO_ELS) {
        createSilentAudioEl(streamsLive) // TODO: Do the audio els need to get cleaned up?
      }

      const avatarAudio = getComponent(entity, Object3DComponent)?.value

      if (avatarAudio) {
        const audioEl = avatarAudio.userData.audioEl as AudioObject
        const audioStreamSource = audioEl.context.createMediaStreamSource(streamsLive)
        if (audioEl.context.state === 'suspended') audioEl.context.resume()

        audioEl.setNodeSource(audioStreamSource as unknown as AudioBufferSourceNode)
      }
    }
  }
}
