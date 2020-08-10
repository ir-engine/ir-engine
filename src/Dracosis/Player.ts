// import fs from 'fs';
import * as draco3d from 'draco3d';
import { byteArrayToLong, lerp } from '../Shared/Utilities';
import {
  Action,
  IFileHeader,
  IBufferGeometryCompressedTexture,
  WorkerDataRequest,
  WorkerInitializationRequest,
  WorkerInitializationResponse,
} from './Interfaces';
import RingBuffer from './RingBuffer';
import {
  Scene,
  BufferGeometry,
  SphereBufferGeometry,
  CompressedTexture,
  BoxBufferGeometry,
  MeshBasicMaterial,
  MeshStandardMaterial,
  MeshPhongMaterial,
  Mesh,
  Uint16BufferAttribute,
  Uint32BufferAttribute,
  Float32BufferAttribute,
} from 'three';
import { BasisTextureLoader } from 'three/examples/jsm/loaders/BasisTextureLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
// import { ReadStream } from 'fs';
import ReadStream from 'fs-readstream-seek';
import { MessageType } from './Enums';
import * as CodecHelpers from './CodecHelpers';

const worker = new Worker('./Worker.js');

// Class draco / basis player
export default class DracosisPlayer {
  // Public Fields
  public frameRate = 30;
  public speed = 1.0; // Multiplied by framerate for final playback output rate

  // Three objects
  public scene: Scene;
  public mesh: Mesh;
  public material: MeshPhongMaterial;
  public bufferGeometry: BufferGeometry;
  public compressedTexture: CompressedTexture;
  public dracoLoader = new DRACOLoader();

  // Private Fields
  private _startFrame = 0;
  private _endFrame = 0;
  private _numberOfFrames = 0;
  private _currentFrame = 0;
  private _loop = true;
  private _playOnStart = true;
  private _isinitialized = false;
  private _onLoaded: any; // External callback when volumetric is loaded
  private _ringBuffer: RingBuffer<IBufferGeometryCompressedTexture>;
  private _dataBufferSize = 100;
  private _filePath: string;
  private _isPlaying = false;
  private _fileHeader: IFileHeader;

  private _fileReadStream: ReadStream;
  private _readStreamOffset = 0;
  private _basisTextureLoader = new BasisTextureLoader();
  private _decoderModule = draco3d.createDecoderModule({});
  private _encoderModule = draco3d.createEncoderModule({});

  private _nullBufferGeometry = new BufferGeometry();
  private _nullCompressedTexture = new CompressedTexture(
    [new ImageData(200, 200)],
    0,
    0
  );

  // Temp variables -- reused in loops, etc (beware of initialized value!)
  private _pos = 0;
  private _frameNumber = 0;
  private _framesUpdated = 0; // TODO: Remove after debug
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

