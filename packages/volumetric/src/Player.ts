import {
  BufferGeometry,
  Float32BufferAttribute,
  Mesh,
  MeshBasicMaterial,
  Object3D,
  PlaneBufferGeometry,
  Renderer,
  sRGBEncoding,
  Texture,
  Uint32BufferAttribute,
  WebGLRenderer
} from 'three';
import {
  KeyframeBuffer
} from './Interfaces';
import { moduloBy, createElement } from './utils';

type AdvancedHTMLVideoElement = HTMLVideoElement & { requestVideoFrameCallback: (callback: (number, { }) => void) => void };
type onMeshBufferingCallback = (progress: number) => void;
type onFrameShowCallback = (frame: number) => void;
type onRenderingCallback = () => void;

export default class Player {
  // Public Fields
  public frameRate: number = 30;
  public speed: number = 1.0; // Multiplied by framerate for final playback output rate
  public loop: boolean = true;
  public encoderWindowSize = 8; // length of the databox
  public encoderByteLength = 16;
  public videoSize = 1024;

  // Three objects
  public scene: Object3D;
  public renderer: Renderer;
  public mesh: Mesh;
  public meshFilePath: String;
  public material: MeshBasicMaterial;
  public failMaterial: MeshBasicMaterial;
  public bufferGeometry: BufferGeometry;

  // Private Fields
  private readonly _scale: number = 1;
  private _video: HTMLVideoElement | AdvancedHTMLVideoElement = null;
  private _videoTexture = null;
  private meshBuffer: Map<number, BufferGeometry> = new Map();
  private _worker: Worker;
  private onMeshBuffering: onMeshBufferingCallback | null = null;
  private onFrameShow: onFrameShowCallback | null = null;
  private rendererCallback: onRenderingCallback | null = null;
  fileHeader: any;
  tempBufferObject: BufferGeometry;

  private manifestFilePath: any;
  private counterCtx: CanvasRenderingContext2D;
  private actorCtx: CanvasRenderingContext2D;

  private numberOfFrames: any;
  private actorCanvas: HTMLCanvasElement;
  currentFrame: number = 0;
  lastFrameRequested: number = 0;
  targetFramesToRequest: number = 30;

  bufferLoop = () => {
    const minimumBufferLength = this.targetFramesToRequest * 2;
    const meshBufferHasEnoughToPlay = this.meshBuffer.size >= minimumBufferLength;

    if (meshBufferHasEnoughToPlay) {
      if(this._video.paused && this.hasPlayed)
        this._video.play();
    }
    else {
      if (moduloBy(this.lastFrameRequested - this.currentFrame, this.numberOfFrames) <= minimumBufferLength * 2) {
        const newLastFrame = Math.max(this.lastFrameRequested + minimumBufferLength, this.lastFrameRequested + this.targetFramesToRequest) % this.numberOfFrames;
        const payload = {
          frameStart: this.lastFrameRequested,
          frameEnd: newLastFrame
        }
        console.log("Posting request", payload);
        this._worker.postMessage({ type: "request", payload }); // Send data to our worker.
        this.lastFrameRequested = newLastFrame;

        if (!meshBufferHasEnoughToPlay && typeof this.onMeshBuffering === "function") {
          // console.log('buffering ', this.meshBuffer.size / minimumBufferLength,',  have: ', this.meshBuffer.size, ', need: ', minimumBufferLength )
          this.onMeshBuffering(this.meshBuffer.size / minimumBufferLength);
        }
      }
    }

    const oldFrames = [];
    this.meshBuffer.forEach((value, key) => {
      // If key is between current keyframe and last requested, don't delete
      const isOnLoop = this.lastFrameRequested < this.currentFrame;

      if ((isOnLoop && (key > this.lastFrameRequested && key < this.currentFrame)) ||
        (!isOnLoop && key < this.currentFrame)) {
          console.log("Destroying", key);
        oldFrames.push(key);
      }
    })
    oldFrames.forEach(frameNumber => {
      const buffer = this.meshBuffer.get(frameNumber);
      if (buffer && buffer instanceof BufferGeometry) {
        buffer?.dispose();
      }
      this.meshBuffer.delete(frameNumber);
    })

    requestAnimationFrame(() => this.bufferLoop());
  }

