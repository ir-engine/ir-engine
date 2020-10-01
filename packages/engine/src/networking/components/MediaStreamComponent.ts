import { Component } from '../../ecs/classes/Component';
import { Types } from '../../ecs/types/Types';
import { observable } from 'mobx';

export class MediaStreamComponent extends Component<any> {
  @observable static instance: MediaStreamComponent = null
  @observable public videoPaused = false
  @observable public audioPaused = false
  @observable public mediaStream: MediaStream
  @observable public audioGainNode: GainNode

  @observable localScreen
  @observable camVideoProducer
  @observable camAudioProducer
  @observable screenVideoProducer
  @observable screenAudioProducer
  @observable transports = []
  @observable producers = []
  @observable consumers = []
  @observable screenShareVideoPaused = false
  @observable screenShareAudioPaused = false
  @observable initialized = false
  @observable dataProducers = new Map<string, any>()
  @observable dataConsumers = new Map<string, any>()
  
  constructor () {
    super();
    MediaStreamComponent.instance = this;
    this.consumers = [];
    this.mediaStream = null;
  }

  dispose():void {
    super.dispose();
    MediaStreamComponent.instance = null;
    this.consumers = [];
    this.mediaStream = null;
  }

  public setVideoPaused (state: boolean): boolean {
    this.videoPaused = state;
    return this.videoPaused;
  }

  public setAudioPaused (state: boolean): boolean {
    this.audioPaused = state;
    return this.audioPaused;
  }

  public setScreenShareVideoPaused (state: boolean): boolean {
    this.screenShareVideoPaused = state;
    return this.screenShareVideoPaused;
  }

  public setScreenShareAudioPaused (state: boolean): boolean {
    this.screenShareAudioPaused = state;
    return this.screenShareAudioPaused;
  }

  public toggleVideoPaused (): boolean {
    this.videoPaused = !this.videoPaused;
    return this.videoPaused;
  }

  public toggleAudioPaused (): boolean {
    this.audioPaused = !this.audioPaused;
    return this.audioPaused;
  }

  public toggleScreenShareVideoPaused (): boolean {
    this.screenShareVideoPaused = !this.screenShareVideoPaused;
    return this.screenShareVideoPaused;
  }

  public toggleScreenShareAudioPaused (): boolean {
    this.screenShareAudioPaused = !this.screenShareAudioPaused;
    return this.screenShareAudioPaused;
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
