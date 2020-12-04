import { HttpRangeFetcher } from 'http-range-fetcher';
import {
  BufferGeometry,
  CompressedTexture,
  Float32BufferAttribute,
  Mesh,
  MeshBasicMaterial,
  PlaneBufferGeometry,
  Renderer,
  Scene,
  Uint16BufferAttribute,
  Uint32BufferAttribute,
  VideoTexture
} from 'three';
import {
  IBuffer
} from './Interfaces';
import CortoDecoder from './libs/cortodecoder.js';
import RingBuffer from './RingBuffer';

export default class DracosisPlayer {
  // Public Fields
  public frameRate = 30;
  public speed = 1.0; // Multiplied by framerate for final playback output rate

  // Three objects
  public scene: Scene;
  public renderer: Renderer;
  public mesh: Mesh;
  public meshFilePath: String;
  public material: any;
  public bufferGeometry: BufferGeometry;
  public compressedTexture: CompressedTexture;
  // Private Fields
  private _startFrame = 1;
  private _scale = 1;
  private _endFrame = 0;
  private _prevFrame = 0;
  private _renderFrame = 0;
  private _numberOfFrames = 0;
  private _currentFrame = 1;
  private _video = null;
  private _videoTexture = null;
  private _loop = true;
  private _isinitialized = false;
  private _ringBuffer: RingBuffer<IBuffer>;
  private _isPlaying = false;

  private hasInited = false;

  rangeFetcher = new HttpRangeFetcher({})


  private _nullBufferGeometry = new BufferGeometry();

  // Temp variables -- reused in loops, etc (beware of initialized value!)
  private _frameNumber = 0;
  private _numberOfBuffersRemoved = 0; // TODO: Remove after debug
  fileHeader: any;
  tempBufferObject: IBuffer = {
    frameNumber: 0,
    bufferGeometry: null
  }

  manifestFilePath: any;

  // public getters and settings
  get currentFrame(): number {
    return this._currentFrame;
  }

  get startFrame(): number {
    return this._startFrame;
  }

  set startFrame(value: number) {
    this._startFrame = value;
    this._numberOfFrames = this._endFrame - this._startFrame;
  }

  get endFrame(): number {
    return this._endFrame;
  }
  set endFrame(value: number) {
    this._endFrame = value;
    this._numberOfFrames = this._endFrame - this._startFrame;
  }

  get loop(): boolean {
    return this._loop;
  }
  set loop(value: boolean) {
    this._loop = value;
  }

  constructor({
    scene,
    renderer,
    meshFilePath,
    videoFilePath,
    loop = true,
    autoplay = true,
    startFrame = 1,
    endFrame = -1,
    speedMultiplier = 1,
    scale = 1,
    bufferSize = 99
  }) {
    this.scene = scene;
    this.renderer = renderer;
    this.meshFilePath = meshFilePath;
    this.manifestFilePath = meshFilePath.replace('drcs', 'manifest');

    this._loop = loop;
    this._scale = scale;
    this.speed = speedMultiplier;
    this._startFrame = startFrame;
    this._currentFrame = startFrame;
    this._video = document.createElement('video');
    this._video.crossorigin = "anonymous";
    this._video.src = videoFilePath;
    this._videoTexture = new VideoTexture(this._video);
    this._videoTexture.crossorigin = "anonymous";
    this._video.requestVideoFrameCallback(this.videoUpdateHandler.bind(this));

    document.body.appendChild(this._video);

    this.bufferGeometry = new PlaneBufferGeometry(1, 1);
    this.material = new MeshBasicMaterial({ map: this._videoTexture });
    this.mesh = new Mesh(this.bufferGeometry, this.material);
    this.mesh.scale.set(this._scale, this._scale, this._scale);

    this.scene.add(this.mesh);


    const xhr = new XMLHttpRequest();
    xhr.onreadystatechange = () => {
      if (xhr.readyState !== 4) return;
        this.fileHeader = JSON.parse(xhr.responseText);

        this._endFrame = (endFrame > 1) ? endFrame : this.fileHeader.frameData.length;
        this._numberOfFrames = this._endFrame - this._startFrame + 1;

        this._ringBuffer = new RingBuffer(bufferSize);
        if (autoplay) {
          // Create an event listener that removed itself on input
          const eventListener = () => {
            // If we haven't inited yet, notify that we have, autoplay content and remove the event listener
            if (!this.hasInited) {
              this.hasInited = true;
              this.play();
              document.body.removeEventListener("mousedown", eventListener);
            }
    
          }
          document.body.addEventListener("mousedown", eventListener)
        }
        this._isinitialized = true;
        this.handleBuffers();
    };

    xhr.open('GET', this.manifestFilePath, true); // true for asynchronous
    xhr.send();
  }