  hasPlayed: boolean;

  constructor({
    scene,
    renderer,
    meshFilePath,
    videoFilePath,
    targetFramesToRequest = 90,
    frameRate = 30,
    loop = true,
    scale = 1,
    encoderWindowSize = 8,
    encoderByteLength = 16,
    videoSize = 1024,
    video = null,
    onMeshBuffering = null,
    onFrameShow = null,
    rendererCallback = null
  }: {
    scene: Object3D,
    renderer: WebGLRenderer,
    meshFilePath: string,
    videoFilePath: string,
    targetFramesToRequest?: number,
    frameRate?: number,
    loop?: boolean,
    autoplay?: boolean,
    scale?: number,
    video?: any,
    encoderWindowSize?: number,
    encoderByteLength?: number,
    videoSize?: number,
    onMeshBuffering?: onMeshBufferingCallback
    onFrameShow?: onFrameShowCallback,
    rendererCallback?: onRenderingCallback
  }) {

    this.onMeshBuffering = onMeshBuffering;
    this.onFrameShow = onFrameShow;
    this.rendererCallback = rendererCallback;

    this.encoderWindowSize = encoderWindowSize;
    this.encoderByteLength = encoderByteLength;
    this.videoSize = videoSize;

    this.targetFramesToRequest = targetFramesToRequest;

    const worker = new Worker(new URL('./workerFunction.ts', import.meta.url)); // spawn new worker
    this._worker = worker;

    this.scene = scene;
    this.renderer = renderer;
    this.meshFilePath = meshFilePath;
    this.manifestFilePath = meshFilePath.replace('drcs', 'manifest');
    this.loop = loop;
    this._scale = scale;
    this._video = video ?? createElement('video', {
      crossorigin: "",
      playsInline: "true",
      loop: true,
      src: videoFilePath,
      style: {
        display: "none",
        position: 'fixed',
        zIndex: '-1',
        top: '0',
        left: '0',
        width: '1px'
      },
      playbackRate: 1
    });

    this._video.setAttribute('crossorigin', '');

    this.frameRate = frameRate;

    const counterCanvas = document.createElement('canvas') as HTMLCanvasElement;
    counterCanvas.width = this.encoderByteLength;
    counterCanvas.height = 1;

    this.counterCtx = counterCanvas.getContext('2d');
    this.actorCanvas = document.createElement('canvas')
    this.actorCtx = this.actorCanvas.getContext('2d');

    this.actorCtx.canvas.width = this.actorCtx.canvas.height = this.videoSize;
    this.counterCtx.canvas.setAttribute('crossOrigin', 'Anonymous');
    this.actorCtx.canvas.setAttribute('crossOrigin', 'Anonymous');

    this.actorCtx.fillStyle = '#ACC';
    this.actorCtx.fillRect(0, 0, this.actorCtx.canvas.width, this.actorCtx.canvas.height);

    this._videoTexture = new Texture(this.actorCtx.canvas);
    this._videoTexture.encoding = sRGBEncoding;
    this.material = new MeshBasicMaterial({ map: this._videoTexture });

    this.failMaterial = new MeshBasicMaterial({ color: '#555555' });
    this.mesh = new Mesh(new PlaneBufferGeometry(0.00001, 0.00001), this.material);
    this.mesh.scale.set(this._scale, this._scale, this._scale);
    this.scene.add(this.mesh);


    const handleFrameData = (messages) => {
      messages.forEach(frameData => {
        let geometry = new BufferGeometry();
        geometry.setIndex(
          new Uint32BufferAttribute(frameData.bufferGeometry.index, 1)
        );
        geometry.setAttribute(
          'position',
          new Float32BufferAttribute(frameData.bufferGeometry.position, 3)
        );
        geometry.setAttribute(
          'uv',
          new Float32BufferAttribute(frameData.bufferGeometry.uv, 2)
        );

        this.meshBuffer.set(frameData.keyframeNumber, geometry );
      })

      if (typeof this.onMeshBuffering === "function") {
        const minimumBufferLength = this.targetFramesToRequest * 2;
        // console.log('buffering ', this.meshBuffer.size / minimumBufferLength,',  have: ', this.meshBuffer.size, ', need: ', minimumBufferLength )
        this.onMeshBuffering(this.meshBuffer.size / minimumBufferLength);
      }
    }

    worker.onmessage = (e) => {
      switch (e.data.type) {
        case 'initialized':
          console.log("Worker initialized");
          this.bufferLoop();
          break;
        case 'framedata':
          handleFrameData(e.data.payload);
          break;
      }
    };

    const xhr = new XMLHttpRequest();
    xhr.onreadystatechange = () => {
      if (xhr.readyState !== 4) return;
      this.fileHeader = JSON.parse(xhr.responseText);
      this.frameRate = this.fileHeader.frameRate;

      // Get count of frames associated with keyframe
      this.numberOfFrames = this.fileHeader.frameData.length;

      worker.postMessage({ type: "initialize", payload: { targetFramesToRequest, meshFilePath, numberOfFrames: this.numberOfFrames, fileHeader: this.fileHeader } }); // Send data to our worker.
    };

    xhr.open('GET', this.manifestFilePath, true); // true for asynchronous
    xhr.send();
  }

