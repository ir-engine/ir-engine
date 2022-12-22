import { BufferGeometry, Group, Loader, Material } from "three";

export class USDAParser {
    parse(text: string): Object
}

export class USDZLoader extends Loader {
    register(plugin: USDZLoaderPlugin): void
    unregister(plugin: USDZLoaderPlugin): void
    load(url: string, onLoad: (result) => void, onProgress: (progress) => void, onError: (error) => void): void
    parse(buffer: string): Object
}

export interface USDZLoaderPlugin {
    buildMesh?: ((mesh: Mesh<BufferGeometry, any>, data: any) => Mesh<BufferGeometry, any>)
    buildGeometry?: ((geo: BufferGeometry, data: any) => BufferGeometry)
    buildMaterial?: ((material: Material, data: any) => Material)
    buildXform?: ((xform: Group, data: any) => Group)
}