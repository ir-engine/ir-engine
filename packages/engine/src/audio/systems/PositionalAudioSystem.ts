import { PositionalAudio } from 'three'
import { AvatarComponent } from '../../avatar/components/AvatarComponent'
import { Engine } from '../../ecs/classes/Engine'
import { LocalInputReceiverComponent } from '../../input/components/LocalInputReceiverComponent'
import { NetworkObjectComponent } from '../../networking/components/NetworkObjectComponent'
import { EngineEvents } from '../../ecs/classes/EngineEvents'
import { Entity } from '../../ecs/classes/Entity'
import { getComponent, hasComponent } from '../../ecs/functions/EntityFunctions'
import { MediaStreams } from '../../networking/systems/MediaStreamSystem'
import { PositionalAudioSettingsComponent } from '../../scene/components/AudioSettingsComponent'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { PositionalAudioComponent } from '../components/PositionalAudioComponent'
import { defineQuery, defineSystem, enterQuery, exitQuery, System } from 'bitecs'
import { ECSWorld } from '../../ecs/classes/World'

const SHOULD_CREATE_SILENT_AUDIO_ELS = typeof navigator !== 'undefined' && /chrome/i.test(navigator.userAgent)
function createSilentAudioEl(streamsLive) {
  const audioEl = new Audio()
  audioEl.setAttribute('autoplay', 'autoplay')
  audioEl.setAttribute('playsinline', 'playsinline')
  audioEl.srcObject = streamsLive
  audioEl.volume = 0 // we don't actually want to hear audio from this element
  return audioEl
}

export const applyMediaAudioSettings = (positionalAudio, positionalAudioSettings, setVolume = true) => {
  if (positionalAudioSettings.overrideAudioSettings == false) {
    return
  }
  positionalAudio.setDistanceModel(positionalAudioSettings.mediaDistanceModel)
  positionalAudio.setMaxDistance(positionalAudioSettings.mediaMaxDistance)
  positionalAudio.setRefDistance(positionalAudioSettings.mediaRefDistance)
  positionalAudio.setRolloffFactor(positionalAudioSettings.mediaRolloffFactor)
  if (setVolume) positionalAudio.setVolume(positionalAudioSettings.mediaVolume)
}

/** System class which provides methods for Positional Audio system. */

export const PositionalAudioSystem = async (): Promise<System> => {

  const positionalAudioQuery = defineQuery([PositionalAudioComponent, TransformComponent])
  const positionalAudioAddQuery = enterQuery(positionalAudioQuery)
  const positionalAudioRemoveQuery = exitQuery(positionalAudioQuery)

  const avatarAudioQuery = defineQuery([PositionalAudioComponent, AvatarComponent])
  const avatarAudioAddQuery = enterQuery(avatarAudioQuery)
  const avatarAudioRemoveQuery = exitQuery(avatarAudioQuery)

  const audioQuery = defineQuery([PositionalAudioComponent])
  const audioAddQuery = enterQuery(audioQuery)
  const audioRemoveQuery = exitQuery(audioQuery)

  const settingsQuery = defineQuery([PositionalAudioSettingsComponent])
  const settingsAddQuery = enterQuery(settingsQuery)

  let settingsEntity: Entity
  const avatarAudioStream: Map<Entity, any> = new Map()

  Engine.useAudioSystem = true
  Engine.spatialAudio = true

  let startSuspendedContexts = false

  EngineEvents.instance.once(EngineEvents.EVENTS.START_SUSPENDED_CONTEXTS, () => {
    startSuspendedContexts = true
  })

  return defineSystem((world: ECSWorld) => {

    if(startSuspendedContexts) {
      for (const entity of positionalAudioQuery(world)) {
        const positionalAudio = getComponent(entity, PositionalAudioComponent)
        if (positionalAudio?.value?.context?.state === 'suspended') positionalAudio.value.context.resume()
      }
    }

    for(const entity of settingsAddQuery(world)) {
      settingsEntity = entity
    }

    for (const entity of audioAddQuery(world)) {
      const positionalAudio = getComponent(entity, PositionalAudioComponent)
      if (positionalAudio != null) positionalAudio.value = new PositionalAudio(Engine.audioListener)
    }

    for (const entity of audioRemoveQuery(world)) {
      const positionalAudio = getComponent(entity, PositionalAudioComponent, true)
      if (positionalAudio?.value?.source) positionalAudio.value.disconnect()
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

      if (
        avatarAudioStream.has(entity) &&
        consumer != null &&
        consumer.id === avatarAudioStream.get(entity).id
      ) {
        continue
      }

      if (!consumer) {
        continue
      }

      const consumerLive = consumer.track
      avatarAudioStream.set(entity, consumerLive)
      const positionalAudio = getComponent(entity, PositionalAudioComponent)
      const streamsLive = new MediaStream([consumerLive.clone()])

      if (SHOULD_CREATE_SILENT_AUDIO_ELS) {
        createSilentAudioEl(streamsLive) // TODO: Do the audio els need to get cleaned up?
      }

      const audioStreamSource = positionalAudio.value.context.createMediaStreamSource(streamsLive)
      if (positionalAudio.value.context.state === 'suspended') positionalAudio.value.context.resume()

      positionalAudio.value.setNodeSource(audioStreamSource as unknown as AudioBufferSourceNode)
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
      const positionalAudio = getComponent(entity, PositionalAudioComponent)
      const settings = getComponent(settingsEntity, PositionalAudioSettingsComponent)
      applyMediaAudioSettings(positionalAudio.value, settings, false)
      if (positionalAudio != null) Engine.scene.add(positionalAudio.value)
    }

    for (const entity of avatarAudioRemoveQuery(world)) {
      avatarAudioStream.delete(entity)
    }

    for (const entity of positionalAudioAddQuery(world)) {
      const positionalAudio = getComponent(entity, PositionalAudioComponent)
      const settings = getComponent(settingsEntity, PositionalAudioSettingsComponent)
      applyMediaAudioSettings(positionalAudio.value, settings)
      if (positionalAudio != null) Engine.scene.add(positionalAudio.value)
    }

    for (const entity of positionalAudioQuery(world)) {
      const positionalAudio = getComponent(entity, PositionalAudioComponent)
      const transform = getComponent(entity, TransformComponent)

      positionalAudio.value?.position.copy(transform.position)
      positionalAudio.value?.rotation.setFromQuaternion(transform.rotation)
    }

    for (const entity of positionalAudioRemoveQuery(world)) {
      const positionalAudio = getComponent(entity, PositionalAudioComponent, true)
      if (positionalAudio != null) Engine.scene.remove(positionalAudio.value)
    }

    return world
  })
}
