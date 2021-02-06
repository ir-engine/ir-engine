export declare function isLargeTexture(texture: any): boolean;
export declare function calculateTextureVRAM(texture: any): any;
export declare function maybeAddLargeFileIssue(type: any, fileSize: any, issues: any): void;
export declare function getObjectPerfIssues(object: any, traverse?: boolean): any[];
export declare function calculateMeshPolygons(mesh: any): number;
export declare function calculateGLTFPerformanceScores(scene: any, glbBlob: any, chunks: any): {
    polygons: {
        value: number;
        score: any;
    };
    textures: {
        value: number;
        score: any;
        largeTexturesValue: number;
        largeTexturesScore: string;
    };
    lights: {
        value: number;
        score: any;
    };
    materials: {
        value: any;
        score: any;
    };
    fileSize: {
        value: any;
        score: any;
    };
};
