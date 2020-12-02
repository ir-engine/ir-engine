import { BufferGeometry, CompressedTexture } from 'three'


export enum MessageType {
    InitializationRequest,
    InitializationResponse,
    DataRequest,
    DataResponse,
    SetLoopRequest,
    SetStartFrameRequest,
    SetEndFrameRequest,
  };
export interface Action {
    type: MessageType,
    value?: number | boolean | string
}

export interface IFrameData {
    frameNumber: number;
    startBytePosition: number;
    vertices: number;
    faces: number;
    meshLength: number;
}

export interface IFileHeader {
    maxVertices: number;
    maxTriangles: number;
    frameData: IFrameData[];
}

export interface IMeshTextureData {
    frameNumber: number;
    mesh: Buffer;
}

export interface IBuffer {
    frameNumber: number;
    bufferGeometry: Buffer | BufferGeometry;
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
    buffers?: IBuffer[]
    endReached: boolean;
}