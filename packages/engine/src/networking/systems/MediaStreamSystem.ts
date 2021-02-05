import { observable } from 'mobx';
import { System } from '../../ecs/classes/System';
import { localMediaConstraints } from '../constants/VideoConstants';

/** System class for media streaming. */
export class MediaStreamSystem extends System {
  public static instance = null;

  /** Whether the video is paused or not. */
  @observable public videoPaused = false
  /** Whether the audio is paused or not. */
  @observable public audioPaused = false
  /** Whether the face tracking is enabled or not. */
  @observable public faceTracking = false
  /** Media stream for streaming data. */
  @observable public mediaStream: MediaStream = null
  /** Audio Gain to be applied on media stream. */
  @observable public audioGainNode: GainNode = null

  /** Local screen container. */
  @observable public localScreen = null
  /** Producer using camera to get Video. */
  @observable public camVideoProducer = null
  /** Producer using camera to get Audio. */
  @observable public camAudioProducer = null
  /** Producer using screen to get Video. */
  @observable public screenVideoProducer = null
  /** Producer using screen to get Audio. */
  @observable public screenAudioProducer = null
  /** List of all producers nodes.. */
  @observable public producers = []
  /** List of all consumer nodes. */
  @observable public consumers = []
  /** Indication of whether the video while screen sharing is paused or not. */
  @observable public screenShareVideoPaused = false
  /** Indication of whether the audio while screen sharing is paused or not. */
  @observable public screenShareAudioPaused = false

  /** Whether the component is initialized or not. */
  @observable public initialized = false

