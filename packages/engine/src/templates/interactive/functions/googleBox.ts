import { Behavior } from "../../../common/interfaces/Behavior";
import { getMutableComponent, hasComponent } from "../../../ecs/functions/EntityFunctions";
import { Object3DComponent } from "../../../common/components/Object3DComponent";
import { Mesh, MeshPhongMaterial } from "three";

export const onInteraction:Behavior = (entity, args, delta, entityOut, time) => {
  const event = new CustomEvent('object-activation', { detail: { url: "https://google.com" } });
  document.dispatchEvent(event);
};

export const onInteractionHover:Behavior = (entity, { focused }:{ focused:boolean }, delta, entityOut, time) => {
  const event = new CustomEvent('object-hover', { detail: { focused, label: "Use to open google.com" } });
  document.dispatchEvent(event);

  if (!hasComponent(entityOut, Object3DComponent)) {
    return;
  }

  const object3d = getMutableComponent(entityOut, Object3DComponent).value as Mesh;
  if (Array.isArray(object3d.material)) {
    object3d.material.forEach( m => {
      m.opacity = focused? 0.5 : 1;
      m.transparent = focused;
    });
  } else {
    object3d.material.opacity = focused? 0.5 : 1;
    object3d.material.transparent = focused;
  }
};