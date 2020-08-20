import { TransformComponent } from '../../transform/components/TransformComponent';

import { System } from '../../ecs/classes/System';
import { followTarget } from '../../transform/behaviors/followTarget';
import { CameraComponent } from '../components/CameraComponent';
import { createEntity, getMutableComponent, getComponent, addComponent } from '../../ecs/functions/EntityFunctions';
import { Engine } from '../../ecs/classes/Engine';
import { Object3DComponent } from '../../common/components/Object3DComponent';
import { CameraTagComponent } from '../../common/components/Object3DTagComponents';

export class CameraSystem extends System {
  init (): void {
    const cameraEntity = createEntity();
    addComponent(cameraEntity, CameraComponent, { camera: Engine.camera, followTarget: null });
    addComponent(cameraEntity, CameraTagComponent)
    addComponent(cameraEntity, Object3DComponent)
    getMutableComponent<Object3DComponent>(cameraEntity, Object3DComponent).value = Engine.camera
    addComponent(cameraEntity, TransformComponent);
  }

  execute (delta: number): void {
    this.queryResults.entities.all?.forEach(entity => {
      const cam = getComponent(entity, CameraComponent) as CameraComponent;
      if (cam.followTarget !== null && cam.followTarget !== undefined) {
        followTarget(entity, { distance: 100 }, delta, cam.followTarget);
      }
    });

    this.queryResults.entities.changed?.forEach(entity => {
      // applySettingsToCamera(entity)
    });
  }
}

CameraSystem.queries = {
  entities: {
    components: [CameraComponent, TransformComponent],
    listen: {
      added: true,
      changed: true
    }
  }
};
