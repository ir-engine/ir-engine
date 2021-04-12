import { Object3D } from "three";
import { Engine } from "../../ecs/classes/Engine";
import { addComponent, createEntity } from "../../ecs/functions/EntityFunctions"
import { BoundingBox } from "../../interaction/components/BoundingBox";
import { RaycastComponent } from "../../raycast/components/RaycastComponent";
import { Object3DComponent } from "../../scene/components/Object3DComponent";
import { TransformComponent } from "../../transform/components/TransformComponent";
import { UIPanelComponent } from "../components/UIPanelComponent";

export const createPanelComponent = (args: { panel: any, raycast: any }) => {
  const entity = createEntity();
  addComponent(entity, UIPanelComponent, { panel: args.panel });
  addComponent(entity, Object3DComponent, { value: args.panel });
  // addComponent(entity, BoundingBox);
  // addComponent(entity, TransformComponent);
  addComponent(entity, RaycastComponent, { raycast: args.raycast });
}