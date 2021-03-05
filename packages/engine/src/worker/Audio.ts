import { Event as DispatchEvent } from 'three'
import { Object3DProxy, AudioDocumentElementProxy, MessageType, Message, MainProxy } from './MessageQueue'

class AudioGainProxy {

  gain: any;
  constructor() {
    this.gain = {
      value: 0
    }
  }
  connect() { } // intentionally noop
  disconnect() { } // intentionally noop
}

class AudioPannerProxy {

  gain: any;
  panningModel: string = 'HRTF';
  refDistance: number;
  rolloffFactor: number;
  maxDistance: number;
  constructor() {
    this.gain = {
      value: 0
    }
  }
  connect() { } // intentionally noop
  disconnect() { } // intentionally noop
}


export class AudioObjectProxy extends Object3DProxy {
  constructor(listener: AudioListenerProxy) {
    super();
    this.type = 'Audio';

		this.listener = listener;
		this.context = listener.context;

		this.gain = new AudioGainProxy();

		this.autoplay = false;

		this.detune = 0;
		this.loop = false;
		this.loopStart = 0;
		this.loopEnd = 0;
		this.offset = 0;
		this.duration = undefined;
		this.playbackRate = 1;
		this.isPlaying = false;
		this.hasPlaybackControl = true;
		this.source = null;
		this.sourceType = 'empty';

		this.filters = [];
  }
  getOutput() {
    return;
  }
  setNodeSource(audioNodeProxyID) {
    this.__callFunc('play', audioNodeProxyID);
    return this;
  }
  // HTMLMediaElement - <audio> & <video>
  setMediaElementSource(source: AudioDocumentElementProxy) {
    this.messageQueue.queue.push({
      messageType: MessageType.AUDIO_SOURCE_ELEMENT_SET,
      message: {
        sourceID: source.uuid,
        proxyID: this.proxyID,
      },
    } as Message);
    return this;
  }
  // HTMLMediaStream - Webcams
  setMediaStreamSource(sourceID: MediaStreamProxyID) {
    this.messageQueue.queue.push({
      messageType: MessageType.AUDIO_SOURCE_STREAM_SET,
      message: {
        sourceID,
        proxyID: this.proxyID,
      },
    } as Message);
    return this;
  }
  // AudioBuffer - AudioLoader.load
  setBuffer(bufferID: AudioBufferProxyID) {
    this.messageQueue.queue.push({
      messageType: MessageType.AUDIO_BUFFER_SET,
      message: {
        bufferID,
        proxyID: this.proxyID,
      },
    } as Message);
    return this;
  }
  play() {
    this.__callFunc('play');
    return this;
  }
  pause() {
    this.__callFunc('pause');
    return this;
  }
  stop() {
    this.__callFunc('stop');
    return this;
  }
  connect() {
    this.__callFunc('connect');
    return this;
  }
  disconnect() {
    this.__callFunc('disconnect');
    return this;
  }
  getFilters() {
    return this.filters;
  }
  setFilters(filters) {
    this.filters = filters;
    this.__callFunc('setFilters', filters);
    return this;
  }
  setDetune(detune) {
    this.detune = detune;
    this.__callFunc('setDetune', detune);
    return this;
  }
  getDetune() {
    return this.detune;
  }
  getFilter() {
    return this.getFilters()[0];
  }
  setFilter(filter) {
    return this.setFilters( filter ? [ filter ] : [] );
  }
  setPlaybackRate(playbackRate) {
    this.playbackRate = playbackRate;
    this.__callFunc('setPlaybackRate', playbackRate);
    return this;
  }
  getPlaybackRate() {
    return this.playbackRate;
  }
  onEnded() {
		this.isPlaying = false;
  }
  getLoop() {
		return this.loop;
  }
  setLoop(loop: boolean) {
    this.__callFunc('setLoop', loop);
    this.loop = loop;
    return this;
  }
  setVolume(volume: number) {
    this.__callFunc('setVolume', volume);
    this.gain.gain.value = volume;
    return this;
  }
  getVolume() {
    return this.gain.gain.value;
  }

}

export class PositionalAudioObjectProxy extends AudioObjectProxy {
  constructor(listener: AudioListenerProxy) {
    super(listener);
    this.type = 'PositionalAudio';
    this.panner = new AudioPannerProxy();
  }
  getOutput() { }
  getRefDistance() {
    return this.panner.refDistance;
  }
  setRefDistance(refDistance) {
    this.__callFunc('setRefDistance', refDistance);
		this.panner.refDistance = refDistance;
    return this;
  }
	getRolloffFactor() { 
    return this.panner.rolloffFactor;
  }
	setRolloffFactor(rolloffFactor) {
    this.__callFunc('setRolloffFactor', rolloffFactor);
		this.panner.rolloffFactor = rolloffFactor;
		return this;
	}
	getDistanceModel() {
		return this.panner.distanceModel;
	}
	setDistanceModel(distanceModel) {
    this.__callFunc('setDistanceModel', distanceModel);
		this.panner.distanceModel = distanceModel;
		return this;
	}
	getMaxDistance() {
		return this.panner.maxDistance;
	}
	setMaxDistance( maxDistance ) {
    this.__callFunc('setMaxDistance', maxDistance);
		this.panner.maxDistance = maxDistance;
		return this;
	}
	setDirectionalCone(coneInnerAngle, coneOuterAngle, coneOuterGain) {
    this.__callFunc('setMaxDistance', coneInnerAngle, coneOuterAngle, coneOuterGain);
		return this;
	}
}

export class AudioContextProxy {
  messageQueue: MainProxy;
  constructor() {
    this.messageQueue = (globalThis as any).__messageQueue as MainProxy;
  }

  createMediaElementSource(source: AudioDocumentElementProxy): MediaElementSourceProxyID {
    // @ts-ignore
    return document.createElement('mediaElementSource', { elementID: source.uuid }) as MediaElementSourceProxyID; // returns proxy ID
  }
}

const AudioContext = new AudioContextProxy()

export class AudioListenerProxy extends Object3DProxy {
  constructor() {
    super({ type: 'AudioListener' });
    this.gain = new AudioGainProxy();
    this.filter = null;
    this.context = AudioContext;
  }
  getInput() {
    return this.gain;
  }
  removeFilter() {
    return this.filter;
  }
  getFilter() { 
    this.__callFunc('getFilter');
    return this;
  }
  setFilter(filter) { 
    this.__callFunc('setFilter', filter);
    this.filter = filter;
    return this;
  }
  getMasterVolume() { 
		return this.gain.gain.value;
  }
  setMasterVolume(volume) { 
    this.__callFunc('setMasterVolume', volume);
    this.gain.gain.value = volume;
    return this;
  }
}

export type AudioBufferProxyID = string;
export type MediaStreamProxyID = string;
export type MediaElementSourceProxyID = string;

export class AudioLoaderProxy {
  messageQueue: MainProxy;
  constructor() {
    this.messageQueue = (globalThis as any).__messageQueue as MainProxy;
  }


  load(url: string, callback: any) {
    const requestCallback = (event: DispatchEvent) => {
      callback(event.type as AudioBufferProxyID);
      this.messageQueue.removeEventListener(
        url,
        requestCallback,
      );
    };
    this.messageQueue.addEventListener(
      url,
      requestCallback,
    );
    this.messageQueue.queue.push({
      messageType: MessageType.AUDIO_BUFFER_LOAD,
      message: {
        url,
      },
    } as Message);
  }
}