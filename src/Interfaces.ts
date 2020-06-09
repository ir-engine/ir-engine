interface IFrameData {
    frameNumber: number
    startBytePosition: number
    vertices: number
    triangles: number
    meshLength: number
    textureLength: number
}

interface IFileData {
    maxVertices: number;
    maxTriangles: number;
    frameData: IFrameData[];
}