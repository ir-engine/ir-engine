import { HemisphereLight } from "three";
export default class PhysicalHemisphereLight extends HemisphereLight {
    constructor();
    get skyColor(): import("three").Color;
    copy(source: any, recursive?: boolean): this;
}
