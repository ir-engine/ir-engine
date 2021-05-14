import { addComponent, createEntity } from "../../ecs/functions/EntityFunctions"
import { UIBaseElement } from "../classes/UIBaseElement";
import { UIPanelComponent } from "../components/UIPanelComponent";
import { Object3DComponent } from "../../scene/components/Object3DComponent";
import { TransformComponent } from "../../transform/components/TransformComponent";
import { DesiredTransformComponent } from "../../transform/components/DesiredTransformComponent";
import { Vector3 } from "three";

export const createPanelComponent = (args: { panel: UIBaseElement, parent?: null, sourcePosition?: Vector3, destinationPosition?: Vector3 }) => {
  const entity = createEntity();
  addComponent(entity, UIPanelComponent, { panel: args.panel });
  addComponent(entity, Object3DComponent, { value: args.panel });
  // addComponent(entity, TransformComponent, { position: args.sourcePosition });
  // addComponent(entity, DesiredTransformComponent, { position: args.destinationPosition, positionRate: 10 });
}