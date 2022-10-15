import { Loader } from "three";

export class USDAParser {
    parse(text: string): Object
}

export class USDZLoader extends Loader {
    load(url: string, onLoad: (result) => void, onProgress: (progress) => void, onError: (error) => void): void
    parse(buffer: string): Object
}