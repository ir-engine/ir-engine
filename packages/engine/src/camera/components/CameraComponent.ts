// TODO: Change camera properties to object and use setter that updates camera

import { Component } from '../../ecs/classes/Component';
import { Types } from '../../ecs/types/Types';

export class CameraComponent extends Component<any> {
  static instance: CameraComponent = null
  followTarget: any = null // Reference to the object that should be followed
  fov: number // Field of view
  aspect: number // Width / height
  near: number // Geometry closer than this gets removed
  far: number // Geometry farther than this gets removed
  layers: number // Bitmask of layers the camera can see, converted to an int
  handleResize: boolean // Should the camera resize if the window does?

  constructor () {
    super();
    CameraComponent.instance = this;
  }

  dispose(): void {
    super.dispose();
    CameraComponent.instance = null;
  }
}
/**
  * Set the default values of a component.
  * The type field must be set for each property.
 */
CameraComponent.schema = {
  camera: { type: Types.Ref, default: null },
  followTarget: { type: Types.Ref, default: null }
};
