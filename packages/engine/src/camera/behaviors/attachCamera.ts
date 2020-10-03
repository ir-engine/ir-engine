import { Behavior } from '../../common/interfaces/Behavior';
import { Entity } from '../../ecs/classes/Entity';
import { CameraComponent } from '../components/CameraComponent';
/**
 * Attach Camera
 * 
 * @param {Entity} entity - The Entity
 */
export const attachCamera: Behavior = (entity: Entity): void => {
  CameraComponent.instance.followTarget = entity;
  console.log("Attaching camera");
};


