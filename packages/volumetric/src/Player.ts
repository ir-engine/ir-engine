// import fs from 'fs';
import { Howl } from 'howler';
import {
  BufferGeometry,

  CompressedTexture,










  Float32BufferAttribute, Mesh, MeshBasicMaterial,














  NearestFilter, PlaneBufferGeometry, Renderer,



















  RepeatWrapping, Scene,

















  sRGBEncoding, Uint16BufferAttribute,
  Uint32BufferAttribute, VideoTexture
} from 'three';
import { BasisTextureLoader } from 'three/examples/jsm/loaders/BasisTextureLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import CortoDecoder from './corto/cortodecoder.js';
import { MessageType } from './Enums';
import {
  Action,

  IBufferGeometryCompressedTexture,
  WorkerDataRequest,

  WorkerInitializationResponse
} from './Interfaces';
import RingBuffer from './RingBuffer';
import { lerp } from './Utilities';
const worker = new Worker('./Worker.js');

// Class draco / basis player
export default class DracosisPlayer {
  // Public Fields
  public frameRate = 30;
  public speed = 1.0; // Multiplied by framerate for final playback output rate

  // Three objects
  public scene: Scene;
  public renderer: Renderer;
  public mesh: Mesh;
  public filePath: String;
  public material: any;
  public bufferGeometry: BufferGeometry;
  public compressedTexture: CompressedTexture;
  public dracoLoader = new DRACOLoader();

  // Private Fields
  private _startFrame = 1;
  private _scale = 1;
  private _endFrame = 0;
  private _prevFrame = 0;
  private _renderFrame = 0;
  private _renderCount = 0;

