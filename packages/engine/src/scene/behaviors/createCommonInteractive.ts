import { Behavior } from "../../common/interfaces/Behavior";
import { EngineEvents } from "../../ecs/classes/EngineEvents";
import { addComponent, getComponent, hasComponent } from "../../ecs/functions/EntityFunctions";
import { Interactable } from "../../interaction/components/Interactable";
import { InteractiveSystem } from "../../interaction/systems/InteractiveSystem";
import { CommonInteractiveData } from "../../interaction/interfaces/CommonInteractiveData";
import { Object3DComponent } from "../components/Object3DComponent";

const onInteraction: Behavior = (entityInitiator, args, delta, entityInteractive, time) => {
  const interactiveComponent = getComponent(entityInteractive, Interactable);
  EngineEvents.instance.dispatchEvent({type: InteractiveSystem.EVENTS.OBJECT_ACTIVATION, ...interactiveComponent.data });
};

const onInteractionHover: Behavior = (entityInitiator, { focused }: { focused: boolean }, delta, entityInteractive, time) => {
  const interactiveComponent = getComponent(entityInteractive, Interactable);

  const engineEvent: any = { type: InteractiveSystem.EVENTS.OBJECT_HOVER, focused, ...interactiveComponent.data };
  EngineEvents.instance.dispatchEvent(engineEvent);

  if (!hasComponent(entityInteractive, Object3DComponent)) {
    return;
  }

  // TODO: add object to OutlineEffect.selection? or add OutlineEffect

  // const object3d = getMutableComponent(entityInteractive, Object3DComponent).value as Mesh;
};

export const createCommonInteractive: Behavior = (entity, args: any) => {
  if (!args.objArgs.interactable) {
    return;
  }

  console.log(args.objArgs)

  const interactiveData = {
    onInteraction: onInteraction,
    onInteractionFocused: onInteractionHover,
    data: args.objArgs
  };

  addComponent(entity, Interactable, interactiveData);
};