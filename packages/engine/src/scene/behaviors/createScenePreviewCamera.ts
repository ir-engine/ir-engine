import { CameraComponent } from '../../camera/components/CameraComponent';
import { Behavior } from '../../common/interfaces/Behavior';
import { Entity } from '../../ecs/classes/Entity';
import { addComponent } from '../../ecs/functions/EntityFunctions';
import { CopyTransformComponent } from "../../transform/components/CopyTransformComponent";

export const createScenePreviewCamera: Behavior = (previewPointEntity: Entity) => {
  addComponent(CameraComponent.instance.entity, CopyTransformComponent, { input: previewPointEntity });
};
