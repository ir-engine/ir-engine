import { createElement } from "@xr3ngine/engine/src/ecs/functions/createElement";
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
import RingBuffer from './RingBuffer';
import Worker from './workerFunction?worker'

type AdvancedHTMLVideoElement = HTMLVideoElement & { requestVideoFrameCallback: (callback: (number, { }) => void) => void };
type onMeshBufferingCallback = (progress: number) => void;
type onFrameShowCallback = (frame: number) => void;

const boxLength = 8; // length of the databox
const byteLength = 16;
const videoSize = 1024;

export default class CanvasPlayer {
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
  private readonly _scale: number = 1;
  private _prevFrame = 0;
  private currentKeyframe = 0;
  private _video: HTMLVideoElement | AdvancedHTMLVideoElement = null;
  private _videoTexture = null;
  private _loop = true;
  private meshBuffer: RingBuffer<KeyframeBuffer>;
  private _worker: Worker;
  private _bufferingTimer: any;
  private status: "paused" | "playing" | "buffering" | "error" = 'paused';
  private onMeshBuffering: onMeshBufferingCallback | null = null;
  private onFrameShow: onFrameShowCallback | null = null;

  fileHeader: any;
  tempBufferObject: KeyframeBuffer = {
    frameNumber: 0,
    keyframeNumber: 0,
    bufferGeometry: null
  }

  manifestFilePath: any;
  fetchLoop: any;
  framesToBufferBeforeStart: number;
  totalFrames = 0;
  counterCtx: CanvasRenderingContext2D;
  actorCtx: CanvasRenderingContext2D;

  numberOfFrames: any;
  actorCanvas: HTMLCanvasElement;

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

  currentEncode = false;
  textureBatchChanged = false;

  lastTimeReported = 0;
  lastDate = -1;
  delta = 0;
  lastDeltadFrame = 0;

  constructor({
    scene,
    renderer,
    meshFilePath,
    videoFilePath,
    targetFramesToRequest = 50,
    frameRate = 30,
    loop = true,
    autoplay = true,
    scale = 1,
    keyframesToBufferBeforeStart = 100,
    video = null,
    onMeshBuffering = null,
    onFrameShow = null
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
    keyframesToBufferBeforeStart?: number,
    video?: any,
    onMeshBuffering?: onMeshBufferingCallback
    onFrameShow?: onFrameShowCallback
  }) {

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
          const bufferingSize = this.framesToBufferBeforeStart;
          const bufferedEnough = this.meshBuffer.getPos() > (this.currentKeyframe + bufferingSize);
          const bufferedCompletely = frameData.keyframeNumber >= (this.totalFrames - 1);

          if (bufferedEnough || bufferedCompletely) {
            this.status = "playing";
            this._video.play();
            if (!this.mesh.visible) {
              this.mesh.visible = true;
            }
          } else {
            if (typeof this.onMeshBuffering === "function") {
              // TODO: make progress report based on how many frames loaded (not on index of last loaded)
              this.onMeshBuffering(frameData.keyframeNumber / (this.currentKeyframe + bufferingSize));
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
          // console.log("Frame data received");
          handleFrameData(e.data.payload);
          break;
        case 'completed':
          console.log("Worker complete!");
          break;

      }
      // console.log('Worker said: ', e.data); // message received from worker
    };

    this.framesToBufferBeforeStart = keyframesToBufferBeforeStart;
    // Set class values from constructor
    this.scene = scene;
    this.renderer = renderer;
    this.meshFilePath = meshFilePath;
    this.manifestFilePath = meshFilePath.replace('drcs', 'manifest');
    this._loop = loop;
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

    // Create a default mesh

    const counterCanvas = document.createElement('canvas') as HTMLCanvasElement;
    counterCanvas.width = byteLength;
    counterCanvas.height = 1;

    this.counterCtx = counterCanvas.getContext('2d');
    this.actorCanvas = document.createElement('canvas')
    this.actorCtx = this.actorCanvas.getContext('2d');
    
    this.actorCtx.canvas.width = this.actorCtx.canvas.height = videoSize;
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

    const xhr = new XMLHttpRequest();
    xhr.onreadystatechange = () => {
      if (xhr.readyState !== 4) return;
      this.fileHeader = JSON.parse(xhr.responseText);
      this.frameRate = this.fileHeader.frameRate;

      // Get count of frames associated with keyframe
      const numberOfKeyframes = this.fileHeader.frameData.filter(frame => frame.keyframeNumber === frame.frameNumber).length;
      this.numberOfFrames = this.fileHeader.frameData.length;
      this.totalFrames = numberOfKeyframes;

      this.meshBuffer = new RingBuffer(this.numberOfFrames);
      worker.postMessage({ type: "initialize", payload: { targetFramesToRequest, meshFilePath, numberOfKeyframes: this.totalFrames, numberOfFrames: this.numberOfFrames, fileHeader: this.fileHeader } }); // Send data to our worker.
    };

    xhr.open('GET', this.manifestFilePath, true); // true for asynchronous
    xhr.send();
  }

