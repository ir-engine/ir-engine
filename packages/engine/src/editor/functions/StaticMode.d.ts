export declare const StaticModes: {
    Static: string;
    Dynamic: string;
    Inherits: string;
};
export declare function setOriginalStaticMode(node: any, mode: any): void;
export declare function getOriginalStaticMode(node: any): any;
export declare function setStaticMode(node: any, mode: any): void;
export declare function getStaticMode(node: any): any;
export declare function isInherits(node: any): boolean;
export declare function isStatic(node: any): boolean;
export declare function isDynamic(node: any): boolean;
export declare function computeStaticMode(object: any): any;
export declare function computeAndSetStaticModes(object: any): void;
