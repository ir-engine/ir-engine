import { Behavior } from "../../common/interfaces/Behavior";
import { EngineEvents } from "../../ecs/classes/EngineEvents";
import { addComponent, getComponent, hasComponent } from "../../ecs/functions/EntityFunctions";
import { Interactable } from "../../interaction/components/Interactable";
import { InteractiveSystem } from "../../interaction/systems/InteractiveSystem";
import { CommonInteractiveData } from "../../interaction/interfaces/CommonInteractiveData";
import { Object3DComponent } from "../components/Object3DComponent";
import { InteractiveSchema } from '../constants/InteractiveSchema';

const onInteraction: Behavior = (entityInitiator, args, delta, entityInteractive, time) => {
  const interactiveComponent = getComponent(entityInteractive, Interactable);

  // TODO: make interface for universal interactive data, and event data
  const engineEvent: any = {type: InteractiveSystem.EVENTS.OBJECT_ACTIVATION };
  if (interactiveComponent.data) {
    if (typeof interactiveComponent.data.action !== 'undefined') {
      engineEvent.action = interactiveComponent.data.action;
      engineEvent.payload = interactiveComponent.data.payload;
      engineEvent.interactionText = interactiveComponent.data.interactionText;
    }
  }

  EngineEvents.instance.dispatchEvent(engineEvent);
};

const onInteractionHover: Behavior = (entityInitiator, { focused }: { focused: boolean }, delta, entityInteractive, time) => {
  const interactiveComponent = getComponent(entityInteractive, Interactable);

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

export const createCommonInteractive: Behavior = (entity, args: any) => {
  if (!args.objArgs.interactable) {
    return;
  }

  const data: CommonInteractiveData = InteractiveSchema[args.objArgs.interactionType](args.objArgs, entity);

  if(!data) {
    console.error('unsupported interactionType', args.objArgs.interactionType);
    return;
  }

  const interactiveData = {
    onInteraction: onInteraction,
    onInteractionFocused: onInteractionHover,
    data
  };

  addComponent(entity, Interactable, interactiveData);
};