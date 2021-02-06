import { DirectionalLight } from "three";
export default class PhysicalDirectionalLight extends DirectionalLight {
    shadowMapResolution: number;
    constructor();
    get shadowBias(): number;
    set shadowBias(value: number);
    get shadowRadius(): number;
    set shadowRadius(value: number);
    copy(source: any, recursive?: boolean): this;
}
