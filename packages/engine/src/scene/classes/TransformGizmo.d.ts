import { Color, Object3D, Raycaster } from "three";
export default class TransformGizmo extends Object3D {
    model: any;
    selectionColor: Color;
    previousColor: Color;
    raycasterResults: any[];
    translateControls: any;
    translateXAxis: any;
    translateYAxis: any;
    translateZAxis: any;
    translateXYPlane: any;
    translateYZPlane: any;
    translateXZPlane: any;
    rotateControls: any;
    rotateXAxis: any;
    rotateYAxis: any;
    rotateZAxis: any;
    scaleControls: any;
    scaleXAxis: any;
    scaleYAxis: any;
    scaleZAxis: any;
    scaleXYPlane: any;
    scaleYZPlane: any;
    scaleXZPlane: any;
    scaleUniformHandle: any;
    transformMode: string;
    activeControls: any;
    selectedAxis: any;
    hoveredAxis: any;
    static load(): Promise<{
        scene: any;
        json: any;
        stats: any;
    }>;
    constructor();
    setTransformMode(transformMode: any): void;
    setLocalScaleHandlesVisible(visible: any): void;
    selectAxisWithRaycaster(raycaster: Raycaster): any;
    highlightHoveredAxis(raycaster: Raycaster): any;
    deselectAxis(): void;
    /** @ts-ignore */
    clone(): any;
}
