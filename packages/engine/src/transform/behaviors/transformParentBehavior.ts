import { Object3DComponent } from '../../common/components/Object3DComponent';
import { Behavior } from '../../common/interfaces/Behavior';
import { Entity } from '../../ecs/classes/Entity';
import { TransformComponent } from '../components/TransformComponent';
import {getComponent, getMutableComponent, hasComponent} from '../../ecs/functions/EntityFunctions';
import {TransformParentComponent} from "../components/TransformParentComponent";

export const transformParentBehavior: Behavior = (entity: Entity, args: { event: MouseEvent }, delta): void => {
  const parentTransform = getMutableComponent(entity, TransformComponent);

  if (!hasComponent(entity, TransformParentComponent)) {
    return;
  }
  const parentingComponent = getComponent<TransformParentComponent>(entity, TransformParentComponent);

  parentingComponent.children.forEach(child => {
    if (!hasComponent(child, Object3DComponent)) {
      return;
    }

    const { value: { position: childPosition, quaternion: childQuaternion } } = getMutableComponent<Object3DComponent>(child, Object3DComponent);
    const childTransformComponent = getComponent(child, TransformComponent);

    // reset to "local"
    if (childTransformComponent) {
      childPosition.copy(childTransformComponent.position);
      childQuaternion.copy(childTransformComponent.rotation);
    } else {
      childPosition.setScalar(0);
      childQuaternion.set(0,0,0,0);
    }

    // add parent
    childPosition.add(parentTransform.position);
    childQuaternion.multiply(parentTransform.rotation);
  });
};
