import { BufferGeometry, CompressedTexture } from 'three';
import { MessageType } from './Enums';

export interface Action {
  type: MessageType;
  value?: number | boolean | string;
}

export interface IFrameData {
  frameNumber: number;
  startBytePosition: number;
  vertices: number;
  faces: number;
  meshLength: number;
  textureLength: number;
}

export interface IFileHeader {
  textureHeight: number;
  textureWidth: number;
  maxVertices: number;
  maxTriangles: number;
  frameData: IFrameData[];
}

export interface IMeshTextureData {
  frameNumber: number;
  mesh: Buffer;
  texture: Buffer;
}

export interface IBuffer {
  frameNumber: number;
  bufferGeometry: Buffer;
  compressedTexture: Buffer;
}

export interface IBufferGeometryCompressedTexture {
  frameNumber: number;
  bufferGeometry: BufferGeometry;
  compressedTexture: CompressedTexture;
}

export interface WorkerInitializationRequest extends Action {
  startFrame: number;
  endFrame: number;
  loop: boolean;
  filePath: string;
  fileHeader: IFileHeader;
  readStreamOffset: number;
}

export interface WorkerInitializationResponse extends Action {
  isInitialized: boolean;
}

export interface WorkerDataRequest extends Action {
  framesToFetch: number[];
}

export interface WorkerDataResponse extends Action {
  buffers?: IBuffer[];
  endReached: boolean;
}
