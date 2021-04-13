// import Blob from 'cross-blob';
import {
  BufferGeometry,
  Float32BufferAttribute, Mesh,
  MeshBasicMaterial, Object3D,
  NoToneMapping,
  PlaneBufferGeometry,
  Renderer,
  Scene,
  sRGBEncoding,
  Uint32BufferAttribute, WebGLRenderer, CanvasTexture
} from 'three';
import {
  IFrameBuffer,
  KeyframeBuffer
} from './Interfaces';

import ReactH265Player from 'h265-wasm-player'


import RingBuffer from './RingBuffer';

type AdvancedHTMLVideoElement = HTMLVideoElement & { requestVideoFrameCallback: (callback: (number, {}) => void) => void };
type onMeshBufferingCallback = (progress:number) => void;
type onFrameShowCallback = (frame:number) => void;

export default class DracosisPlayer {
  // Public Fields
  public frameRate = 30;
  public speed = 1.0; // Multiplied by framerate for final playback output rate

  
  // Three objects
  public scene: Object3D;
  public renderer: Renderer;
  public mesh: Mesh;
  public meshFilePath: String;
  public material: MeshBasicMaterial;
  public failMaterial: MeshBasicMaterial;
  public bufferGeometry: BufferGeometry;

  // Private Fields
  private readonly _scale:number = 1;
  private _prevFrame = 0;
  private currentKeyframe = 0;
  private _loop = true;
  private _isinitialized = false;
  private meshBuffer: RingBuffer<KeyframeBuffer>;
  private iframeVertexBuffer: RingBuffer<IFrameBuffer>;
  private _worker: Worker;
  private _bufferingTimer: any;
  private status:"paused"|"playing"|"buffering"|"error" = 'paused';
  private onMeshBuffering: onMeshBufferingCallback|null = null;
  private onFrameShow: onFrameShowCallback|null = null;

  fileHeader: any;
  tempBufferObject: KeyframeBuffer = {
    frameNumber: 0,
    keyframeNumber: 0,
    bufferGeometry: null
  }

  manifestFilePath: any;
  fetchLoop: any;
  keyframesToBufferBeforeStart: number;
  numberOfKeyframes = 0;
  numberOfIframes = 0;
  canvas: HTMLCanvasElement;
  numberOfFrames: any;
  canvasTex: CanvasTexture;
  player: any;
  ctx: any;

  // public getters and settings
  get currentFrame(): number {
    return this.currentKeyframe;
  }

  get loop(): boolean {
    return this._loop;
  }
  set loop(value: boolean) {
    this._loop = value;
  }

  request
  videoFilePath = ""