  fetchData(data) {
    console.log("Fetch data called, ", data);
    // Make a list of buffers to transfer
    let lastFrame = -1;
    let endOfRangeReached = false;
    // Iterate over values in ascending order...
    data.sort().forEach((frame) => {
      //  If this frame > end frame...
      // ... warn the dev, since this might be unexpected
      console.warn("Frame fetched outside of loop range");
      if (frame > this.endFrame) {
        // If loop is off, flag end reached
        if (!this.loop) {
          endOfRangeReached = true;
          return;
        }
        // If loop is on, make sure the frame request fits within start and end frame range
        frame %= this.endFrame;
        // If the start frame is not zero, add to the current frame number
        if (frame < this.startFrame)
          frame += this.startFrame;
      }
      // If we're not reading from the position of the last frame, seek to start frame
      if (!(frame == lastFrame + 1 && frame != this.startFrame)) {
        // Get frame start byte pose
      }
      // tell the stream reader to read out the next bytes..
      // Set temp buffer object frame number
      this.tempBufferObject.frameNumber = frame;
      this.rangeFetcher.getRange(this.meshFilePath, this.fileHeader.frameData[frame].startBytePosition, this.fileHeader.frameData[frame].meshLength)
      .then( response => {
        console.log("Response length is", response.buffer.length);
        console.log("Intended length is", this.fileHeader.frameData[frame].meshLength)
        console.log("Response buffer is ", response.buffer);
        this.tempBufferObject.bufferGeometry = this.decodeCORTOData(response.buffer.buffer as any);

        const _pos = this.getPositionInBuffer(this._frameNumber);

        this._ringBuffer.get(_pos).bufferGeometry =  this.tempBufferObject.bufferGeometry;
        this._ringBuffer.get(_pos).frameNumber =  this.tempBufferObject.frameNumber;

        // Set the last frame
        lastFrame = frame;
      });
    });
  }

  byteArrayToLong(/*byte[]*/byteArray: Buffer) {
    let value = 0;
    for (let i = byteArray.length - 1; i >= 0; i--) {
      value = (value * 256) + byteArray[i];
    }
    return value;
  };

  lerp(v0: number, v1: number, t: number) {
    return v0 * (1 - t) + v1 * t
  }


  play() {
    this.show();
    this._video.play()
  }

  pause() {
    this._isPlaying = false;
  }

  reset() {
    this._currentFrame = this._startFrame;
  }

  goToFrame(frame: number, play: boolean) {
    this._currentFrame = frame;
    if (play) this.play();
  }

  setSpeed(multiplyScalar: number) {
    this.speed = multiplyScalar;
  }

  show() {
    this.mesh.visible = true;
  }

  hide() {
    this.mesh.visible = false;
    this.pause();
  }

  fadeIn(stepLength = 0.1, fadeTime: number, currentTime = 0) {
    if (!this._isPlaying) this.play();
    this.material.opacity = this.lerp(0, 1, currentTime / fadeTime);
    currentTime = currentTime + stepLength * fadeTime;
    if (currentTime >= fadeTime) {
      this.material.opacity = 1;
      return;
    }

    setTimeout(() => {
      this.fadeIn(fadeTime, currentTime);
    }, stepLength * fadeTime);
  }

  fadeOut(stepLength = 0.1, fadeTime: number, currentTime = 0) {
    this.material.opacity = this.lerp(1, 0, currentTime / fadeTime);
    currentTime = currentTime + stepLength * fadeTime;
    if (currentTime >= fadeTime) {
      this.material.opacity = 0;
      this.pause();
      return;
    }

    setTimeout(() => {
      this.fadeOut(fadeTime, currentTime);
    }, stepLength * fadeTime);
  }

