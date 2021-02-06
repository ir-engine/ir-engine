import { PointLight } from "three";
export default class PhysicalPointLight extends PointLight {
    shadowMapResolution: any;
    constructor();
    get range(): number;
    set range(value: number);
    get shadowBias(): number;
    set shadowBias(value: number);
    get shadowRadius(): number;
    set shadowRadius(value: number);
    copy(source: any, recursive?: boolean): this;
    target(target: any): void;
}
