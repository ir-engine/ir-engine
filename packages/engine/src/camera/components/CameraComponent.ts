// TODO: Change camera properties to object and use setter that updates camera

import { Component } from '../../ecs/classes/Component';
import { Entity } from '../../ecs/classes/Entity';
import { Types } from '../../ecs/types/Types';

/** Component class for Camera. */
export class CameraComponent extends Component<any> {
  /** Static instance of the camera. */
  static instance: CameraComponent = null

  /** Reference to the object that should be followed. */
  followTarget: any = null
  /** Field of view. */
  fov: number
  /** Aspect Ration - Width / Height */
  aspect: number
  /** Geometry closer than this gets removed. */
  near: number
  /** Geometry farther than this gets removed. */
  far: number
  /** Bitmask of layers the camera can see, converted to an int. */
  layers: number
  /** Should the camera resize if the window does? */
  handleResize: boolean
  /** Entity object for this component. */
  entity: Entity;

  /** Constructs Camera Component. */
  constructor () {
    super();
    CameraComponent.instance = this;
  }

  /** Dispose the component. */
  dispose(): void {
    super.dispose();
    CameraComponent.instance = null;
  }
}

/**
  * Set the default values of a component.
  * The type field must be set for each property.
 */
CameraComponent._schema = {
  camera: { type: Types.Ref, default: null },
  followTarget: { type: Types.Ref, default: null }
};
