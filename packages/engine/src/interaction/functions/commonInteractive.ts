import { isServer } from '@xr3ngine/engine/src/common/functions/isServer';
import { Behavior } from "@xr3ngine/engine/src/common/interfaces/Behavior";
import { getComponent, getMutableComponent, hasComponent } from "../../ecs/functions/EntityFunctions";
import { Object3DComponent } from "@xr3ngine/engine/src/scene/components/Object3DComponent";
import { Interactable } from "../components/Interactable";
import { EngineEvents } from "../../ecs/classes/EngineEvents";
import { InteractiveSystem } from "../systems/InteractiveSystem";

export const onInteraction: Behavior = (entityInitiator, args, delta, entityInteractive, time) => {
  const interactiveComponent = getComponent(entityInteractive, Interactable);
  EngineEvents.instance.dispatchEvent({ type: InteractiveSystem.EVENTS.OBJECT_ACTIVATION, ...interactiveComponent.data });
};

export const onInteractionHover: Behavior = (entityInitiator, { focused }: { focused: boolean }, delta, entityInteractive, time) => {
  if (isServer) return;
  const interactiveComponent = getComponent(entityInteractive, Interactable);  
  EngineEvents.instance.dispatchEvent({ type: InteractiveSystem.EVENTS.OBJECT_HOVER, focused, ...interactiveComponent.data });

  if (!hasComponent(entityInteractive, Object3DComponent)) {
    return;
  }

  // TODO: add object to OutlineEffect.selection? or add OutlineEffect

  // const object3d = getMutableComponent(entityInteractive, Object3DComponent).value as Mesh;
};