  /**
   * emulated video frame callback
   * bridge from video.timeupdate event to videoUpdateHandler
   * @param cb
   */
  handleRender(cb?: onRenderingCallback) {
    if (!this.fileHeader || this._video.currentTime === 0 || this._video.paused)
      return;

    this.actorCtx.clearRect(0, 0, this._video.width, this._video.height);
    this.actorCtx.drawImage(this._video, 0, 0);

    this.counterCtx.clearRect(0, 0, this._video.width, this._video.height);

    this.counterCtx.drawImage(
      this.actorCtx.canvas,
      0,
      this.videoSize - (this.encoderWindowSize / 2),
      this.encoderWindowSize * this.encoderByteLength,
      (this.encoderWindowSize / 2),
      0,
      0,
      this.encoderByteLength, 1);

    const imgData = this.counterCtx.getImageData(0, 0, this.encoderByteLength, 1);

    let frameToPlay = 0;
    for (let i = 0; i < this.encoderByteLength; i++) {
      frameToPlay += Math.round(imgData.data[i * 4] / 255) * Math.pow(2, i);
    }

    this._videoTexture.needsUpdate = true;

    frameToPlay = Math.max(frameToPlay - 1, 0);

    const hasFrame = this.meshBuffer.has(frameToPlay);
    // If keyframe changed, set mesh buffer to new keyframe

    if (!hasFrame) {
      if (!this._video.paused) {
        this._video.pause();
      }
      if (typeof this.onMeshBuffering === "function") {
        this.onMeshBuffering(0);
      }
      this.mesh.material = this.failMaterial;
    } else {
      this.mesh.material = this.material;
      this.material.needsUpdate = true;

      this.mesh.material.needsUpdate = true;

      this.mesh.geometry = this.meshBuffer.get(frameToPlay) as BufferGeometry;
      this.mesh.geometry.attributes.position.needsUpdate = true;
      (this.mesh.geometry as any).needsUpdate = true;

      this.currentFrame = frameToPlay;

      if (typeof this.onFrameShow === "function") {
        this.onFrameShow(frameToPlay);
      }
      if(this.rendererCallback) this.rendererCallback();
      if(cb) cb();

    }
  }

  // Start loop to check if we're ready to play
  play() {
    this.hasPlayed = true;
    this._video.playsInline = true;
        this.mesh.visible = true
        this._video.play()
  }

  dispose(): void {
    this._worker?.terminate();
    if (this._video) {
      this._video = null;
      this._videoTexture.dispose();
      this._videoTexture = null;
    }
    if (this.meshBuffer) {
      for (let i = 0; i < this.meshBuffer.size; i++) {
        const buffer = this.meshBuffer.get(i);
        if (buffer && buffer instanceof BufferGeometry) {
          buffer?.dispose();
        }
      }
      this.meshBuffer.clear();
    }
  }
}
