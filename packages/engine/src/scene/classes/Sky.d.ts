import { BoxBufferGeometry, CubeCamera, Mesh, Object3D, Scene, ShaderMaterial, WebGLRenderer } from "three";
export declare class Sky extends Object3D {
    static shader: {
        uniforms: any;
        vertexShader: string;
        fragmentShader: string;
    };
    static geometry: BoxBufferGeometry;
    skyScene: Scene;
    cubeCamera: CubeCamera;
    sky: Mesh;
    _inclination: number;
    _azimuth: number;
    _distance: number;
    static material: ShaderMaterial;
    constructor();
    get turbidity(): any;
    set turbidity(value: any);
    get rayleigh(): any;
    set rayleigh(value: any);
    get luminance(): any;
    set luminance(value: any);
    get mieCoefficient(): any;
    set mieCoefficient(value: any);
    get mieDirectionalG(): any;
    set mieDirectionalG(value: any);
    get inclination(): number;
    set inclination(value: number);
    get azimuth(): number;
    set azimuth(value: number);
    get distance(): number;
    set distance(value: number);
    updateSunPosition(): void;
    generateEnvironmentMap(renderer: WebGLRenderer): import("three").Texture;
    copy(source: any, recursive?: boolean): this;
}
