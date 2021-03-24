import { Behavior } from "@xr3ngine/engine/src/common/interfaces/Behavior";
import { getComponent, getMutableComponent, hasComponent } from "../../ecs/functions/EntityFunctions";
import { Object3DComponent } from "@xr3ngine/engine/src/scene/components/Object3DComponent";
import { Interactable } from "../components/Interactable";
import { EngineEvents } from "../../ecs/classes/EngineEvents";
import { InteractiveSystem } from "../systems/InteractiveSystem";

export const onInteraction: Behavior = (entityInitiator, args, delta, entityInteractive, time) => {
  const interactiveComponent = getComponent(entityInteractive, Interactable);

  const engineEvent: any = { type: InteractiveSystem.EVENTS.OBJECT_ACTIVATION };

  // TODO: make interface for universal interactive data, and event data
  if (interactiveComponent.data) {
    if (typeof interactiveComponent.data.action !== 'undefined') {
      engineEvent.action = interactiveComponent.data.action;
      engineEvent.payload = interactiveComponent.data.payload;
      engineEvent.interactionText = interactiveComponent.data.interactionText;
    }
  }

  EngineEvents.instance.dispatchEvent(engineEvent);
};

export const onInteractionHover: Behavior = (entityInitiator, { focused }: { focused: boolean }, delta, entityInteractive, time) => {
  const interactiveComponent = getComponent(entityInteractive, Interactable);
  // TODO: make interface for universal interactive data, and event data
  const engineEvent: any = { type: InteractiveSystem.EVENTS.OBJECT_HOVER, focused };

  if (interactiveComponent.data) {
    if (typeof interactiveComponent.data.action !== 'undefined') {
      engineEvent.action = interactiveComponent.data.action;
      engineEvent.payload = interactiveComponent.data.payload;
    }
    engineEvent.interactionText = interactiveComponent.data.interactionText;
  }
  EngineEvents.instance.dispatchEvent(engineEvent);


  if (!hasComponent(entityInteractive, Object3DComponent)) {
    return;
  }

  // TODO: add object to OutlineEffect.selection? or add OutlineEffect

  // const object3d = getMutableComponent(entityInteractive, Object3DComponent).value as Mesh;
};