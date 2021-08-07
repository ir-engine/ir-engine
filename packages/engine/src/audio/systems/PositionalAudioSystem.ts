import { Engine } from '../../ecs/classes/Engine'
import { System } from '../../ecs/classes/System'
import { getComponent, getMutableComponent, hasComponent } from '../../ecs/functions/EntityFunctions'
import { LocalInputReceiver } from '../../input/components/LocalInputReceiver'
import { NetworkObject } from '../../networking/components/NetworkObject'
import { MediaStreams } from '../../networking/systems/MediaStreamSystem'
import { AvatarComponent } from '../../avatar/components/AvatarComponent'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { PositionalAudioComponent } from '../components/PositionalAudioComponent'
import { Entity } from '../../ecs/classes/Entity'
import { PositionalAudio } from 'three'
import { applyAvatarAudioSettings, applyMediaAudioSettings } from '../../scene/behaviors/handleAudioSettings'

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
export class PositionalAudioSystem extends System {
  avatarAudioStream: Map<Entity, any>

  /** Constructs Positional Audio System. */
  constructor() {
    super()
    Engine.useAudioSystem = true
    Engine.spatialAudio = true
    this.reset()
  }

  reset(): void {
    this.avatarAudioStream = new Map<Entity, any>()
  }

  dispose(): void {
    super.dispose()
    this.reset()
  }

  /** Execute the positional audio system for different events of queries. */
  execute(): void {
    for (const entity of this.queryResults.audio.added) {
      const positionalAudio = getMutableComponent(entity, PositionalAudioComponent)
      if (positionalAudio != null) positionalAudio.value = new PositionalAudio(Engine.audioListener)
    }

    for (const entity of this.queryResults.audio.removed) {
      const positionalAudio = getComponent(entity, PositionalAudioComponent, true)
      if (positionalAudio?.value != null && positionalAudio.value.source) positionalAudio.value.disconnect()
    }

    for (const entity of this.queryResults.avatar_audio.changed) {
      const entityNetworkObject = getComponent(entity, NetworkObject)
      if (entityNetworkObject) {
        const peerId = entityNetworkObject.ownerId
        const consumer = MediaStreams.instance?.consumers.find(
          (c: any) => c.appData.peerId === peerId && c.appData.mediaTag === 'cam-audio'
        )
        if (consumer == null && this.avatarAudioStream.get(entity) != null) {
          this.avatarAudioStream.delete(entity)
        }
      }
    }

    for (const entity of this.queryResults.avatar_audio.all) {
      if (hasComponent(entity, LocalInputReceiver)) {
        continue
      }
      const entityNetworkObject = getComponent(entity, NetworkObject)
      let consumer
      if (entityNetworkObject != null) {
        const peerId = entityNetworkObject.ownerId
        consumer = MediaStreams.instance?.consumers.find(
          (c: any) => c.appData.peerId === peerId && c.appData.mediaTag === 'cam-audio'
        )
      }

      if (
        this.avatarAudioStream.has(entity) &&
        consumer != null &&
        consumer.id === this.avatarAudioStream.get(entity).id
      ) {
        continue
      }

      if (!consumer) {
        continue
      }

      const consumerLive = consumer.track
      this.avatarAudioStream.set(entity, consumerLive)
      const positionalAudio = getComponent(entity, PositionalAudioComponent)
      const streamsLive = new MediaStream([consumerLive.clone()])

      if (SHOULD_CREATE_SILENT_AUDIO_ELS) {
        createSilentAudioEl(streamsLive) // TODO: Do the audio els need to get cleaned up?
      }

      const audioStreamSource = positionalAudio.value.context.createMediaStreamSource(streamsLive)
      if (positionalAudio.value.context.state === 'suspended') positionalAudio.value.context.resume()

      positionalAudio.value.setNodeSource(audioStreamSource as unknown as AudioBufferSourceNode)
    }

    for (const entity of this.queryResults.avatar_audio.added) {
      const positionalAudio = getComponent(entity, PositionalAudioComponent)
      applyAvatarAudioSettings(positionalAudio.value)
      if (positionalAudio != null) Engine.scene.add(positionalAudio.value)
    }

    for (const entity of this.queryResults.avatar_audio.removed) {
      this.avatarAudioStream.delete(entity)
    }

    for (const entity of this.queryResults.positional_audio.added) {
      const positionalAudio = getComponent(entity, PositionalAudioComponent)
      applyMediaAudioSettings(positionalAudio.value)
      if (positionalAudio != null) Engine.scene.add(positionalAudio.value)
    }

    for (const entity of this.queryResults.positional_audio.changed) {
      const positionalAudio = getComponent(entity, PositionalAudioComponent)
      const transform = getComponent(entity, TransformComponent)

      if (positionalAudio != null) {
        positionalAudio.value?.position.copy(transform.position)
        positionalAudio.value?.rotation.setFromQuaternion(transform.rotation)
      }
    }

    for (const entity of this.queryResults.positional_audio.removed) {
      const positionalAudio = getComponent(entity, PositionalAudioComponent, true)
      if (positionalAudio != null) Engine.scene.remove(positionalAudio.value)
    }
  }
}

PositionalAudioSystem.queries = {
  positional_audio: {
    components: [PositionalAudioComponent, TransformComponent],
    listen: {
      added: true,
      changed: true,
      removed: true
    }
  },
  avatar_audio: {
    components: [PositionalAudioComponent, AvatarComponent],
    listen: {
      added: true,
      changed: true,
      removed: true
    }
  },
  audio: {
    components: [PositionalAudioComponent],
    listen: {
      added: true,
      removed: true
    }
  }
}
