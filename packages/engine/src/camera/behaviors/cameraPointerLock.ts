import { Behavior } from '../../common/interfaces/Behavior';
import { Entity } from '../../ecs/classes/Entity';
import { CameraComponent } from '../components/CameraComponent';

/** Lock camera pointer. */
export function cameraPointerLock(): void {
  document.body.requestPointerLock();
  console.log("Camera PointerLock");
}