  constructor({
    scene,
    renderer,
    meshFilePath,
    videoFilePath,
    targetFramesToRequest = 50,
    frameRate = 25,
    loop = true,
    autoplay = true,
    scale = 1,
    keyframesToBufferBeforeStart = 100,
    video = null,
    onMeshBuffering = null,
    onFrameShow = null
  }:{
    scene: Object3D,
    renderer: WebGLRenderer,
    meshFilePath: string,
    videoFilePath: string,
    targetFramesToRequest?: number,
    frameRate?: number,
    loop?: boolean,
    autoplay?: boolean,
    scale?: number,
    keyframesToBufferBeforeStart?: number,
    video?:any,
    onMeshBuffering?: onMeshBufferingCallback
    onFrameShow?: onFrameShowCallback
  }) {
    this.videoFilePath = videoFilePath;
    this.onMeshBuffering = onMeshBuffering;
    this.onFrameShow = onFrameShow;

    const worker = new Worker(new URL('./workerFunction.ts', import.meta.url)); // spawn new worker
    this._worker = worker;

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

        this.meshBuffer.add({ ...frameData, bufferGeometry: geometry });

        if (this.status === "buffering") {
          // Handle buffering state, check if we buffered enough or report buffering progress
          // TODO: handle our inconsecutive frames loading, now i assume that all previous frames are loaded
          const bufferingSize = this.frameRate * this.keyframesToBufferBeforeStart;
          const bufferedEnough = this.meshBuffer.getPos() > (this.currentKeyframe+bufferingSize);
          const bufferedCompletely = frameData.keyframeBufferObject.keyframeNumber >= (this.numberOfKeyframes - 1);

          if (bufferedEnough || bufferedCompletely) {
            this.status = "playing";
            this.playVideo();
            if (!this.mesh.visible) {
              this.mesh.visible = true;
            }
          } else {
            if (typeof this.onMeshBuffering === "function") {
              // TODO: make progress report based on how many frames loaded (not on index of last loaded)
              this.onMeshBuffering(frameData.keyframeBufferObject.keyframeNumber / (this.currentKeyframe + bufferingSize));
            }
          }
        }
      })
    }

    worker.onmessage = (e) => {
      switch (e.data.type) {
        case 'initialized':
          console.log("Worker initialized");
          break;
        case 'framedata':
          console.log("Frame data received");
          handleFrameData(e.data.payload);
          break;
        case 'completed':
          console.log("Worker complete!");
          break;

      }
    };

    this.keyframesToBufferBeforeStart = keyframesToBufferBeforeStart;
    // Set class values from constructor
    this.scene = scene;
    this.renderer = renderer;
    this.meshFilePath = meshFilePath;
    this.manifestFilePath = meshFilePath.replace('drcs', 'manifest');
    this._loop = loop;
    this._scale = scale;

    this.frameRate = frameRate;


    const div = document.createElement('div')
    document.body.appendChild(div);

    this.canvas = document.createElement('canvas');
    
    this.ctx = this.canvas.getContext("webgl");
    this.canvasTex = new CanvasTexture(this.canvas);
    div.appendChild(this.canvas)


    // TODO: Player
    this.player = null;


    div.style.zIndex = "-10000";
    div.style.position = "absolute";
    div.style.width = "50px";
    div.style.height="50px";
    div.style.top="0"
    // Create a default mesh
    this.material = new MeshBasicMaterial({ map: this.canvasTex });
    this.failMaterial = new MeshBasicMaterial({ color: '#555555' });
    this.mesh = new Mesh(new PlaneBufferGeometry(0.00001, 0.00001), this.material);
    this.mesh.scale.set(this._scale, this._scale, this._scale);
    this.scene.add(this.mesh);

    const xhr = new XMLHttpRequest();
    xhr.onreadystatechange = () => {
      if (xhr.readyState !== 4) return;
      this.fileHeader = JSON.parse(xhr.responseText);
      this.frameRate = this.fileHeader.frameRate;

      // Get count of frames associated with keyframe
      const numberOfIframes = this.fileHeader.frameData.filter(frame => frame.keyframeNumber !== frame.frameNumber).length;
      const numberOfKeyframes = this.fileHeader.frameData.filter(frame => frame.keyframeNumber === frame.frameNumber).length;
      this.numberOfFrames = this.fileHeader.frameData.length;
      this.numberOfIframes = numberOfIframes;
      this.numberOfKeyframes = numberOfKeyframes;

      this.meshBuffer = new RingBuffer(this.numberOfFrames);
      this.iframeVertexBuffer = new RingBuffer(numberOfIframes);

      worker.postMessage({ type: "initialize", payload: { targetFramesToRequest, meshFilePath, numberOfKeyframes: this.numberOfKeyframes, numberOfFrames: this.numberOfFrames, fileHeader: this.fileHeader } }); // Send data to our worker.
      this._isinitialized = true;
    };

    xhr.open('GET', this.manifestFilePath, true); // true for asynchronous
    xhr.send();
  }

  lastTimeReported = 0;
  lastDate = 0;
  delta = 0;
  lastDeltadFrame = 0;
  /**
   * emulated video frame callback
   * bridge from video.timeupdate event to videoUpdateHandler
   * @param {Event} e
   */
  videoAnimationFrame(frame) {

    if (!this._isinitialized) return console.warn("Not inited");
    const frameToPlay = this.fileHeader.frameData[frame].keyframeNumber

      this._prevFrame = frameToPlay;

        this.currentKeyframe = frameToPlay;
        console.log("***** Keyframe to play", this.currentKeyframe)
        console.log("Mesh buffer length is, ", this.meshBuffer.getBufferLength());

        // If keyframe changed, set mesh buffer to new keyframe
        const meshBufferPosition = this.getPositionInKeyframeBuffer(frameToPlay);

        // console.log("Mesh buffer position is: ", meshBufferPosition);

        if (meshBufferPosition === -1) {
          console.log('out of sync');

        }
        if (meshBufferPosition === -1) {
          this.status = "buffering";

          if (typeof this.onMeshBuffering === "function") {
            this.onMeshBuffering(0);
          }

          this.mesh.material = this.failMaterial;
        } else {
          this.mesh.material = this.material;
          this.mesh.geometry = this.meshBuffer.get(meshBufferPosition).bufferGeometry as BufferGeometry;
          if (typeof this.onFrameShow === "function") {
            this.onFrameShow(frameToPlay);
          }
        }
      
      (this.mesh.material as any).needsUpdate = true;
  }

  // Start loop to check if we're ready to play
  play() {
    console.log("PLAYING!");
    this.playVideo();
    
    const buffering = setInterval(() => {
      if (this.meshBuffer && this.meshBuffer.getBufferLength() >= this.keyframesToBufferBeforeStart) {
        // console.log("Keyframe buffer length is ", this.meshBuffer.getBufferLength(), ", playing video");
        clearInterval(buffering);
        this.mesh.visible = true
      }

    }, 1000 / 60);
    this._bufferingTimer = buffering;
  }

  getPositionInKeyframeBuffer(keyframeNumber: number): number {
    // Search backwards, which should make the for loop shorter on longer buffer
    for (let i = this.meshBuffer.getBufferLength(); i >= 0; i--) {
      if (
        this.meshBuffer.get(i) &&
        keyframeNumber == this.meshBuffer.get(i).frameNumber &&
        keyframeNumber == this.meshBuffer.get(i).keyframeNumber
      )
        return i;
    }
    return -1;
  }

  getPositionInIFrameBuffer(frameNumber: number): number {
    // Search backwards, which should make the for loop shorter on longer buffer
    for (let i = this.iframeVertexBuffer.getBufferLength(); i >= 0; i--) {
      if (
        this.iframeVertexBuffer.get(i) &&
        frameNumber == this.iframeVertexBuffer.get(i).frameNumber
      )
        return i;
    }
    return -1;
  }

  
          playVideo = () => {

              this.player.play()
              
          }
  

  dispose(): void {
    // TODO: finish dispose method
    this._isinitialized = false;
    this._worker?.terminate();
    if (this.meshBuffer) {
      for (let i = 0; i < this.meshBuffer.getBufferLength(); i++) {
        const buffer = this.meshBuffer.get(i);
        if (buffer && buffer.bufferGeometry instanceof BufferGeometry) {
          buffer.bufferGeometry?.dispose();
        }
      }
      this.meshBuffer.clear();
    }
    if (this._bufferingTimer) {
      clearInterval(this._bufferingTimer);
    }
  }
}