import { PositionalAudio, Audio as AudioObject } from 'three'
import { AvatarComponent } from '../../avatar/components/AvatarComponent'
import { Engine } from '../../ecs/classes/Engine'
import { LocalInputReceiverComponent } from '../../input/components/LocalInputReceiverComponent'
import { NetworkObjectComponent } from '../../networking/components/NetworkObjectComponent'
import { EngineEvents } from '../../ecs/classes/EngineEvents'
import { Entity } from '../../ecs/classes/Entity'
import { addComponent, getComponent, hasComponent } from '../../ecs/functions/EntityFunctions'
import { MediaStreams } from '../../networking/systems/MediaStreamSystem'
import {
  PositionalAudioSettingsComponent,
  PositionalAudioSettingsComponentType
} from '../../scene/components/AudioSettingsComponent'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { PositionalAudioComponent } from '../components/PositionalAudioComponent'
import { defineQuery, defineSystem, enterQuery, exitQuery, System } from '../../ecs/bitecs'
import { ECSWorld } from '../../ecs/classes/World'
import { AudioTagComponent } from '../components/AudioTagComponent'
import { AudioComponent } from '../components/AudioComponent'

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

export const PositionalAudioSystem = async (): Promise<System> => {
  const positionalAudioQuery = defineQuery([PositionalAudioComponent, TransformComponent])

  const avatarAudioQuery = defineQuery([AudioTagComponent, AvatarComponent])
  const avatarAudioAddQuery = enterQuery(avatarAudioQuery)
  const avatarAudioRemoveQuery = exitQuery(avatarAudioQuery)

  const avatarQuery = defineQuery([AvatarComponent])
  const avatarAddQuery = enterQuery(avatarQuery)
  const avatarRemoveQuery = exitQuery(avatarQuery)

  const audioQuery = defineQuery([AudioTagComponent])
  const audioAddQuery = enterQuery(audioQuery)
  const audioRemoveQuery = exitQuery(audioQuery)

  const settingsQuery = defineQuery([PositionalAudioSettingsComponent])
  const settingsAddQuery = enterQuery(settingsQuery)

  const avatarAudioStream: Map<Entity, any> = new Map()

  Engine.useAudioSystem = true
  Engine.spatialAudio = true

  let startSuspendedContexts = false
  let suspendPositionalAudio = false

  EngineEvents.instance.addEventListener(EngineEvents.EVENTS.START_SUSPENDED_CONTEXTS, () => {
    startSuspendedContexts = true
  })

  EngineEvents.instance.addEventListener(EngineEvents.EVENTS.SUSPEND_POSITIONAL_AUDIO, () => {
    suspendPositionalAudio = true
  })

  let positionalAudioSettings: ReturnType<typeof PositionalAudioSettingsComponent.get>

  const applyMediaAudioSettings = (positionalAudio, setVolume = true) => {
    if (positionalAudioSettings.usePositionalAudio == false) {
      return
    }
    positionalAudio.setDistanceModel(positionalAudioSettings.mediaDistanceModel)
    positionalAudio.setMaxDistance(positionalAudioSettings.mediaMaxDistance)
    positionalAudio.setRefDistance(positionalAudioSettings.mediaRefDistance)
    positionalAudio.setRolloffFactor(positionalAudioSettings.mediaRolloffFactor)
    if (setVolume) positionalAudio.setVolume(positionalAudioSettings.mediaVolume)
  }

  return defineSystem((world: ECSWorld) => {
    if (startSuspendedContexts) {
      for (const entity of avatarAudioQuery(world)) {
        const audio = positionalAudioSettings?.usePositionalAudio
          ? getComponent(entity, PositionalAudioComponent, true)
          : getComponent(entity, AudioComponent, true)
        if (audio?.value?.context?.state === 'suspended') audio.value.context.resume()
      }
      startSuspendedContexts = false
    }

    if (suspendPositionalAudio) {
      for (const entity of avatarAudioQuery(world)) {
        const audio = positionalAudioSettings?.usePositionalAudio
          ? getComponent(entity, PositionalAudioComponent, true)
          : getComponent(entity, AudioComponent, true)
        audio.value.context.suspend()
      }
      suspendPositionalAudio = false
    }

    for (const entity of settingsAddQuery(world)) {
      positionalAudioSettings = getComponent(entity, PositionalAudioSettingsComponent)
    }

    for (const entity of audioRemoveQuery(world)) {
      const positionalAudio =
        getComponent(entity, PositionalAudioComponent, true) ?? getComponent(entity, AudioComponent, true)
      if (positionalAudio?.value?.source) positionalAudio.value.disconnect()
    }

    for (const entity of avatarAudioAddQuery(world)) {
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
      if (positionalAudioSettings?.usePositionalAudio) {
        const positionalAudio = addComponent(entity, PositionalAudioComponent, {
          value: new PositionalAudio(Engine.audioListener)
        })
        applyMediaAudioSettings(positionalAudio.value)
        if (positionalAudio != null) Engine.scene.add(positionalAudio.value)
      } else {
        const audio = addComponent(entity, AudioComponent, { value: new AudioObject<GainNode>(Engine.audioListener) })
        if (audio != null) Engine.scene.add(audio.value)
      }
    }

    for (const entity of avatarAudioQuery(world)) {
      if (hasComponent(entity, LocalInputReceiverComponent)) {
        continue
      }
      const entityNetworkObject = getComponent(entity, NetworkObjectComponent)
      let consumer
      if (entityNetworkObject != null) {
        const peerId = entityNetworkObject.ownerId
        consumer = MediaStreams.instance?.consumers.find(
          (c: any) => c.appData.peerId === peerId && c.appData.mediaTag === 'cam-audio'
        )
      }

      if (avatarAudioStream.has(entity) && consumer != null && consumer.id === avatarAudioStream.get(entity).id) {
        continue
      }

      if (!consumer) {
        continue
      }

      const consumerLive = consumer.track
      avatarAudioStream.set(entity, consumerLive)
      const avatarAudio = getComponent(entity, PositionalAudioComponent) ?? getComponent(entity, AudioComponent)
      const streamsLive = new MediaStream([consumerLive.clone()])

      if (SHOULD_CREATE_SILENT_AUDIO_ELS) {
        createSilentAudioEl(streamsLive) // TODO: Do the audio els need to get cleaned up?
      }

      const audioStreamSource = avatarAudio.value.context.createMediaStreamSource(streamsLive)
      if (avatarAudio.value.context.state === 'suspended') avatarAudio.value.context.resume()

      avatarAudio.value.setNodeSource(audioStreamSource as unknown as AudioBufferSourceNode)
    }

    for (const entity of avatarAudioRemoveQuery(world)) {
      avatarAudioStream.delete(entity)

      const positionalAudio = getComponent(entity, PositionalAudioComponent, true)
      if (positionalAudio != null) Engine.scene.remove(positionalAudio.value)

      const audio = getComponent(entity, AudioComponent, true)
      if (audio != null) Engine.scene.remove(audio.value)
    }

    for (const entity of positionalAudioQuery(world)) {
      const positionalAudio = getComponent(entity, PositionalAudioComponent)
      const transform = getComponent(entity, TransformComponent)

      positionalAudio.value?.position.copy(transform.position)
      positionalAudio.value?.rotation.setFromQuaternion(transform.rotation)
    }

    return world
  })
}