  constructor(
    scene: any,
    filePath: string,
    onLoaded: any,
    playOnStart = true,
    loop = true,
    startFrame = 0,
    endFrame = -1,
    speedMultiplier = 1,
    bufferSize = 100
  ) {
    this.scene = scene;
    this._filePath = filePath;
    this._onLoaded = onLoaded;
    this._loop = loop;
    this.speed = speedMultiplier;
    this._startFrame = startFrame;
    this._playOnStart = playOnStart;
    this._currentFrame = startFrame;

    this.bufferGeometry = new SphereBufferGeometry(1, 32, 32);
    this.material = new MeshPhongMaterial({ color: 0xffff00 });
    this.bufferGeometry.name = 'sphere';
    this.mesh = new Mesh(this.bufferGeometry, this.material);
    this.scene.add(this.mesh);
    console.log(this.bufferGeometry);
    // this.bufferGeometry = true;

    this.dracoLoader.setDecoderPath(
      'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/js/libs/draco/'
    );

    let player = this;

    this.httpGetAsync('http://localhost:8000/dracosis', function (data: any) {
      data = JSON.parse(data);
      if (endFrame > 1) {
        player._endFrame = endFrame;
      } else {
        player._endFrame = data.fileHeader.frameData.length;
      }
      player._numberOfFrames = player._endFrame - player._startFrame;

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

  decodeDracoData(rawBuffer: Buffer) {
    console.log('RawBufer', rawBuffer);
    const decoder = new this._decoderModule.Decoder();
    const buffer = new this._decoderModule.DecoderBuffer();
    buffer.Init(new Int8Array(rawBuffer), rawBuffer.byteLength);
    const geometryType = decoder.GetEncodedGeometryType(buffer);

    let dracoGeometry;
    let status;

    console.log('201 buffer', buffer);

    if (geometryType === this._decoderModule.TRIANGULAR_MESH) {
      dracoGeometry = new this._decoderModule.Mesh();
      status = decoder.DecodeBufferToMesh(buffer, dracoGeometry);
    } else if (geometryType === this._decoderModule.POINT_CLOUD) {
      dracoGeometry = new this._decoderModule.PointCloud();
      status = decoder.DecodeBufferToPointCloud(buffer, dracoGeometry);
    } else {
      const errorMsg = 'Error: Unknown geometry type.';
      console.error(errorMsg);
    }
    this._decoderModule.destroy(buffer);

    console.log('status', status);

    const bufferGeometry = this.getBufferFromDracoGeometry(
      dracoGeometry,
      decoder
    );

    // @ts-ignore
    // this.dracoLoader.decodeDracoFile(dracoGeometry, (geom) => {
    //   console.log('222', geom);
    // });

    // const numFaces = dracoGeometry.num_faces();
    // const numIndices = numFaces * 3;
    // const numPoints = dracoGeometry.num_points();
    // const indices = new Uint32Array(numIndices);

    // console.log('Number of faces ' + numFaces);
    // console.log('Number of vertices ' + numPoints);

    return bufferGeometry;
  }

  getBufferFromDracoGeometry(uncompressedDracoMesh, decoder) {
    const encoder = new this._encoderModule.Encoder();
    const meshBuilder = new this._encoderModule.MeshBuilder();
    // Create a mesh object for storing mesh data.
    const newMesh = new this._encoderModule.Mesh();

    let uncompressedNumFaces, uncompressedNumPoints;
    let numVertexCoordinates, numTextureCoordinates, numColorCoordinates;
    let numAttributes;
    let numColorCoordinateComponents = 3;

    // For output basic geometry information.
    uncompressedNumFaces = uncompressedDracoMesh.num_faces();
    uncompressedNumPoints = uncompressedDracoMesh.num_points();
    numVertexCoordinates = uncompressedNumPoints * 3;
    numTextureCoordinates = uncompressedNumPoints * 2;
    numColorCoordinates = uncompressedNumPoints * 3;
    numAttributes = uncompressedDracoMesh.num_attributes();

    console.log(
      '262 uncompressed',
      uncompressedNumFaces,
      uncompressedNumPoints,
      numAttributes
    );

    // Get position attribute. Must exists.
    let posAttId = decoder.GetAttributeId(
      uncompressedDracoMesh,
      this._decoderModule.POSITION
    );
    if (posAttId == -1) {
      let errorMsg = 'THREE.DRACOLoader: No position attribute found.';
      console.error(errorMsg);
      this._decoderModule.destroy(decoder);
      this._decoderModule.destroy(uncompressedDracoMesh);
      throw new Error(errorMsg);
    }
    let posAttribute = decoder.GetAttribute(uncompressedDracoMesh, posAttId);
    let posAttributeData = new this._decoderModule.DracoFloat32Array();
    decoder.GetAttributeFloatForAllPoints(
      uncompressedDracoMesh,
      posAttribute,
      posAttributeData
    );

    // Get normal attributes if exists.
    let normalAttId = decoder.GetAttributeId(
      uncompressedDracoMesh,
      this._decoderModule.NORMAL
    );
    let norAttributeData;
    if (normalAttId != -1) {
      let norAttribute = decoder.GetAttribute(
        uncompressedDracoMesh,
        normalAttId
      );
      norAttributeData = new this._decoderModule.DracoFloat32Array();
      decoder.GetAttributeFloatForAllPoints(
        uncompressedDracoMesh,
        norAttribute,
        norAttributeData
      );
    }

    // Structure for converting to THREEJS geometry later.
    let geometryBuffer = {
      vertices: new Float32Array(numVertexCoordinates),
      normals: new Float32Array(numVertexCoordinates),
      indices: null,
    };

    console.log('Geometry Buffer', geometryBuffer);

    for (let i = 0; i < numVertexCoordinates; i += 3) {
      geometryBuffer.vertices[i] = posAttributeData.GetValue(i);
      geometryBuffer.vertices[i + 1] = posAttributeData.GetValue(i + 1);
      geometryBuffer.vertices[i + 2] = posAttributeData.GetValue(i + 2);
      // Add normal.
      if (normalAttId != -1) {
        geometryBuffer.normals[i] = norAttributeData.GetValue(i);
        geometryBuffer.normals[i + 1] = norAttributeData.GetValue(i + 1);
        geometryBuffer.normals[i + 2] = norAttributeData.GetValue(i + 2);
      }
    }

    this._decoderModule.destroy(posAttributeData);
    if (normalAttId != -1) this._decoderModule.destroy(norAttributeData);

    let uncompressedNumIndices = uncompressedNumFaces * 3;
    geometryBuffer.indices = new Uint32Array(uncompressedNumIndices);
    let ia = new this._decoderModule.DracoInt32Array();
    for (let i = 0; i < uncompressedNumFaces; ++i) {
      decoder.GetFaceFromMesh(uncompressedDracoMesh, i, ia);
      let index = i * 3;
      geometryBuffer.indices[index] = ia.GetValue(0);
      geometryBuffer.indices[index + 1] = ia.GetValue(1);
      geometryBuffer.indices[index + 2] = ia.GetValue(2);
    }
    this._decoderModule.destroy(ia);

    console.log('Geometry Buffer populated', geometryBuffer);

    // Import data to Three JS geometry.
    let geometry = new BufferGeometry();

    geometry.setIndex(
      new (geometryBuffer.indices.length > 65535
        ? Uint32BufferAttribute
        : Uint16BufferAttribute)(geometryBuffer.indices, 1)
    );
    geometry.addAttribute(
      'position',
      new Float32BufferAttribute(geometryBuffer.vertices, 3)
    );

    if (normalAttId != -1) {
      geometry.addAttribute(
        'normal',
        new Float32BufferAttribute(geometryBuffer.normals, 3)
      );
    }

    console.log('Geometry Buffer with attributes', geometryBuffer);

    this._decoderModule.destroy(decoder);
    this._decoderModule.destroy(uncompressedDracoMesh);

    console.log('Geomtery', geometry);

    return geometry;
    // const numFaces = mesh.num_faces();
    // const numIndices = numFaces * 3;
    // const numPoints = mesh.num_points();
    // const indices = new Uint32Array(numIndices);

    // console.log(mesh);
    // console.log('Number of faces ' + numFaces);
    // console.log('Number of vertices ' + numPoints);

    // let vertices = new Float32Array(numPoints * 3);
    // let normals = new Float32Array(numPoints * 3);

    // // Add Faces to mesh
    // for (let i = 0; i < numFaces; i++) {
    //   const index = i * 3;
    //   console.log('261', index, mesh.faces[i], indices[index]);
    //   indices[index] = mesh.faces[i].a;
    //   indices[index + 1] = mesh.faces[i].b;
    //   indices[index + 2] = mesh.faces[i].c;
    // }
    // meshBuilder.AddFacesToMesh(newMesh, numFaces, indices);

    // // Add POSITION to mesh (Vertices)
    // for (let i = 0; i < mesh.vertices.length; i++) {
    //   const index = i * 3;
    //   vertices[index] = mesh.vertices[i].x;
    //   vertices[index + 1] = mesh.vertices[i].y;
    //   vertices[index + 2] = mesh.vertices[i].z;
    // }
    // meshBuilder.AddFloatAttributeToMesh(
    //   newMesh,
    //   this._encoderModule.POSITION,
    //   numPoints,
    //   3,
    //   vertices
    // );

    // // Add NORMAL to mesh
    // for (let face of mesh.faces) {
    //   normals[face['a'] * 3] = face.vertexNormals[0].x;
    //   normals[face['a'] * 3 + 1] = face.vertexNormals[0].y;
    //   normals[face['a'] * 3 + 2] = face.vertexNormals[0].z;

    //   normals[face['b'] * 3] = face.vertexNormals[1].x;
    //   normals[face['b'] * 3 + 1] = face.vertexNormals[1].y;
    //   normals[face['b'] * 3 + 2] = face.vertexNormals[1].z;

    //   normals[face['c'] * 3] = face.vertexNormals[2].x;
    //   normals[face['c'] * 3 + 1] = face.vertexNormals[2].y;
    //   normals[face['c'] * 3 + 2] = face.vertexNormals[2].z;
    // }
    // meshBuilder.AddFloatAttributeToMesh(
    //   newMesh,
    //   this._encoderModule.NORMAL,
    //   numPoints,
    //   3,
    //   normals
    // );

    // console.log('//DRACO UNCOMPRESSED MESH STATS//////////');
    // console.log('Number of faces ' + newMesh.num_faces());
    // console.log('Number of Vertices ' + newMesh.num_points());
    // console.log('Number of Attributes ' + newMesh.num_attributes());
  }

  handleMessage(data: any) {
    switch (data.type) {
      case MessageType.InitializationResponse:
        this.handleInitializationResponse(data);
        break;
      case MessageType.DataResponse: {
        // this.dracoLoader.load(
        //   this._filePath,
        //   function (geometry) {
        //     console.log('205', geometry);
        //   },
        //   // called as loading progresses
        //   function (xhr) {
        //     console.log((xhr.loaded / xhr.total) * 100 + '% loaded');
        //   },
        //   // called when loading has errors
        //   function (error) {
        //     console.log('An error happened');
        //   }
        // );

        if (data && data.buffers) {
          // var geometry = this.decodeDracoData(data.buffers[0].bufferGeometry);
          // console.log("Decoded data", decodeDracoData(data.buffers[0].bufferGeometry));
          this.handleDataResponse(data.buffers);
          // console.log("228");
          // console.log("Buffers", data.buffers[10])
          // console.log("Decoded data", this.decodeDracoData(data.buffers[10].bufferGeometry))
          // console.log("Buffers", data.buffers[20])
          // console.log("Decoded data", this.decodeDracoData(data.buffers[20].bufferGeometry))
        }
        break;
      }
    }
  }

  handleInitializationResponse(data: WorkerInitializationResponse) {
    if (data.isInitialized) {
      this._isinitialized = true;
      this.handleBuffers();
      if (this._playOnStart) this.play();
      console.log('Received initialization response from worker');
    } else console.error('Initialization failed');
  }

  handleDataResponse(data) {
    // For each object in the array...

    const player = this;
    data.forEach((geomTex) => {
      player._frameNumber = geomTex.frameNumber;
      // Find the frame in our circular buffer
      // player._pos = player.getPositionInBuffer(player._frameNumber);
      // Set the mesh and texture buffers
      player._ringBuffer.get(
        player._frameNumber
      ).bufferGeometry = player.decodeDracoData(geomTex.bufferGeometry);
      player._ringBuffer.get(player._frameNumber).compressedTexture =
        geomTex.compressedTexture;
      player._framesUpdated++;
      console.log(
        '263',
        player._ringBuffer.get(player._frameNumber).bufferGeometry
      );
    });
    console.log(
      'Updated mesh and texture data on ' + player._framesUpdated + ' frames'
    );
  }

  getPositionInBuffer(frameNumber: number): number {
    // Search backwards, which should make the for loop shorter on longer buffer
    for (let i = this._ringBuffer.getPos(); i > 0; i--)
      if ((frameNumber = this._ringBuffer.get(i).frameNumber)) return i;
    return -1;
  }

  handleBuffers() {
    // If not initialized, skip.
    if (!this._isinitialized) return setTimeout(this.handleBuffers, 100);
    // Clear the buffers
    while (true) {
      // Peek the current frame. if it's frame number is below current frame, trash it
      if (
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

    // Fill buffers with new data
    while (!this._ringBuffer.full()) {
      // Increment onto the last frame
      const lastFrame =
        (this._ringBuffer.getLast() &&
          this._ringBuffer.getLast().frameNumber) ||
        0;
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

    // Every 1/4 second, make sure our workers are working
    setTimeout(this.handleBuffers, 100);
  }

  update() {
    // console.log(
    //   'Player update called, current frame is + ' + this._currentFrame
    // );

    // If playback is paused, stop updating
    if (!this._isPlaying) return;

    // If we aren't initialized yet, skip logic but come back next frame
    if (!this._isinitialized) return;
    //   return setTimeout(this.update, (1.0 / this.frameRate) * this.speed);

    // Advance to next frame
    this._currentFrame++;

    // Loop logic
    if (this._currentFrame >= this._endFrame) {
      if (this._loop) this._currentFrame = this._startFrame;
      else {
        this._isPlaying = false;
        return;
      }
    }

    // console.log('Current frame', this._currentFrame);

    // If the frame exists in the ring buffer, use it
    if (
      this._ringBuffer &&
      this._ringBuffer.getFirst().frameNumber == this._currentFrame
    ) {
      // console.log(
      //   'Buffer Geometry',
      //   this._ringBuffer.getFirst().bufferGeometry
      // );
      // read buffer into current buffer geometry
      this.bufferGeometry = this._ringBuffer.getFirst().bufferGeometry;
      this.mesh.geometry = this.bufferGeometry;

      // read buffer into current texture
      this.compressedTexture = this._ringBuffer.getFirst().compressedTexture;

      // Remove buffer
      // this._ringBuffer.remove(0);

      // console.log(
      //   'Recalled the frame ' + this._ringBuffer.getFirst().frameNumber
      // );
    } else {
      // Frame doesn't exist in ring buffer, so throw an error
      console.warn(
        'Frame ' +
          // this._ringBuffer.getFirst().frameNumber +
          ' did not exist in ring buffer'
      );
    }

    setTimeout(() => {
      this.update();
    }, (1000 / this.frameRate) * this.speed);
  }

  play() {
    this._isPlaying = true;
    this.show();
    this.update();
  }

  pause() {
    this._isPlaying = false;
  }

  reset() {
    this._currentFrame = this._startFrame;
  }

  goToFrame(frame: number, play: boolean) {
    this._currentFrame = frame;
    this.handleBuffers();
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
}
