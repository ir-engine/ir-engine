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

// let networkTransport: any;

// export function setPartyId(partyId: string): void {
//   networkTransport = Network.instance.transport as any;
//   networkTransport.partyId = partyId;
// }

export class PositionalAudioSystem extends System {
  // updateType = SystemUpdateType.Fixed;

  constructor(attributes?: SystemAttributes) {
    super(attributes);
  }
  
//   const newTransport = partyId === 'instance' ? networkTransport.instanceSendTransport : networkTransport.partySendTransport;
//   MediaStreamComponent.instance.camAudioProducer = await this.newTransport.produce({
//     track: MediaStreamComponent.instance.mediaStream.getAudioTracks()[0],
//     appData: { mediaTag: "cam-audio", partyId: partyId }
// });

  execute(): void {
    for (const entity of this.queryResults.positional_audio.added) {
      // const selectedCharacter = getComponent(entity, CharacterComponent);
      const audioLoader = new AudioLoader();
      const soundUrl = "/audio/zz_top_sharp_dressed_man.mp3";

      console.warn (entity);
      const mediaStreamSource = MediaStreamComponent.instance.mediaStream;
      // console.warn ("MediaStrem", mediaStreamSource);

      const positionalAudio = getMutableComponent(entity, PositionalAudioComponent);
      positionalAudio.value = new PositionalAudio(Engine.audioListener);
      
      if (!hasComponent(entity, LocalInputReceiver)){
        audioLoader.load(soundUrl, (buffer) => {
          positionalAudio.value.setBuffer(buffer);
          positionalAudio.value.setRefDistance(1);
          positionalAudio.value.loop = true;
          positionalAudio.value.play();
          positionalAudio.value.setDirectionalCone(180, 230, 0.1);
          // positionalAudio.value.position.y = 2;
          // positionalAudio.value.position.z = 30;
          Engine.scene.add(positionalAudio.value);
        });
      }
    }

    for (const entity of this.queryResults.positional_audio.changed) {
      const positionalAudio = getMutableComponent(entity, PositionalAudioComponent);
      const transform = getComponent(entity, TransformComponent);

      positionalAudio.value.position.copy(transform.position);
      positionalAudio.value.rotation.setFromQuaternion(transform.rotation);
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
  }
};
