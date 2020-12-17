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

// let networkTransport: any;

// export function setPartyId(partyId: string): void {
//   networkTransport = Network.instance.transport as any;
//   networkTransport.partyId = partyId;
// }

export class PositionalAudioSystem extends System {
  // updateType = SystemUpdateType.Fixed;
  characterAudioStream = new Map();

  constructor(attributes?: SystemAttributes) {
    super(attributes);
  }

  //   const newTransport = partyId === 'instance' ? networkTransport.instanceSendTransport : networkTransport.partySendTransport;
  //   MediaStreamComponent.instance.camAudioProducer = await this.newTransport.produce({
  //     track: MediaStreamComponent.instance.mediaStream.getAudioTracks()[0],
  //     appData: { mediaTag: "cam-audio", partyId: partyId }
  // });

  execute(): void {
    

    for (const entity of this.queryResults.audio_stream.all) {
      const consumer = MediaStreamComponent.instance.consumers.find
        ((c: any) => c.appData.mediaTag === 'cam-audio');

      if (consumer) {
        let consumerLive = consumer?.track;

        if (this.characterAudioStream.has(consumerLive)) {
          consumerLive = this.characterAudioStream.get(consumerLive);
        } else {
          this.characterAudioStream.set("consumersStream", consumerLive);
        }

        const positionalAudio = getMutableComponent(entity, PositionalAudioComponent);
        positionalAudio.value = new PositionalAudio(Engine.audioListener);

        if (!hasComponent(entity, LocalInputReceiver)) {
               
          // console.warn("MediaStreamLIVE", this.characterAudioStream);

          const positionalAudio = getMutableComponent(entity, PositionalAudioComponent);
          positionalAudio.value = new PositionalAudio(Engine.audioListener);

          for(const streams of this.characterAudioStream.values()){
            const streamsLive = new MediaStream([streams]);
            // console.warn('CONSUMER STREAM!',streamsLive);
          positionalAudio.value.setMediaStreamSource(streamsLive);

          positionalAudio.value.setBuffer(streams);
          positionalAudio.value.setRefDistance(2);
          // positionalAudio.value.loop = true;
          // positionalAudio.value.play();
          positionalAudio.value.setDirectionalCone(180, 230, 0.1);
          }
          // audioLoader.load(soundUrl, (buffer) => {
          
          Engine.scene.add(positionalAudio.value);
          // });
        }
      }
    }

    for (const entity of this.queryResults.positional_audio.added) {
      // const selectedCharacter = getComponent(entity, CharacterComponent);
      // const audioLoader = new AudioLoader();
      // const soundUrl = "/audio/zz_top_sharp_dressed_man.mp3";
      // const audioTrack = MediaStreamComponent.instance.mediaStream.getAudioTracks()[0];
      // const consumer = MediaStreamComponent.instance.consumers.find
      //   ((c: any) => c.appData.mediaTag === 'cam-audio');
      //   const consumerLive = consumer.track;
      
      const positionalAudio = getMutableComponent(entity, PositionalAudioComponent);
      positionalAudio.value = new PositionalAudio(Engine.audioListener);
      Engine.scene.add(positionalAudio.value);

      // const mediaStreamSourceLive = MediaStreamComponent.instance.consumers[0];
      // console.warn ("MediaStream", mediaStreamSourceLive);     
      }

      for (const entity of this.queryResults.positional_audio.changed) {
        const positionalAudio = getMutableComponent(entity, PositionalAudioComponent);
        const transform = getComponent(entity, TransformComponent);

        positionalAudio.value?.position.copy(transform.position);
        positionalAudio.value?.rotation.setFromQuaternion(transform.rotation);
      }

      for (const entity of this.queryResults.positional_audio.removed) {
        // console.warn(entity);
        // const positionalAudio = getComponent(entity, PositionalAudioComponent, true);

        // Engine.scene.remove(positionalAudio.value);

        removeComponent(entity, PositionalAudioComponent);
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
    audio_stream: {
      components: [PositionalAudioComponent, CharacterComponent],
      listen: {
        added: true,
        removed: true,
      }
    }
  }
