import { Engine } from '../../ecs/classes/Engine';
import { System } from '../../ecs/classes/System';
import { TransformComponent } from '../../transform/components/TransformComponent';
import {
  createEntity,
  getMutableComponent,
  getComponent,
  addComponent,
  hasComponent
} from '../../ecs/functions/EntityFunctions';
import { addObject3DComponent } from '../../common/behaviors/Object3DBehaviors';

import { CameraComponent } from '../components/CameraComponent';
import { FollowCameraComponent } from '../components/FollowCameraComponent';
import { CameraTagComponent } from '../../common/components/Object3DTagComponents';
import { Object3DComponent } from '../../common/components/Object3DComponent';

import { attachCamera } from '../behaviors/attachCamera';
import { setCameraFollow } from '../behaviors/setCameraFollow';


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
