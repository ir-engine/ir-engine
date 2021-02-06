import { LoaderExtension } from './LoaderExtension';
export declare class LightmapLoaderExtension extends LoaderExtension {
    static extensionName: string;
    extensionNames: string[];
    onLoad(): void;
    setMaterialParams: (material: any, materialDef: any) => Promise<void>;
}
