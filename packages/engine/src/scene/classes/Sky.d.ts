import { BoxBufferGeometry, Mesh, ShaderMaterial, Vector3 } from "three";
export declare class Sky extends Mesh {
    geometry: BoxBufferGeometry;
    material: ShaderMaterial;
    shader: {
        uniforms: {
            turbidity: {
                value: number;
            };
            rayleigh: {
                value: number;
            };
            mieCoefficient: {
                value: number;
            };
            mieDirectionalG: {
                value: number;
            };
            sunPosition: {
                value: Vector3;
            };
            up: {
                value: Vector3;
            };
        };
        vertexShader: string;
        fragmentShader: string;
    };
}
export declare const SkyShader: {
    uniforms: {
        turbidity: {
            value: number;
        };
        rayleigh: {
            value: number;
        };
        mieCoefficient: {
            value: number;
        };
        mieDirectionalG: {
            value: number;
        };
        sunPosition: {
            value: Vector3;
        };
        up: {
            value: Vector3;
        };
    };
    vertexShader: string;
    fragmentShader: string;
};
