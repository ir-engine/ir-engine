import { Object3D } from 'three';
import { Component } from '../../ecs/classes/Component';
/** Component Class for Object3D type from three.js.  */
export declare class Object3DComponent extends Component<Object3DComponent> {
    value?: Object3D;
}
