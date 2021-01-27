import { Behavior } from '../../common/interfaces/Behavior';
import { Entity } from '../../ecs/classes/Entity';
import { CameraComponent } from '../components/CameraComponent';

/**
 * Attach Camera to Entity.
 * @param entity The Entity to which camera will be attached.
 */
export const attachCamera: Behavior = (entity: Entity): void => {
  CameraComponent.instance.followTarget = entity;
};


