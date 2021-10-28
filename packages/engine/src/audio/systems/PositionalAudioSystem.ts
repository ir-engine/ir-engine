import { PositionalAudio, Audio as AudioObject } from 'three'
import { AvatarComponent } from '../../avatar/components/AvatarComponent'
import { Engine } from '../../ecs/classes/Engine'
import { LocalInputTagComponent } from '../../input/components/LocalInputTagComponent'
import { NetworkObjectComponent } from '../../networking/components/NetworkObjectComponent'
import { EngineEvents } from '../../ecs/classes/EngineEvents'
import { Entity } from '../../ecs/classes/Entity'
import { addComponent, defineQuery, getComponent, hasComponent } from '../../ecs/functions/ComponentFunctions'
import { MediaStreams } from '../../networking/systems/MediaStreamSystem'
import { AudioSettingsData, AudioSettingsComponent } from '../../scene/components/AudioSettingsComponent'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { PositionalAudioComponent } from '../components/PositionalAudioComponent'
import { AudioTagComponent } from '../components/AudioTagComponent'
import { AudioComponent } from '../components/AudioComponent'
import { System } from '../../ecs/classes/System'
import { World } from '../../ecs/classes/World'

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
  const positionalAudioQuery = defineQuery([PositionalAudioComponent, TransformComponent])
  const avatarAudioQuery = defineQuery([AudioTagComponent, AvatarComponent])
  const audioQuery = defineQuery([AudioTagComponent])
  const globalAudioSettingQuery = defineQuery([AudioSettingsComponent])

  const avatarAudioStream: Map<Entity, any> = new Map()

  Engine.useAudioSystem = true
  Engine.spatialAudio = true

  let audioContextSuspended = true
  let startSuspendedContexts = false
  let suspendPositionalAudio = false
  let audioSettingsComponent: AudioSettingsData

  EngineEvents.instance.addEventListener(EngineEvents.EVENTS.START_SUSPENDED_CONTEXTS, () => {
    startSuspendedContexts = true
    audioContextSuspended = false
    console.log('starting suspended audio nodes')
  })

  EngineEvents.instance.addEventListener(EngineEvents.EVENTS.SUSPEND_POSITIONAL_AUDIO, () => {
    suspendPositionalAudio = true
  })

  return () => {
    for (const entity of globalAudioSettingQuery()) {
      audioSettingsComponent = getComponent(entity, AudioSettingsComponent)
    }

    if (startSuspendedContexts) {
      for (const entity of avatarAudioQuery()) {
        const audio = audioSettingsComponent?.usePositionalAudio
          ? getComponent(entity, PositionalAudioComponent)
          : getComponent(entity, AudioComponent)
        if (audio?.value?.context?.state === 'suspended') audio.value.context.resume()
      }
      startSuspendedContexts = false
    }

    if (suspendPositionalAudio) {
      for (const entity of avatarAudioQuery()) {
        const audio = audioSettingsComponent?.usePositionalAudio
          ? getComponent(entity, PositionalAudioComponent)
          : getComponent(entity, AudioComponent)
        audio.value.context.suspend()
      }
      suspendPositionalAudio = false
    }

    for (const entity of audioQuery.exit()) {
      const positionalAudio = getComponent(entity, PositionalAudioComponent) ?? getComponent(entity, AudioComponent)
      if (positionalAudio?.value?.source) positionalAudio.value.disconnect()
    }

    for (const entity of avatarAudioQuery.enter()) {
      const entityNetworkObject = getComponent(entity, NetworkObjectComponent)
      if (entityNetworkObject) {
        const peerId = entityNetworkObject.uniqueId
        const consumer = MediaStreams.instance?.consumers.find(
          (c: any) => c.appData.peerId === peerId && c.appData.mediaTag === 'cam-audio'
        )
        if (consumer == null && avatarAudioStream.get(entity) != null) {
          avatarAudioStream.delete(entity)
        }
      }
      if (audioSettingsComponent?.usePositionalAudio) {
        const positionalAudio = addComponent(entity, PositionalAudioComponent, {
          value: new PositionalAudio(Engine.audioListener)
        })
        positionalAudio.value.matrixAutoUpdate = false
        positionalAudio.value.setDistanceModel(audioSettingsComponent.mediaDistanceModel)
        positionalAudio.value.setMaxDistance(audioSettingsComponent.mediaMaxDistance)
        positionalAudio.value.setRefDistance(audioSettingsComponent.mediaRefDistance)
        positionalAudio.value.setRolloffFactor(audioSettingsComponent.mediaRolloffFactor)
        positionalAudio.value.setVolume(audioSettingsComponent.mediaVolume)
        Engine.scene.add(positionalAudio.value)
      } else {
        const audio = addComponent(entity, AudioComponent, { value: new AudioObject<GainNode>(Engine.audioListener) })
        if (audio != null) Engine.scene.add(audio.value)
        audio.value.matrixAutoUpdate = false
      }
    }

    for (const entity of avatarAudioQuery.exit()) {
      avatarAudioStream.delete(entity)

      const positionalAudio = getComponent(entity, PositionalAudioComponent)
      if (positionalAudio != null) Engine.scene.remove(positionalAudio.value)

      const audio = getComponent(entity, AudioComponent)
      if (audio != null) Engine.scene.remove(audio.value)
    }

    for (const entity of positionalAudioQuery()) {
      const positionalAudio = getComponent(entity, PositionalAudioComponent)
      const transform = getComponent(entity, TransformComponent)

      positionalAudio.value?.position.copy(transform.position)
      positionalAudio.value?.rotation.setFromQuaternion(transform.rotation)

      if (!audioContextSuspended) {
        positionalAudio.value.updateMatrix()
      }
    }

    for (const entity of avatarAudioQuery()) {
      if (hasComponent(entity, LocalInputTagComponent)) {
        continue
      }
      const entityNetworkObject = getComponent(entity, NetworkObjectComponent)
      let consumer
      if (entityNetworkObject != null) {
        const peerId = entityNetworkObject.uniqueId
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
  }
}
