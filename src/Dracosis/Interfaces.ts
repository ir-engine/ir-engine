import { BufferGeometry, CompressedTexture } from 'three'

export interface IFrameData {
    frameNumber: number;
    startBytePosition: number;
    vertices: number;
    triangles: number;
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

export interface IBufferGeometryCompressedTexture {
    frameNumber: number;
    bufferGeometry: BufferGeometry;
    compressedTexture: CompressedTexture;
}

export interface WorkerInitAction {
    type: string;
    startFrame: number;
    endFrame: number;
    filePath: string;
    fileHeader: IFileHeader;
    readStreamOffset: number;
}

export interface WorkerFetchAction {
    type: string;
    framesToFetch: number[];
}