import { LoadingManager } from 'three';
export declare class FBXLoader {
    static fbxTree: any;
    static sceneGraph: any;
    static connections: any;
    static serverUrl: string;
    crossOrigin: any;
    resourcePath: any;
    path: any;
    manager: any;
    constructor(manager?: LoadingManager);
    load(url: any, onLoad: any, onProgress?: any, onError?: any): void;
    setPath(value: any): this;
    setResourcePath(value: any): this;
    setCrossOrigin(value: any): this;
    parse(FBXBuffer: any, path: any): any;
}
export default FBXLoader;
