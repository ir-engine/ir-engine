import { CameraComponent } from '../../camera/components/CameraComponent';
import { Behavior } from '../../common/interfaces/Behavior';
import { Entity } from '../../ecs/classes/Entity';
import { addComponent } from '../../ecs/functions/EntityFunctions';
import { TransformParentComponent } from '../../transform/components/TransformParentComponent';

export const createScenePreviewCamera: Behavior = (previewPointEntity: Entity) => {
    addComponent(previewPointEntity, TransformParentComponent, {children:[CameraComponent.instance.entity]});
};