  lastFramePlayed = -1

  /**
   * emulated video frame callback
   * bridge from video.timeupdate event to videoUpdateHandler
   * @param {Event} e
   */
  handleRender(renderer, scene, camera) {
    if (!this.fileHeader || this._video.currentTime === 0 || this._video.paused) return console.log("Nope")

    this.actorCtx.drawImage(this._video, 0, 0);

    this.counterCtx.drawImage(this.actorCtx.canvas, 0, videoSize - (boxLength / 2), boxLength * byteLength, (boxLength / 2), 0, 0, byteLength, 1);
    const imgData = this.counterCtx.getImageData(0, 0, byteLength, 1);

    let frameToPlay = 0;
    for (let i = 0; i < byteLength; i++) {
      frameToPlay += Math.round(imgData.data[i * 4] / 255) * Math.pow(2, i);
    }

    this._videoTexture.needsUpdate = true;

    // if (frameToPlay === this.lastFramePlayed) return;
    // this.lastFramePlayed = frameToPlay;

    frameToPlay = Math.max(frameToPlay - 1, 0);

    // If keyframe changed, set mesh buffer to new keyframe
    const meshBufferPosition = this.getPositionInFrameBuffer(frameToPlay);

    if (meshBufferPosition === -1) {
      this.status = "buffering";
      if (!this._video.paused) {
        this._video.pause();
      }
      if (typeof this.onMeshBuffering === "function") {
        this.onMeshBuffering(0);
      }
      // this.mesh.visible = false;
      // this._video.pause();
      this.mesh.material = this.failMaterial;
    } else {
      this.mesh.material = this.material;
      this.material.needsUpdate = true;

      this.mesh.material.needsUpdate = true;

      this.mesh.geometry = this.meshBuffer.get(meshBufferPosition).bufferGeometry as BufferGeometry;
      this.mesh.geometry.attributes.position.needsUpdate = true;
      (this.mesh.geometry as any).needsUpdate = true;

      if (typeof this.onFrameShow === "function") {
        this.onFrameShow(frameToPlay);
      }
      renderer.render(scene, camera);

    }
  }

  // Start loop to check if we're ready to play
  play() {
    this._video.playsInline = true;

    this._video.play()

    // console.log("Playing")
    const buffering = setInterval(() => {
      if (this.meshBuffer && this.meshBuffer.getBufferLength() >= this.framesToBufferBeforeStart) {
        // console.log("Keyframe buffer length is ", this.meshBuffer.getBufferLength(), ", playing video");
        clearInterval(buffering);
        // this._video.play()
        this.mesh.visible = true
      }

    }, 1000 / 60);
    this._bufferingTimer = buffering;
  }

  getPositionInFrameBuffer(keyframeNumber: number): number {
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

  dispose(): void {
    // TODO: finish dispose method
    this._worker?.terminate();
    if (this._video) {
      this._video = null;
      this._videoTexture.dispose();
      this._videoTexture = null;
    }
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
