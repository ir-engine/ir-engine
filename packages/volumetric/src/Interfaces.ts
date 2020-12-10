import { BufferGeometry, Float32BufferAttribute } from 'three';


export enum MessageType {
    InitializationRequest = 0,
    InitializationResponse = 1,
    DataRequest = 2,
    DataResponse = 3,
    SetLoopRequest = 4,
    SetStartFrameRequest = 5,
    SetEndFrameRequest = 6,
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

export interface KeyframeBuffer {
    keyframeNumber: number;
    frameNumber: number;
    bufferGeometry: Buffer | BufferGeometry | null;
}

export interface IFrameBuffer {
    keyframeNumber: number;
    frameNumber: number;
    vertexBuffer: any;
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
    buffers?: KeyframeBuffer[]
    endReached: boolean;
}