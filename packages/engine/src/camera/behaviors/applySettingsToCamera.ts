import { Behavior } from '../../common/interfaces/Behavior';
import { Engine } from '../../ecs/classes/Engine';
import { Entity } from '../../ecs/classes/Entity';
import { getComponent } from '../../ecs/functions/EntityFunctions';
import { CameraComponent } from '../components/CameraComponent';
/**
 * Apply setting to camera
 * 
 * @param {Entity} entity - The Entity
 */
export const applySettingsToCamera: Behavior = (entity: Entity): void => {
  const cameraComponent = getComponent(entity, CameraComponent) as any;
  Engine.camera.fov = cameraComponent.fov;
  Engine.camera.aspect = cameraComponent.aspect;
  Engine.camera.near = cameraComponent.near;
  Engine.camera.far = cameraComponent.far;
  Engine.camera.layers = cameraComponent.layers;
};
