import {
  BufferGeometry,
  CompressedTexture,
  Float32BufferAttribute,
  Mesh,
  MeshBasicMaterial,
  NearestFilter,
  PlaneBufferGeometry,
  Renderer,
  RepeatWrapping,
  Scene,
  sRGBEncoding,
  Uint16BufferAttribute,
  Uint32BufferAttribute,
  VideoTexture
} from 'three';
import { BasisTextureLoader } from 'three/examples/jsm/loaders/BasisTextureLoader.js';
import CortoDecoder from './libs/corto/cortodecoder.js';
import { MessageType } from './Enums';
import {
  Action,
  IBufferGeometryCompressedTexture,
  WorkerDataRequest,
  WorkerInitializationResponse
} from './Interfaces';
import RingBuffer from './RingBuffer';
import { lerp } from './Utilities';
// @ts-ignore
import Worker from 'worker-loader!./worker.js';

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
  worker = new Worker();
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
  private _ringBuffer: RingBuffer<IBufferGeometryCompressedTexture>;
  private _isPlaying = false;

  private _basisTextureLoader = new BasisTextureLoader();
  private _nullBufferGeometry = new BufferGeometry();
  private _nullCompressedTexture = new CompressedTexture(
    [new ImageData(200, 200)],
    0,
    0
  );

  // Temp variables -- reused in loops, etc (beware of initialized value!)
  private _pos = 0;
  private _frameNumber = 0;
  private _numberOfBuffersRemoved = 0; // TODO: Remove after debug

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
    this.worker.postMessage({
      type: MessageType.SetEndFrameRequest,
      value,
    } as Action);
  }

  get endFrame(): number {
    return this._endFrame;
  }
  set endFrame(value: number) {
    this._endFrame = value;
    this._numberOfFrames = this._endFrame - this._startFrame;
    this.worker.postMessage({
      type: MessageType.SetEndFrameRequest,
      value,
    } as Action);
  }

  get loop(): boolean {
    return this._loop;
  }
  set loop(value: boolean) {
    this._loop = value;
    this.worker.postMessage({ type: MessageType.SetLoopRequest, value } as Action);
  }

  httpGetAsync(theUrl: any, callback: any) {
    const xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function () {
      if (xmlHttp.readyState === 4 && xmlHttp.status === 200)
        callback(xmlHttp.responseText);
    };

    xmlHttp.open('GET', theUrl, true); // true for asynchronous
    xmlHttp.send(null);
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
    this._loop = loop;
    this._scale = scale;
    this.speed = speedMultiplier;
    this._startFrame = startFrame;
    this._currentFrame = startFrame;
    this._video = document.createElement('video');
    this._video.src = videoFilePath;
    this._videoTexture = new VideoTexture(this._video);

    this._video.requestVideoFrameCallback(this.videoUpdateHandler.bind(this));

    document.body.appendChild(this._video);

    this.bufferGeometry = new PlaneBufferGeometry(1, 1);
    this.material = new MeshBasicMaterial({ map: this._videoTexture });
    this.mesh = new Mesh(this.bufferGeometry, this.material);
    this.mesh.scale.set(this._scale, this._scale, this._scale)

    this.scene.add(this.mesh);

    this._basisTextureLoader.setTranscoderPath(
      'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/js/libs/basis/'
    );
    this._basisTextureLoader.detectSupport(renderer);
    let player = this;

    this.httpGetAsync(meshFilePath, function (data: any) {
      data = JSON.parse(data);
      if (endFrame > 1) {
        player._endFrame = endFrame;
      } else {
        player._endFrame = data.fileHeader.frameData.length;
      }
      player._numberOfFrames = player._endFrame - player._startFrame + 1;

      // init buffers with settings
      player._ringBuffer = new RingBuffer(bufferSize);

      const initializeMessage = {
        startFrame: player._startFrame,
        endFrame: player._endFrame,
        type: MessageType.InitializationRequest,
        data: data,
        loop: player._loop,
        meshFilePath: data.meshFilePath,
        fileHeader: data.fileHeader,
        isInitialized: true,
        readStreamOffset: data.readStreamOffset,
      };

      this.worker.postMessage(initializeMessage);

      // Add event handler for manging worker responses
      this.worker.addEventListener('message', ({ data }) => player.handleMessage(data));
    });
    if(autoplay) {
      console.log("Autoplaying dracosis sequence")
        this.play();
    }
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

  async decodeTexture(compressedTexture, frameNumber) {
    var decodedTexture;

    await (this._basisTextureLoader as any)
      ._createTexture(compressedTexture, frameNumber.toString())
      .then(function (texture, param) {
        texture.magFilter = NearestFilter;
        texture.minFilter = NearestFilter;
        texture.encoding = sRGBEncoding;
        texture.wrapS = RepeatWrapping;
        texture.wrapT = RepeatWrapping;
        texture.repeat.y = -1;
        decodedTexture = texture;
      })
      .catch(function (error) {
        console.log('Error:', error);
      });

    return { texture: decodedTexture, frameNumber: frameNumber };
  }

  handleMessage(data: any) {
    switch (data.type) {
      case MessageType.InitializationResponse:
        this.handleInitializationResponse(data);
        break;
      case MessageType.DataResponse: {
        if (data && data.buffers) {
          this.handleDataResponse(data.buffers);
        }
        break;
      }
    }
  }

  handleInitializationResponse(data: WorkerInitializationResponse) {
    if (data.isInitialized) {
      this._isinitialized = true;
      this.handleBuffers();
      console.log('Received initialization response from worker');
    } else console.error('Initialization failed');
  }

  handleDataResponse(data) {
    const player = this;

    data.forEach((geomTex, index) => {
      player._frameNumber = geomTex.frameNumber;

      player._pos = player.getPositionInBuffer(player._frameNumber);

      player._ringBuffer.get(
        player._pos
      ).bufferGeometry = player.decodeCORTOData(geomTex.bufferGeometry);
    });
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
    // If not initialized, skip.
    if (!this._isinitialized) return setTimeout(this.handleBuffers, 100);

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
      const frameData: IBufferGeometryCompressedTexture = {
        frameNumber: this.startFrame,
        bufferGeometry: this._nullBufferGeometry,
        compressedTexture: this._nullCompressedTexture,
      };
      framesToFetch.push(this.startFrame);
      this._ringBuffer.add(frameData);
    }

    // Fill buffers with new data
    while (!this._ringBuffer.full()) {
      // Increment onto the last frame
      let lastFrame = (this._ringBuffer.getLast() && this._ringBuffer.getLast().frameNumber) || Math.max(this._currentFrame - 1, 0);
      if (this._ringBuffer.getLast()) lastFrame = this._ringBuffer.getLast().frameNumber;
      const nextFrame = (lastFrame + 1) % this._numberOfFrames;

      const frameData: IBufferGeometryCompressedTexture = {
        frameNumber: nextFrame,
        bufferGeometry: this._nullBufferGeometry,
        compressedTexture: this._nullCompressedTexture,
      };
      framesToFetch.push(nextFrame);
      this._ringBuffer.add(frameData);
    }

    const fetchFramesMessage: WorkerDataRequest = {
      type: MessageType.DataRequest,
      framesToFetch,
    };

    if (framesToFetch.length > 0) this.worker.postMessage(fetchFramesMessage);
  }

  showFrame(frame: number) {
    if (!this._isinitialized) return;

    if (!this._ringBuffer || !this._ringBuffer.getFirst()) return;

    let frameToPlay = frame % this._endFrame;

    this.cleanBeforeNeeded(frameToPlay);

    if (this._ringBuffer.getFirst().frameNumber == frameToPlay) {
      this.bufferGeometry = this._ringBuffer.getFirst().bufferGeometry;
      this.mesh.geometry = this.bufferGeometry;
      this.compressedTexture = this._ringBuffer.getFirst().compressedTexture;
      (this.mesh.material as any).needsUpdate = true;
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

  update() {
    if (this._currentFrame > this._endFrame) {
      if (this._loop) this._currentFrame = this._startFrame;
      else {
        this._isPlaying = false;
        return;
      }
    }

    // If playback is paused, stop updating
    if (!this._isPlaying) return;

    // If we aren't initialized yet, skip logic but come back next frame
    if (!this._isinitialized) return;

    // If the frame exists in the ring buffer, use it
    if (this._ringBuffer &&
      this._ringBuffer.getFirst() &&
      (this._ringBuffer.getFirst().frameNumber == this._currentFrame || this._ringBuffer.getFirst().frameNumber == 1 + this._currentFrame)) {
      this.bufferGeometry = this._ringBuffer.getFirst().bufferGeometry;
      this.mesh.geometry = this.bufferGeometry;

      this.compressedTexture = this._ringBuffer.getFirst().compressedTexture;
      (this.mesh.material as any).map = this.compressedTexture;
      (this.mesh.material as any).needsUpdate = true;
      this._ringBuffer.remove(0);
      this._currentFrame++;
    } else {
      console.warn('Frame ', this._ringBuffer.getFirst().frameNumber, ' did not exist in ring buffer');
    }

    const player = this;

    setTimeout(function () {
      player.update();
    }, (1000 / player.frameRate) * player.speed);
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
    this.material.opacity = lerp(0, 1, currentTime / fadeTime);
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
    this.material.opacity = lerp(1, 0, currentTime / fadeTime);
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
}