  constructor() {
    super()
    MediaStreamSystem.instance = this;
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

  /** Execute the media stream system. */
  public execute (): void {}

  /**
   * Start the camera.
   * @returns Whether the camera is started or not. */
  async startCamera (): Promise<boolean> {
    console.log('start camera');
    if (this.mediaStream) return false;
    return await this.getMediaStream();
  }

  /**
   * Switch to sending video from the "next" camera device in device list (if there are multiple cameras).
   * @returns Whether camera cycled or not.
   */
  async cycleCamera (): Promise<boolean> {
    if (!(this.camVideoProducer && this.camVideoProducer.track)) {
      console.log('cannot cycle camera - no current camera track');
      return false;
    }
    console.log('cycle camera');

    // find "next" device in device list
    const deviceId = await this.getCurrentDeviceId();
    const allDevices = await navigator.mediaDevices.enumerateDevices();
    const vidDevices = allDevices.filter(d => d.kind === 'videoinput');
    if (!(vidDevices.length > 1)) {
      console.log('cannot cycle camera - only one camera');
      return false;
    }
    let idx = vidDevices.findIndex(d => d.deviceId === deviceId);
    if (idx === vidDevices.length - 1) idx = 0;
    else idx += 1;

    // get a new video stream. might as well get a new audio stream too,
    // just in case browsers want to group audio/video streams together
    // from the same device when possible (though they don't seem to,
    // currently)
    console.log('getting a video stream from new device', vidDevices[idx].label);
    this.mediaStream = await navigator.mediaDevices.getUserMedia({
      video: { deviceId: { exact: vidDevices[idx].deviceId } },
      audio: true
    });

    // replace the tracks we are sending
    await this.camVideoProducer.replaceTrack({
      track: this.mediaStream.getVideoTracks()[0]
    });
    await this.camAudioProducer.replaceTrack({
      track: this.mediaStream.getAudioTracks()[0]
    });
    return true;
  }

  /**
   * Get whether screen video paused or not.
   * @returns Screen video paused state.
   */
  getScreenPausedState (): boolean {
    return this.screenShareVideoPaused;
  }

  /**
   * Get whether screen audio paused or not.
   * @returns Screen audio paused state.
   */
  getScreenAudioPausedState (): boolean {
    return this.screenShareAudioPaused;
  }

  /**
   * Remove video and audio node from the consumer.
   * @param consumer Consumer from which video and audio node will be removed.
   */
  static removeVideoAudio (consumer: any): void {
    document.querySelectorAll(consumer.id).forEach(v => {
      if (v.consumer === consumer) v.parentNode.removeChild(v);
    });
  }

  /**
   * Add video and audio node to the consumer.
   * @param mediaStream Video and/or audio media stream to be added in element.
   * @param peerId ID to be used to find peer element in which media stream will be added.
   */
  static addVideoAudio (mediaStream: { track: { clone: () => MediaStreamTrack }; kind: string }, peerId: any): void {
    console.log('addVideoAudio');
    console.log(mediaStream);
    console.log(peerId);
    if (!(mediaStream && mediaStream.track)) {
      return;
    }
    const elementID = `${peerId}_${mediaStream.kind}`;
    console.log(`elementId: ${elementID}`);
    let el = document.getElementById(elementID) as any;
    console.log(el);

    // set some attributes on our audio and video elements to make
    // mobile Safari happy. note that for audio to play you need to be
    // capturing from the mic/camera
    if (mediaStream.kind === 'video') {
      console.log('Creating video element with ID ' + elementID);
      if (el === null) {
        console.log(`Creating video element for user with ID: ${peerId}`);
        el = document.createElement('video');
        el.id = `${peerId}_${mediaStream.kind}`;
        el.autoplay = true;
        document.body.appendChild(el);
        el.setAttribute('playsinline', 'true');
      }

      // TODO: do i need to update video width and height? or is that based on stream...?
      console.log(`Updating video source for user with ID: ${peerId}`);
      console.log('mediaStream track:');
      console.log(mediaStream.track);
      console.log('mediaStream track clone:');
      console.log(mediaStream.track.clone());
      el.srcObject = new MediaStream([mediaStream.track.clone()]);
      console.log('srcObject:');
      console.log(el.srcObject.getTracks());
      el.mediaStream = mediaStream;

      console.log('video el before play:');
      console.log(el);
      // let's "yield" and return before playing, rather than awaiting on
      // play() succeeding. play() will not succeed on a producer-paused
      // track until the producer unpauses.
      try {
        el.play().then(() => console.log('Playing video')).catch((e: any) => {
          console.log(`Play video error: ${e}`);
          console.error(e);
        });
      } catch(err) {
        console.log('video play error');
        console.log(err);
      }
    } else {
      // Positional Audio Works in Firefox:
      // Global Audio:
      if (el === null) {
        console.log(`Creating audio element for user with ID: ${peerId}`);
        el = document.createElement('audio');
        el.id = `${peerId}_${mediaStream.kind}`;
        document.body.appendChild(el);
        el.setAttribute('playsinline', 'true');
        el.setAttribute('autoplay', 'true');
      }

      console.log(`Updating <audio> source object for client with ID: ${peerId}`);
      el.srcObject = new MediaStream([mediaStream.track.clone()]);
      el.mediaStream = mediaStream;
      el.volume = 0; // start at 0 and let the three.js scene take over from here...
      // this.worldScene.createOrUpdatePositionalAudio(peerId)

      // let's "yield" and return before playing, rather than awaiting on
      // play() succeeding. play() will not succeed on a producer-paused
      // track until the producer unpauses.
      el.play().catch((e: any) => {
        console.log(`Play audio error: ${e}`);
        console.error(e);
      });
    }
  }

  /** Get device ID of device which is currently streaming media. */
  async getCurrentDeviceId (): Promise<string> | null {
    if (!this.camVideoProducer) return null;

    const { deviceId } = this.camVideoProducer.track.getSettings();
    if (deviceId) return deviceId;
    // Firefox doesn't have deviceId in MediaTrackSettings object
    const track =
      this.mediaStream && this.mediaStream.getVideoTracks()[0];
    if (!track) return null;
    const devices = await navigator.mediaDevices.enumerateDevices();
    const deviceInfo = devices.find(d => d.label.startsWith(track.label));
    return deviceInfo.deviceId;
  }

  /**
   * Get user media stream.
   * @returns Whether stream is active or not.
   */
  public async getMediaStream (): Promise<boolean> {
    try {
      console.log('Getting media stream');
      console.log(localMediaConstraints);
      this.mediaStream = await navigator.mediaDevices.getUserMedia(localMediaConstraints);
      console.log(this.mediaStream);
      if (this.mediaStream.active) {
        this.audioPaused = false;
        this.videoPaused = false;
        return true;
      }
      this.audioPaused = true;
      this.videoPaused = true;
      return false;
    } catch(err) {
      console.log('failed to get media stream');
      console.log(err);
    }
  }
}
