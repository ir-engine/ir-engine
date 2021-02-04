import { observable } from 'mobx';
import { System } from '../../ecs/classes/System';
import { localMediaConstraints } from '../constants/VideoConstants';

/** System class for media streaming. */
export class MediaStreamSystem extends System {
  public static instance = null;

  /** Whether the video is paused or not. */
  @observable public static videoPaused = false
  /** Whether the audio is paused or not. */
  @observable public static audioPaused = false
  /** Whether the face tracking is enabled or not. */
  @observable public static faceTracking = false
  /** Media stream for streaming data. */
  @observable public static mediaStream: MediaStream = null
  /** Audio Gain to be applied on media stream. */
  @observable public static audioGainNode: GainNode = null

  /** Local screen container. */
  @observable public static localScreen = null
  /** Producer using camera to get Video. */
  @observable public static camVideoProducer = null
  /** Producer using camera to get Audio. */
  @observable public static camAudioProducer = null
  /** Producer using screen to get Video. */
  @observable public static screenVideoProducer = null
  /** Producer using screen to get Audio. */
  @observable public static screenAudioProducer = null
  /** List of all producers nodes.. */
  @observable public producers = []
  /** List of all consumer nodes. */
  @observable public consumers = []
  /** Indication of whether the video while screen sharing is paused or not. */
  @observable public static screenShareVideoPaused = false
  /** Indication of whether the audio while screen sharing is paused or not. */
  @observable public static screenShareAudioPaused = false

  /** Whether the component is initialized or not. */
  @observable public static initialized = false

  constructor() {
    super()
    MediaStreamSystem.instance = this;
  }

  /**
   * Set face tracking state.
   * @param state New face tracking state.
   * @returns Updated face tracking state.
   */
  public static setFaceTracking (state: boolean): boolean {
    MediaStreamSystem.faceTracking = state;
    return MediaStreamSystem.faceTracking;
  }

  /**
   * Pause/Resume the video.
   * @param state New Pause state.
   * @returns Updated Pause state.
   */
  public static setVideoPaused (state: boolean): boolean {
    MediaStreamSystem.videoPaused = state;
    return MediaStreamSystem.videoPaused;
  }

  /**
   * Pause/Resume the audio.
   * @param state New Pause state.
   * @returns Updated Pause state.
   */
  public static setAudioPaused (state: boolean): boolean {
    MediaStreamSystem.audioPaused = state;
    return MediaStreamSystem.audioPaused;
  }

  /**
   * Pause/Resume the video while screen sharing.
   * @param state New Pause state.
   * @returns Updated Pause state.
   */
  public static setScreenShareVideoPaused (state: boolean): boolean {
    MediaStreamSystem.screenShareVideoPaused = state;
    return MediaStreamSystem.screenShareVideoPaused;
  }

  /**
   * Pause/Resume the audio while screen sharing.
   * @param state New Pause state.
   * @returns Updated Pause state.
   */
  public static setScreenShareAudioPaused (state: boolean): boolean {
    MediaStreamSystem.screenShareAudioPaused = state;
    return MediaStreamSystem.screenShareAudioPaused;
  }

  /**
   * Toggle Pause state of video.
   * @returns Updated Pause state.
   */
  public static toggleVideoPaused (): boolean {
    MediaStreamSystem.videoPaused = !MediaStreamSystem.videoPaused;
    return MediaStreamSystem.videoPaused;
  }

  /**
   * Toggle Pause state of audio.
   * @returns Updated Pause state.
   */
  public static toggleAudioPaused (): boolean {
    MediaStreamSystem.audioPaused = !MediaStreamSystem.audioPaused;
    return MediaStreamSystem.audioPaused;
  }

  /**
   * Toggle Pause state of video while screen sharing.
   * @returns Updated Pause state.
   */
  public static toggleScreenShareVideoPaused (): boolean {
    MediaStreamSystem.screenShareVideoPaused = !MediaStreamSystem.screenShareVideoPaused;
    return MediaStreamSystem.screenShareVideoPaused;
  }

  /**
   * Toggle Pause state of audio while screen sharing.
   * @returns Updated Pause state.
   */
  public static toggleScreenShareAudioPaused (): boolean {
    MediaStreamSystem.screenShareAudioPaused = !MediaStreamSystem.screenShareAudioPaused;
    return MediaStreamSystem.screenShareAudioPaused;
  }

  /** Execute the media stream system. */
  public execute (): void {}

  /**
   * Start the camera.
   * @returns Whether the camera is started or not. */
  static async startCamera (): Promise<boolean> {
    console.log('start camera');
    if (MediaStreamSystem.mediaStream) return false;
    return await MediaStreamSystem.getMediaStream();
  }

  /**
   * Switch to sending video from the "next" camera device in device list (if there are multiple cameras).
   * @returns Whether camera cycled or not.
   */
  static async cycleCamera (): Promise<boolean> {
    if (!(MediaStreamSystem.camVideoProducer && MediaStreamSystem.camVideoProducer.track)) {
      console.log('cannot cycle camera - no current camera track');
      return false;
    }
    console.log('cycle camera');

    // find "next" device in device list
    const deviceId = await MediaStreamSystem.getCurrentDeviceId();
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
    MediaStreamSystem.mediaStream = await navigator.mediaDevices.getUserMedia({
      video: { deviceId: { exact: vidDevices[idx].deviceId } },
      audio: true
    });

    // replace the tracks we are sending
    await MediaStreamSystem.camVideoProducer.replaceTrack({
      track: MediaStreamSystem.mediaStream.getVideoTracks()[0]
    });
    await MediaStreamSystem.camAudioProducer.replaceTrack({
      track: MediaStreamSystem.mediaStream.getAudioTracks()[0]
    });
    return true;
  }

  /**
   * Get whether screen video paused or not.
   * @returns Screen video paused state.
   */
  static getScreenPausedState (): boolean {
    return MediaStreamSystem.screenShareVideoPaused;
  }

  /**
   * Get whether screen audio paused or not.
   * @returns Screen audio paused state.
   */
  static getScreenAudioPausedState (): boolean {
    return MediaStreamSystem.screenShareAudioPaused;
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
      // MediaStreamSystem.worldScene.createOrUpdatePositionalAudio(peerId)

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
  static async getCurrentDeviceId (): Promise<string> | null {
    if (!MediaStreamSystem.camVideoProducer) return null;

    const { deviceId } = MediaStreamSystem.camVideoProducer.track.getSettings();
    if (deviceId) return deviceId;
    // Firefox doesn't have deviceId in MediaTrackSettings object
    const track =
      MediaStreamSystem.mediaStream && MediaStreamSystem.mediaStream.getVideoTracks()[0];
    if (!track) return null;
    const devices = await navigator.mediaDevices.enumerateDevices();
    const deviceInfo = devices.find(d => d.label.startsWith(track.label));
    return deviceInfo.deviceId;
  }

  /**
   * Get user media stream.
   * @returns Whether stream is active or not.
   */
  public static async getMediaStream (): Promise<boolean> {
    try {
      console.log('Getting media stream');
      console.log(localMediaConstraints);
      MediaStreamSystem.mediaStream = await navigator.mediaDevices.getUserMedia(localMediaConstraints);
      console.log(MediaStreamSystem.mediaStream);
      if (MediaStreamSystem.mediaStream.active) {
        MediaStreamSystem.audioPaused = false;
        MediaStreamSystem.videoPaused = false;
        return true;
      }
      MediaStreamSystem.audioPaused = true;
      MediaStreamSystem.videoPaused = true;
      return false;
    } catch(err) {
      console.log('failed to get media stream');
      console.log(err);
    }
  }
}
