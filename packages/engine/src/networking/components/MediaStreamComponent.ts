import { Component } from '../../ecs/classes/Component';
import { Types } from '../../ecs/types/Types';
import { observable } from 'mobx';

/** Component Class for Media streaming. */
export class MediaStreamComponent extends Component<any> {
  /** Static instance for this component. */
  @observable static instance: MediaStreamComponent = null
  /** Whether the video is paused or not. */
  @observable public videoPaused = false
  /** Whether the audio is paused or not. */
  @observable public audioPaused = false
  /** Whether the face tracking is enabled or not. */
  @observable public faceTracking = false
  /** Media stream for streaming data. */
  @observable public mediaStream: MediaStream
  /** Audio Gain to be applied on media stream. */
  @observable public audioGainNode: GainNode

  /** Local screen container. */
  @observable localScreen
  /** Producer using camera to get Video. */
  @observable camVideoProducer
  /** Producer using camera to get Audio. */
  @observable camAudioProducer
  /** Producer using screen to get Video. */
  @observable screenVideoProducer
  /** Producer using screen to get Audio. */
  @observable screenAudioProducer

  /** Network transports. */
  @observable transports = []
  /** List of all producers nodes.. */
  @observable producers = []
  /** List of all consumer nodes. */
  @observable consumers = []
  /** Indication of whether the video while screen sharing is paused or not. */
  @observable screenShareVideoPaused = false
  /** Indication of whether the audio while screen sharing is paused or not. */
  @observable screenShareAudioPaused = false

  /** Whether the component is initialized or not. */
  @observable initialized = false
  /** List of data producer nodes. */
  @observable dataProducers = new Map<string, any>()
  /** List of data consumer nodes. */
  @observable dataConsumers = new Map<string, any>()
  
  /** Constructs Component */
  constructor () {
    super();
    MediaStreamComponent.instance = this;
    this.consumers = [];
    this.mediaStream = null;
  }

  /** Disposes Component. */
  dispose(): void {
    super.dispose();
    MediaStreamComponent.instance = null;
    this.consumers = [];
    this.mediaStream = null;
  }

  /**
   * Set face tracking state.
   * @param state New face tracking state.
   * @returns Updated face tracking state.
   */
  public setFaceTracking (state: boolean): boolean {
    this.faceTracking = state;
    return this.faceTracking;
  }

  /**
   * Pause/Resume the video.
   * @param state New Pause state.
   * @returns Updated Pause state.
   */
  public setVideoPaused (state: boolean): boolean {
    this.videoPaused = state;
    return this.videoPaused;
  }

  /**
   * Pause/Resume the audio.
   * @param state New Pause state.
   * @returns Updated Pause state.
   */
  public setAudioPaused (state: boolean): boolean {
    this.audioPaused = state;
    return this.audioPaused;
  }

  /**
   * Pause/Resume the video while screen sharing.
   * @param state New Pause state.
   * @returns Updated Pause state.
   */
  public setScreenShareVideoPaused (state: boolean): boolean {
    this.screenShareVideoPaused = state;
    return this.screenShareVideoPaused;
  }

  /**
   * Pause/Resume the audio while screen sharing.
   * @param state New Pause state.
   * @returns Updated Pause state.
   */
  public setScreenShareAudioPaused (state: boolean): boolean {
    this.screenShareAudioPaused = state;
    return this.screenShareAudioPaused;
  }

  /**
   * Toggle Pause state of video.
   * @returns Updated Pause state.
   */
  public toggleVideoPaused (): boolean {
    this.videoPaused = !this.videoPaused;
    return this.videoPaused;
  }

  /**
   * Toggle Pause state of audio.
   * @returns Updated Pause state.
   */
  public toggleAudioPaused (): boolean {
    this.audioPaused = !this.audioPaused;
    return this.audioPaused;
  }

  /**
   * Toggle Pause state of video while screen sharing.
   * @returns Updated Pause state.
   */
  public toggleScreenShareVideoPaused (): boolean {
    this.screenShareVideoPaused = !this.screenShareVideoPaused;
    return this.screenShareVideoPaused;
  }

  /**
   * Toggle Pause state of audio while screen sharing.
   * @returns Updated Pause state.
   */
  public toggleScreenShareAudioPaused (): boolean {
    this.screenShareAudioPaused = !this.screenShareAudioPaused;
    return this.screenShareAudioPaused;
  }
}

MediaStreamComponent._schema = {
  initialized: { type: Types.Boolean },
  localScreen: { type: Types.Ref },
  camVideoProducer: { type: Types.Ref },
  camAudioProducer: { type: Types.Ref },
  screenVideoProducer: { type: Types.Ref },
  screenAudioProducer: { type: Types.Ref },
  consumers: { type: Types.Array },
  screenShareVideoPaused: { type: Types.Boolean },
  screenShareAudioPaused: { type: Types.Boolean },
  faceTracking: { type: Types.Boolean },
  videoPaused: { type: Types.Boolean },
  audioPaused: { type: Types.Boolean },
  mediaStream: { type: Types.Ref }
};
