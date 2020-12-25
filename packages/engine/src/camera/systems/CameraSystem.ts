import { addObject3DComponent } from '../../common/behaviors/Object3DBehaviors';
import { CameraTagComponent } from '../../common/components/Object3DTagComponents';
import { isClient } from '../../common/functions/isClient';
import { Engine } from '../../ecs/classes/Engine';
import { System } from '../../ecs/classes/System';
import {
  addComponent, createEntity, getComponent, hasComponent
} from '../../ecs/functions/EntityFunctions';
import { TransformComponent } from '../../transform/components/TransformComponent';
import { attachCamera } from '../behaviors/attachCamera';
import { setCameraFollow } from '../behaviors/setCameraFollow';
import { CameraComponent } from '../components/CameraComponent';
import { FollowCameraComponent } from '../components/FollowCameraComponent';

export class CameraSystem extends System {
  constructor() {
    super();
    const cameraEntity = createEntity();
    addComponent(cameraEntity, CameraComponent );
    addComponent(cameraEntity, CameraTagComponent );
    addObject3DComponent(cameraEntity, { obj3d: Engine.camera });
    addComponent(cameraEntity, TransformComponent);
  }
  /**
   * Called each frame by default
   *
   * @param {Number} delta time since last frame
   */
  execute(delta: number): void {

    this.queryResults.followCameraComponent.added?.forEach(entity => {
      attachCamera(entity);
    });

    this.queryResults.cameraComponent.all?.forEach(entity => {
      if (!isClient) return;
      const cam = getComponent(entity, CameraComponent) as CameraComponent;
      if (!!cam.followTarget && hasComponent(cam.followTarget, FollowCameraComponent)) {
        setCameraFollow(entity, null, delta, cam.followTarget);
      }
    });

    this.queryResults.cameraComponent.changed?.forEach(entity => {
      // applySettingsToCamera(entity)
    });

  }
}
/**
 * Queries must have components attribute which defines the list of components
 */
CameraSystem.queries = {
  cameraComponent: {
    components: [CameraComponent, TransformComponent],
    listen: {
      added: true,
      changed: true
    }
  },
  followCameraComponent: {
    components: [ FollowCameraComponent, TransformComponent ],
    listen: {
      added: true,
      changed: true
    }
  }


};
