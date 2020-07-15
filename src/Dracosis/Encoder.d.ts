import { Geometry, Mesh, WebGLRenderer } from "three";
export default class DracoFileCreator {
    private _frameIn;
    private _frameOut;
    private _outputFileName;
    private _meshFiles;
    private _textureFiles;
    private _frameData;
    private _maxVertices;
    private _maxFaces;
    private _basisLoader;
    private _manager;
    private _loader;
    constructor(renderer: WebGLRenderer, meshFileSuffix: string, textureFileSuffix: string, frameIn: number, frameOut: number, outputFileName: string, progressCallback: any);
    textureWidth: number;
    textureHeight: number;
    mesh: Mesh<Geometry | import("three").BufferGeometry, import("three").Material | import("three").Material[]>;
    geometry: Geometry;
    createEncodedFile(fileName: any, callback: any): void;
}