  private _frameTime = 0;
  private _elapsedTime = 0;
  private _prevTime = 0;
  private _numberOfFrames = 0;
  private _bufferSize = 99;
  private _audio = Howl;
  private _currentFrame = 1;
  private _video = null;
  private _videoTexture = null;
  private _loop = true;
  private _playOnStart = true;
  private _isinitialized = false;
  private _onLoaded: any; // External callback when volumetric is loaded
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
  // private _framesUpdated = 0; // TODO: Remove after debug
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
    worker.postMessage({
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
    worker.postMessage({
      type: MessageType.SetEndFrameRequest,
      value,
    } as Action);
  }

  get loop(): boolean {
    return this._loop;
  }
  set loop(value: boolean) {
    this._loop = value;
    worker.postMessage({ type: MessageType.SetLoopRequest, value } as Action);
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
    filePath,
    onLoaded,
    playOnStart = true,
    loop = true,
    startFrame = 1,
    endFrame = -1,
    frameRate = 30,
    speedMultiplier = 1,
    scale = 1,
    bufferSize = 99,
    serverUrl,
    audioUrl
  }) {
    this.scene = scene;
    this.renderer = renderer;
    this.filePath = filePath;
    this._onLoaded = onLoaded;
    this._loop = loop;
    this._scale = scale;
    this.speed = speedMultiplier;
    this._startFrame = startFrame;
    this._playOnStart = playOnStart;
    this._currentFrame = startFrame;
    this._bufferSize = bufferSize;
    // this._audio = new Howl({
    //     src: audioUrl,
    //     format: ['mp3']
    // });
    this._video = document.createElement('video');
    this._video.src = 'http://localhost:3000/morgan-sound.mp4';
    this._videoTexture = new VideoTexture(this._video);

    this._video.requestVideoFrameCallback(this.videoUpdateHandler.bind(this));
    
    document.body.appendChild(this._video);

    this.bufferGeometry = new PlaneBufferGeometry(1, 1);
    this.material = new MeshBasicMaterial({map:this._videoTexture});
    // this is to debug UVs
    //@ts-ignore
    // this.material = new ShaderMaterial({
    //   uniforms: {
    //     map: { value: null},
    //   },
    //   // wireframe: true,
    //   // transparent: true,
    //   vertexShader: `
    //   varying vec2 vUv;
    //   void main() {
    //     vUv = uv;
    //     gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
    //   }`,
    //   fragmentShader: `
    //   varying vec2 vUv;
    //   uniform sampler2D map;
    //   void main()  {
    //     gl_FragColor = vec4(vUv,0.0,1.);
    //     // gl_FragColor = vec4(1.,0.,0.0,1.);
    //     gl_FragColor = texture2D(map,vUv);
    //   }`
    // });
    this.mesh = new Mesh(this.bufferGeometry, this.material);
    this.mesh.scale.set(this._scale,this._scale,this._scale)
    // console.log(this.scene,'this.scene');
    
    this.scene.add(this.mesh);

    this._basisTextureLoader.setTranscoderPath(
      'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/js/libs/basis/'
    );
    this._basisTextureLoader.detectSupport(renderer);
    let player = this;
    let dracoUrl = serverUrl + '/dracosis';
      dracoUrl = filePath;

    this.httpGetAsync(dracoUrl, function (data: any) {
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
        filePath: data.filePath,
        fileHeader: data.fileHeader,
        isInitialized: true,
        readStreamOffset: data.readStreamOffset,
      };

      worker.postMessage(initializeMessage);

      // Add event handler for manging worker responses
      worker.addEventListener('message', ({ data }) => {
        player.handleMessage(data);
      });
    });
  }

  decodeCORTOData(rawBuffer: Buffer) {
    let decoder = new CortoDecoder(rawBuffer,null,null);
    let meshData = decoder.decode();
    // Import data to Three JS geometry.
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
    // geometry.computeVertexNormals();
    return geometry;
  }

  async decodeTexture(compressedTexture, frameNumber) {
    var decodedTexture;

    // debug decoded image
    // console.log(compressedTexture, 'in decodeTexture compressedTexture');
    // let blob = new Blob([compressedTexture]);
    // let link = document.createElement('a');
    // link.href = window.URL.createObjectURL(blob);
    // let fileName = 'imageTexture.basis';
    // link.download = fileName;
    // link.click()
    // let that = this;

    await this._basisTextureLoader
      //@ts-ignore
      ._createTexture(compressedTexture, frameNumber.toString())
      .then(function (texture, param) {
        texture.magFilter = NearestFilter;
        texture.minFilter = NearestFilter;
        texture.encoding = sRGBEncoding;
        // texture.encoding = LinearEncoding;
        texture.wrapS = RepeatWrapping;
        texture.wrapT = RepeatWrapping;
        texture.repeat.y = -1;
        decodedTexture = texture;
        // debug random texture here
        // decodedTexture = new TextureLoader().load('https://images.unsplash.com/photo-1599687350404-88b32c067289?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=800&q=60');
        // console.log('succesfully decoded texture');
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
      this.handleBuffers(this);
      // if (this._playOnStart) this.play();
      console.log('Received initialization response from worker');
    } else console.error('Initialization failed');
  }

  handleDataResponse(data) {
    // For each object in the array...

    const player = this;

    var count = 0;

    data.forEach((geomTex, index) => {
      player._frameNumber = geomTex.frameNumber;

      // Find the frame in our circular buffer
      player._pos = player.getPositionInBuffer(player._frameNumber);

      player._ringBuffer.get(
        player._pos
      ).bufferGeometry = player.decodeCORTOData(geomTex.bufferGeometry);

      // player
      //   .decodeTexture(geomTex.compressedTexture, geomTex.frameNumber)
      //   .then(({ texture, frameNumber }) => {
      //     var pos = player.getPositionInBuffer(frameNumber);
      //     player._ringBuffer.get(pos).compressedTexture = texture;
      //     if (!player._isPlaying && count < this._bufferSize) count++;
      //     // @todo create some bufferReady flag, to know when buffer is filled
      //     // if (count == this._bufferSize) this.play();
      //   });

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

  handleBuffers(context) {
    // If not initialized, skip.
    if (!this._isinitialized) return setTimeout(this.handleBuffers, 100);
    // Clear the buffers

    while (true) {
      // Peek the current frame. if it's frame number is below current frame, trash it
      if (
        !this._ringBuffer ||
        !this._ringBuffer.getFirst() ||
        this._ringBuffer.getFirst().frameNumber >= this._currentFrame
      )
        break;

      // if it's equal to or greater than current frame, break the loop
      this._ringBuffer.remove(0);
      this._numberOfBuffersRemoved++;
    }

    if (this._numberOfBuffersRemoved > 0)
      console.warn(
        'Removed ' +
          this._numberOfBuffersRemoved +
          ' since they were skipped in playback'
      );

    const framesToFetch: number[] = [];
    if (this._ringBuffer.empty() && this._currentFrame==0) {
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
      let lastFrame =
        (this._ringBuffer.getLast() &&
          this._ringBuffer.getLast().frameNumber) ||
        Math.max(this._currentFrame-1,0);
      if(this._ringBuffer.getLast()) lastFrame = this._ringBuffer.getLast().frameNumber;
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

    if (framesToFetch.length > 0) worker.postMessage(fetchFramesMessage);

    const player = this;

    // Every 2 second, make sure our workers are working
    // setTimeout(function () {
    //   player.handleBuffers(player);
    // }, 16.6*4);
  }

  showFrame(frame: number){
    if (!this._isinitialized) return;

    if(!this._ringBuffer || !this._ringBuffer.getFirst()) return;

    
    // console.log('playing frame---------',frame);
    let frameToPlay = frame%this._endFrame ;

    this.cleanBeforeNeeded(frameToPlay);
    
    if (
      this._ringBuffer.getFirst().frameNumber == frameToPlay
    ) {
      // console.log('+++we have frame',this._ringBuffer.getFirst().frameNumber);

      this.bufferGeometry = this._ringBuffer.getFirst().bufferGeometry;
      this.mesh.geometry = this.bufferGeometry;

      this.compressedTexture = this._ringBuffer.getFirst().compressedTexture;
      // @ts-ignore
      // this.mesh.material.map = this.compressedTexture;
      // @ts-ignore
      this.mesh.material.needsUpdate = true;
      // console.log(this.mesh);
      

      
    } else{
      // console.log('---we dont have needed frame', this._ringBuffer.getFirst().frameNumber);
    }
  }

  cleanBeforeNeeded(frameToPlay:number) {
    const maxDeleteConstant = 50;
    let index = 0;
    while(this._ringBuffer.getFirst().frameNumber !== frameToPlay && index<maxDeleteConstant){
      index++;
      // console.log('deleting frame no ',this._ringBuffer.getFirst().frameNumber );
      this._ringBuffer.remove(0);
    }
  }

  update() {
    


    // Loop logic
    if (this._currentFrame > this._endFrame) {
      // if (this._loop) this._currentFrame = 0;
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
    if (
      this._ringBuffer &&
      this._ringBuffer.getFirst() &&
      (this._ringBuffer.getFirst().frameNumber == this._currentFrame || this._ringBuffer.getFirst().frameNumber == 1+this._currentFrame)
    ) {
      this.bufferGeometry = this._ringBuffer.getFirst().bufferGeometry;
      // this.bufferGeometry = this._ringBuffer.get(this._currentFrame).bufferGeometry
      this.mesh.geometry = this.bufferGeometry;

      this.compressedTexture = this._ringBuffer.getFirst().compressedTexture;
      // @ts-ignore
      this.mesh.material.map = this.compressedTexture;
      // this.mesh.material.uniforms.map.value = this.compressedTexture;
      // @ts-ignore
      this.mesh.material.needsUpdate = true;


      this._ringBuffer.remove(0);
      this._currentFrame++;
    } else {
      // Frame doesn't exist in ring buffer, so throw an error
      // console.warn(
      //   'Frame ' +
      //     this._ringBuffer.getFirst().frameNumber +
      //     ' did not exist in ring buffer'
      // );
      // console.log('frame did not exist yet');
    }

    const player = this;
    // console.log('from update');
    
    setTimeout(function () {
      player.update();
    }, (1000 / player.frameRate) * player.speed);
  }

  play() {
    // this._isPlaying = true;
    this.show();
    // this.update();
    // this.render();
    // this._audio.play()
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
    // this.handleBuffers();
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

  videoUpdateHandler(now,metadata){
    
    let frameToPlay =  metadata.presentedFrames -1 ;
    // console.log(frameToPlay,'frameToPlay',now,metadata);
    console.log('==========DIFF',Math.round(this._video.currentTime*30), Math.round(metadata.mediaTime*30),metadata.presentedFrames,metadata);
    
    if(frameToPlay!==this._prevFrame){
      this.showFrame(frameToPlay)
      this._prevFrame = frameToPlay;
      this.handleBuffers(this);
    }
    this._video.requestVideoFrameCallback(this.videoUpdateHandler.bind(this));
  }

  render(){
    this._renderFrame++;
    // console.log(this._video.currentTime,'curtime');
    
    // let frameToPlay = 40 + Math.round(this._audio.seek()*30) || 0;
    let frameToPlay =  Math.floor(this._video.currentTime*30) || 0;
    if(this._renderFrame%2===0 || !this._isPlaying){
      console.log(frameToPlay,'frametoplay');
      this.showFrame(frameToPlay)
    }
    
    // if(this._renderCount%2===0 || !this._isPlaying){
    //   this._renderFrame++;
    //   frameToPlay = this._renderFrame;
    //   // console.log(frameToPlay,'frametoplay');
    //   this.showFrame(frameToPlay)
    // }
    window.requestAnimationFrame(this.render.bind(this))
  }

}
