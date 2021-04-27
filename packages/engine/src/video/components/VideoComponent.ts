import { Component } from '../../ecs/classes/Component';
import { Types } from '../../ecs/types/Types';
import { VideoPlayer } from '../classes/VideoPlayer';

export class VideoComponent extends Component<VideoComponent> {
  player: VideoPlayer;
  static _schema = {
    player: { type: Types.Ref, default: null },
  }
}
