
import { Entity } from "../../ecs/classes/Entity";
import { System, SystemAttributes } from "../../ecs/classes/System";
import { getComponent, getMutableComponent } from "../../ecs/functions/EntityFunctions";
import { RaycastComponent } from "../components/RaycastComponent";

export class RaycastSystem extends System {
  constructor(attributes?: SystemAttributes) {
    super(attributes);
  }
  execute(): void {
    this.queryResults.raycasts?.all?.forEach((entity: Entity) => {
      const raycastComponent = getMutableComponent(entity, RaycastComponent);
      raycastComponent.hitResults = [];
      const hitResults = []
      // use bitmask, then do appropriate raycastScene() raycastPhysics() raycastCamera() or something
      // return hit results and put on component to be used later and updated next frame
      raycastComponent.hitResults.push(...hitResults)
    })
  }
}

RaycastSystem.queries = {
  raycasts: {
    components: [RaycastComponent],
    listen: {
      added: true,
      removed: true
    }
  },
};
