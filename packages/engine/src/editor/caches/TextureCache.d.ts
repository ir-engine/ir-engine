import { TextureLoader } from "three";
import Cache from "./Cache";
export default class TextureCache extends Cache {
    textureLoader: TextureLoader;
    constructor();
    get(url: any): any;
    disposeAndClear(): void;
}
