import { SpotLight } from "three";
export default class PhysicalSpotLight extends SpotLight {
    maxOuterConeAngle: number;
    shadowMapResolution: any;
    constructor();
    get range(): number;
    set range(value: number);
    get innerConeAngle(): number;
    set innerConeAngle(value: number);
    get outerConeAngle(): number;
    set outerConeAngle(value: number);
    get shadowBias(): number;
    set shadowBias(value: number);
    get shadowRadius(): number;
    set shadowRadius(value: number);
    copy(source: any, recursive?: boolean): this;
}
