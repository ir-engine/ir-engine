import { Behavior } from "../../../common/interfaces/Behavior";
import { getMutableComponent, hasComponent } from "../../../ecs/functions/EntityFunctions";
import { Object3DComponent } from "../../../common/components/Object3DComponent";
import { Mesh, MeshPhongMaterial } from "three";
import { ColliderComponent } from "../../../physics/components/ColliderComponent";

export const onInteraction:Behavior = (entity, args, delta, entityOut, time) => {
  if (!hasComponent(entityOut, Object3DComponent)) {
    return;
  }

  const collider = getMutableComponent(entityOut, ColliderComponent);
  collider.collider.velocity.x += 0.1 * Math.random();
  collider.collider.velocity.y += 1;
  collider.collider.velocity.z += 0.1 * Math.random();
};

export const onInteractionHover:Behavior = (entity, { focused }:{ focused:boolean }, delta, entityOut, time) => {
  if (!hasComponent(entityOut, Object3DComponent)) {
    return;
  }

  const object3d = getMutableComponent(entityOut, Object3DComponent).value as Mesh;
  if (typeof object3d.material !== "undefined") {
    (object3d.material as MeshPhongMaterial).color.setColorName(focused? 'yellow' : 'blue');
  }
};