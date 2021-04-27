import { Component } from '../../ecs/classes/Component';
import { Types } from '../../ecs/types/Types';
import { Control } from '../classes/Control';
import { VideoPlayer } from '../classes/VideoPlayer';

export class VideoComponent extends Component<VideoComponent> {
  player: VideoPlayer;
  control: Control;
  
  static _schema = {
    player: { type: Types.Ref, control: null },
  }
}
