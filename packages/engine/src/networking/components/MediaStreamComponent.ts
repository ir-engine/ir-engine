import { Component } from '../../ecs/classes/Component';
import { Types } from '../../ecs/types/Types';
import { observable } from 'mobx'

export class MediaStreamComponent extends Component<any> {
  @observable static instance: MediaStreamComponent = null
  @observable public videoPaused = false
  @observable public audioPaused = false
  @observable public mediaStream: MediaStream

  @observable localScreen
  @observable camVideoProducer
  @observable camAudioProducer
  @observable screenVideoProducer
  @observable screenAudioProducer
  @observable consumers = []
  @observable screenShareVideoPaused = false
  @observable screenShareAudioPaused = false
  @observable initialized = false
  constructor () {
    super();
    MediaStreamComponent.instance = this;
    this.consumers = [];
    this.mediaStream = null;
  }

  public toggleVideoPaused (): boolean {
    this.videoPaused = !this.videoPaused;
    return this.videoPaused;
  }

  public toggleAudioPaused (): boolean {
    this.audioPaused = !this.audioPaused;
    return this.audioPaused;
  }
}

MediaStreamComponent.schema = {
  initialized: { type: Types.Boolean },
  localScreen: { type: Types.Ref },
  camVideoProducer: { type: Types.Ref },
  camAudioProducer: { type: Types.Ref },
  screenVideoProducer: { type: Types.Ref },
  screenAudioProducer: { type: Types.Ref },
  consumers: { type: Types.Array },
  screenShareVideoPaused: { type: Types.Boolean },
  screenShareAudioPaused: { type: Types.Boolean },
  videoPaused: { type: Types.Boolean },
  audioPaused: { type: Types.Boolean },
  mediaStream: { type: Types.Ref }
};