  videoUpdateHandler(now, metadata) {
    let frameToPlay = metadata.presentedFrames - 1;
    console.log('==========DIFF', Math.round(this._video.currentTime * 30), Math.round(metadata.mediaTime * 30), metadata.presentedFrames, metadata);

    if (frameToPlay !== this._prevFrame) {
      this.showFrame(frameToPlay)
      this._prevFrame = frameToPlay;
      this.handleBuffers();
    }
    this._video.requestVideoFrameCallback(this.videoUpdateHandler.bind(this));
  }

  render() {
    this._renderFrame++;
    let frameToPlay = Math.floor(this._video.currentTime * 30) || 0;
    if (this._renderFrame % 2 === 0 || !this._isPlaying) {
      console.log(frameToPlay, 'frametoplay');
      this.showFrame(frameToPlay)
    }

    window.requestAnimationFrame(this.render.bind(this))
  }

  decodeCORTOData(rawBuffer: Buffer) {
    let decoder = new CortoDecoder(rawBuffer, null, null);
    let meshData = decoder.decode();
    let geometry = new BufferGeometry();
    geometry.setIndex(
      new (meshData.index.length > 65535
        ? Uint32BufferAttribute
        : Uint16BufferAttribute)(meshData.index, 1)
    );
    geometry.setAttribute(
      'position',
      new Float32BufferAttribute(meshData.position, 3)
    );
    geometry.setAttribute(
      'uv',
      new Float32BufferAttribute(meshData.uv, 2)
    );
    return geometry;
  }

  getPositionInBuffer(frameNumber: number): number {
    // Search backwards, which should make the for loop shorter on longer buffer
    for (let i = this._ringBuffer.getBufferLength(); i >= 0; i--) {
      if (
        this._ringBuffer.get(i) &&
        frameNumber == this._ringBuffer.get(i).frameNumber
      )
        return i;
    }
    return -1;
  }

  handleBuffers() {
    while (true) {
      // Peek the current frame. if it's frame number is below current frame, trash it
      if (!this._ringBuffer ||
        !this._ringBuffer.getFirst() ||
        this._ringBuffer.getFirst().frameNumber >= this._currentFrame)
        break;

      // if it's equal to or greater than current frame, break the loop
      this._ringBuffer.remove(0);
      this._numberOfBuffersRemoved++;
    }

    if (this._numberOfBuffersRemoved > 0)
      console.warn('Removed ', this._numberOfBuffersRemoved, ' since they were skipped in playback');

    const framesToFetch: number[] = [];
    if (this._ringBuffer.empty() && this._currentFrame == 0) {
      const frameData: IBuffer = {
        frameNumber: this.startFrame,
        bufferGeometry: this._nullBufferGeometry as any
      } as any;
      framesToFetch.push(this.startFrame);
      this._ringBuffer.add(frameData);
    }

    // Fill buffers with new data
    while (!this._ringBuffer.full()) {
      // Increment onto the last frame
      let lastFrame = (this._ringBuffer.getLast() && this._ringBuffer.getLast().frameNumber) || Math.max(this._currentFrame - 1, 0);
      if (this._ringBuffer.getLast()) lastFrame = this._ringBuffer.getLast().frameNumber;
      const nextFrame = (lastFrame + 1) % this._numberOfFrames;

      const frameData: IBuffer = {
        frameNumber: nextFrame,
        bufferGeometry: this._nullBufferGeometry as any
      } as any;
      framesToFetch.push(nextFrame);
      this._ringBuffer.add(frameData);
    }

    this.fetchData(framesToFetch);
  }

  showFrame(frame: number) {
    if (!this._isinitialized) return console.warn("Not inited");

    if (!this._ringBuffer || !this._ringBuffer.getFirst()) return console.warn("No ringbuffer");

    let frameToPlay = frame % this._endFrame;

    this.cleanBeforeNeeded(frameToPlay);

    if (this._ringBuffer.getFirst().frameNumber == frameToPlay) {
      this.bufferGeometry = this._ringBuffer.getFirst().bufferGeometry as any;
      this.mesh.geometry = this.bufferGeometry;
      (this.mesh.material as any).needsUpdate = true;
    } else {
      console.warn("First frame isn't frame to play");
    }
  }

  cleanBeforeNeeded(frameToPlay: number) {
    const maxDeleteConstant = 50;
    let index = 0;
    while (this._ringBuffer.getFirst().frameNumber !== frameToPlay && index < maxDeleteConstant) {
      index++;
      // console.log('deleting frame no ',this._ringBuffer.getFirst().frameNumber );
      this._ringBuffer.remove(0);
    }
  }
}
