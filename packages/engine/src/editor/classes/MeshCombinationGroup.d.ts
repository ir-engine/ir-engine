import { Mesh } from "three";
export declare function getImageHash(hashCache: any, img: any): Promise<any>;
export declare function compareImages(hashCache: any, a: any, b: any): Promise<boolean>;
export declare function compareTextures(hashCache: any, a: any, b: any): Promise<boolean>;
declare function meshBasicMaterialComparator(group: any, a: any, b: any): Promise<boolean>;
declare function meshStandardMaterialComparator(group: any, a: any, b: any): Promise<boolean>;
export default class MeshCombinationGroup {
    static MaterialComparators: {
        MeshStandardMaterial: typeof meshStandardMaterialComparator;
        MeshBasicMaterial: typeof meshBasicMaterialComparator;
    };
    initialObject: any;
    meshes: any[];
    imageHashes: any;
    static combineMeshes(rootObject: any): Promise<any>;
    constructor(initialObject: any, imageHashes: any);
    _tryAdd(object: any): Promise<boolean>;
    _combine(): Mesh;
}
export {};
