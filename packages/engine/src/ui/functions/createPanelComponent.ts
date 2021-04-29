import { addComponent, createEntity } from "../../ecs/functions/EntityFunctions"
import { UIBaseElement } from "../classes/UIBaseElement";
import { UIPanelComponent } from "../components/UIPanelComponent";

export const createPanelComponent = (args: { panel: UIBaseElement }) => {
  const entity = createEntity();
  addComponent(entity, UIPanelComponent, { panel: args.panel });
  console.log(args.panel)
  // addComponent(entity, Object3DComponent, { value: args.panel });
  // addComponent(entity, BoundingBox);
  // addComponent(entity, TransformComponent);
}