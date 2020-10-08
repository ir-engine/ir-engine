import { Behavior } from '../../common/interfaces/Behavior';
import { Entity } from '../../ecs/classes/Entity';
import { CameraComponent } from '../components/CameraComponent';
/**
 * PointerLock
 *
 * @param {Entity} entity - The Entity
 */
export function cameraPointerLock() {
  document.body.requestPointerLock();
  console.log("Camera PointerLock");
};
