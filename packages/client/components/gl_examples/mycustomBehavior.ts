import { Entity } from "@xr3ngine/engine/src/ecs/classes/Entity";
import { addComponent } from "@xr3ngine/engine/src/ecs/functions/EntityFunctions";
import { ColliderComponent } from "@xr3ngine/engine/src/physics/components/Collider";
import { RigidBody } from "@xr3ngine/engine/src/physics/components/RigidBody";

export const myCustomBehavior = (entity: Entity) => {
  addComponent(entity, ColliderComponent, { type: 'box', scale: [3, 3, 3], mass: 10 })
  addComponent(entity, RigidBody)
};
