import { PositionalAudio } from 'three';
import { Component } from '../../ecs/classes/Component';
import { Types } from '../../ecs/types/Types';

export class PositionalAudioComponent extends Component<PositionalAudioComponent> {
  value?: PositionalAudio
}

PositionalAudioComponent.schema = {
  value: { type: Types.Ref, default: null }
};