import { System, SystemAttributes } from '../../ecs/classes/System'
import { registerComponent } from '../../ecs/functions/ComponentFunctions';
import {
  getComponent,
  getMutableComponent,
  hasComponent,
  removeComponent
} from '../../ecs/functions/EntityFunctions';
import { SystemUpdateType } from '../../ecs/functions/SystemUpdateType';
import { PositionalAudioComponent } from '../components/PositionalAudioComponent';
import { CharacterComponent } from '../../templates/character/components/CharacterComponent';
import { AudioLoader, PositionalAudio } from 'three';
import { Engine } from '../../ecs/classes/Engine';
import { TransformComponent } from '../../transform/components/TransformComponent';
import { LocalInputReceiver } from '../../input/components/LocalInputReceiver';
import { MediaStreamComponent } from '../../networking/components/MediaStreamComponent';
import { Network } from '../../networking/components/Network';
import { MediaStreamSystem } from '../../networking/systems/MediaStreamSystem';
import { NetworkObject } from '../../networking/components/NetworkObject';

const SHOULD_CREATE_SILENT_AUDIO_ELS = typeof navigator !== "undefined" && /chrome/i.test(navigator.userAgent);
function createSilentAudioEl(streamsLive) {
  const audioEl = new Audio();
  audioEl.setAttribute("autoplay", "autoplay");
  audioEl.setAttribute("playsinline", "playsinline");
  audioEl.srcObject = streamsLive;
  audioEl.volume = 0; // we don't actually want to hear audio from this element
  return audioEl;
}

export class PositionalAudioSystem extends System {
  public static instance: PositionalAudioSystem = null

  characterAudioStream = new Map();

  constructor(attributes?: SystemAttributes) {
    super(attributes);
    PositionalAudioSystem.instance = this;
  }

  execute(): void {
    for (const entity of this.queryResults.audio.added) {
      const positionalAudio = getMutableComponent(entity, PositionalAudioComponent);
      if (positionalAudio != null) positionalAudio.value = new PositionalAudio(Engine.audioListener);
    }

    for (const entity of this.queryResults.audio.removed) {
      const positionalAudio = getComponent(entity, PositionalAudioComponent, true);
      if (positionalAudio != null) positionalAudio.value?.disconnect();
    }

    for (const entity of this.queryResults.character_audio.changed) {
      const entityNetworkObject = getComponent(entity, NetworkObject);
      const peerId = entityNetworkObject.ownerId;
      const consumer = MediaStreamComponent.instance.consumers
          .find((c: any) => c.appData.peerId === peerId && c.appData.mediaTag === 'cam-audio');
      if (consumer == null && this.characterAudioStream.get(entity) != null) {
        this.characterAudioStream.delete(entity);
      }
    }

    for (const entity of this.queryResults.character_audio.all) {
      if (hasComponent(entity, LocalInputReceiver)) {
        continue;
      }

      const entityNetworkObject = getComponent(entity, NetworkObject);
      const peerId = entityNetworkObject.ownerId;
      const consumer = MediaStreamComponent.instance.consumers
          .find((c: any) => c.appData.peerId === peerId && c.appData.mediaTag === 'cam-audio');

      if (this.characterAudioStream.has(entity) && consumer != null && consumer.id === this.characterAudioStream.get(entity).id) {
        continue;
      }

      if (!consumer) {
        continue;
      }

      const consumerLive = consumer.track;
      this.characterAudioStream.set(entity, consumerLive);
      const positionalAudio = getComponent(entity, PositionalAudioComponent);
      const streamsLive = new MediaStream([consumerLive.clone()]);

      if (SHOULD_CREATE_SILENT_AUDIO_ELS) {
        createSilentAudioEl(streamsLive); // TODO: Do the audio els need to get cleaned up?
      }
      
      const audioStreamSource = positionalAudio.value.context.createMediaStreamSource(streamsLive);
      if (positionalAudio.value.context.state === 'suspended') positionalAudio.value.context.resume();

      positionalAudio.value.setNodeSource(audioStreamSource as unknown as AudioBufferSourceNode);
    }
    for (const entity of this.queryResults.character_audio.removed) {
      this.characterAudioStream.delete(entity);
    }

    for (const entity of this.queryResults.positional_audio.added) {
      const positionalAudio = getComponent(entity, PositionalAudioComponent);

      Engine.scene.add(positionalAudio.value);
    }

    for (const entity of this.queryResults.positional_audio.changed) {
      const positionalAudio = getComponent(entity, PositionalAudioComponent);
      const transform = getComponent(entity, TransformComponent);

      if (positionalAudio != null) {
        positionalAudio.value?.position.copy(transform.position);
        positionalAudio.value?.rotation.setFromQuaternion(transform.rotation);
      }
    }

    for (const entity of this.queryResults.positional_audio.removed) {
      const positionalAudio = getComponent(entity, PositionalAudioComponent, true);

      if (positionalAudio != null) Engine.scene.remove(positionalAudio.value);
    }
  }

  suspend(): void {
    for (const entity of this.queryResults.character_audio.all) {
      const positionalAudio = getComponent(entity, PositionalAudioComponent);
      positionalAudio.value.context.suspend();
    }
  }
  resume(): void {
    for (const entity of this.queryResults.character_audio.all) {
      const positionalAudio = getComponent(entity, PositionalAudioComponent);
      positionalAudio.value.context.resume();
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
  character_audio: {
    components: [PositionalAudioComponent, CharacterComponent],
    listen: {
      added: true,
      changed: true,
      removed: true,
    }
  },
  audio: {
    components: [PositionalAudioComponent],
    listen: {
      added: true,
      removed: true,
    }
  }
};
