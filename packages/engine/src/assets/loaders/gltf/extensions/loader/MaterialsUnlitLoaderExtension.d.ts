import { MeshBasicMaterial } from "three";
import { LoaderExtension } from "./LoaderExtension";
export declare const ALPHA_MODES: {
    OPAQUE: string;
    MASK: string;
    BLEND: string;
};
export declare class MaterialsUnlitLoaderExtension extends LoaderExtension {
    static extensionName: string;
    extensionNames: string[];
    onLoad(): void;
    createMaterial: () => Promise<MeshBasicMaterial>;
    setMaterialParams: (material: any, materialDef: any) => Promise<void>;
}
