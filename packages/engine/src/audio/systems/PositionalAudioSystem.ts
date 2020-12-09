import { Object3DComponent } from '../../common/components/Object3DComponent'
import { System, SystemAttributes } from '../../ecs/classes/System'
import { registerComponent } from '../../ecs/functions/ComponentFunctions'
import {
  getComponent,
  addComponent,
  removeComponent,
  getMutableComponent
} from '../../ecs/functions/EntityFunctions'
import { RendererComponent } from '../../renderer/components/RendererComponent'
import { SystemUpdateType } from '../../ecs/functions/SystemUpdateType'
import { PositionalAudioComponent } from '../components/PositionalAudioComponent'
import { CharacterComponent } from '../../templates/character/components/CharacterComponent'
import { PositionalAudio } from 'three'
import { Engine } from '../../ecs/classes/Engine'

export class PositionalAudioSystem extends System {
  updateType = SystemUpdateType.Fixed;

  constructor(attributes?: SystemAttributes) {
    super(attributes)
  }

  execute(): void {
    for (const entity of this.queryResults.positional_audio.added) {
      const selectedCharacter = getComponent(entity, CharacterComponent);
      const positionalAudio = getMutableComponent(entity, PositionalAudioComponent);
      positionalAudio.value = new PositionalAudio(Engine.audioListener);      
      
    }
    for (const entity of this.queryResults.positional_audio.removed) {
      const selectedCharacter = getComponent(entity, CharacterComponent)
                    
    }
  }
}
PositionalAudioSystem.queries = {
  positional_audio: {
    components: [PositionalAudioComponent],
    listen: {
      removed: true,
      added: true
    }
  }
};
