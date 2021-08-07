import { PositionalAudio } from 'three'
import { Component } from '../../ecs/classes/Component'
import { Types } from '../../ecs/types/Types'

/** Component wrapper class fro {@link https://threejs.org/docs/index.html#api/en/audio/PositionalAudio | PositionalAudio } from three.js. */
export class PositionalAudioComponent extends Component<PositionalAudioComponent> {
  /** Position audio container. */
  value: PositionalAudio
}

PositionalAudioComponent._schema = {
  value: { type: Types.Ref, default: null }
}
