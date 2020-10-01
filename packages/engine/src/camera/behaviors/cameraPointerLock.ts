import { Behavior } from '../../common/interfaces/Behavior';
import { Entity } from '../../ecs/classes/Entity';
import { CameraComponent } from '../components/CameraComponent';
/**
 * PointerLock
 *
 * @param {Entity} entity - The Entity
 */
export const cameraPointerLock: Behavior = (entity: Entity): void => {
  document.body.requestPointerLock();
  console.log("Camera PointerLock");
};
