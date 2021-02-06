import { Component } from '../../ecs/classes/Component';
import { Entity } from '../../ecs/classes/Entity';
/** Component class for Camera. */
export declare class CameraComponent extends Component<any> {
    /** Static instance of the camera. */
    static instance: CameraComponent;
    /** Reference to the object that should be followed. */
    followTarget: any;
    /** Field of view. */
    fov: number;
    /** Aspect Ration - Width / Height */
    aspect: number;
    /** Geometry closer than this gets removed. */
    near: number;
    /** Geometry farther than this gets removed. */
    far: number;
    /** Bitmask of layers the camera can see, converted to an int. */
    layers: number;
    /** Should the camera resize if the window does? */
    handleResize: boolean;
    /** Entity object for this component. */
    entity: Entity;
    /** Constructs Camera Component. */
    constructor();
    /** Dispose the component. */
    dispose(): void;
}
