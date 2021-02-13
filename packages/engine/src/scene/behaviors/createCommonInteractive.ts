import { Behavior } from "../../common/interfaces/Behavior";
import { addComponent, getComponent, hasComponent } from "../../ecs/functions/EntityFunctions";
import { Interactable } from "../../interaction/components/Interactable";
import { CommonInteractiveData } from "../../templates/interactive/interfaces/CommonInteractiveData";
import { Object3DComponent } from "../components/Object3DComponent";
import { InteractiveSchema } from '../constants/InteractiveSchema';

const onInteraction: Behavior = (entityInitiator, args, delta, entityInteractive, time) => {
  const interactiveComponent = getComponent(entityInteractive, Interactable);

  // TODO: make interface for universal interactive data, and event data
  const detail: any = {};
  if (interactiveComponent.data) {
    if (typeof interactiveComponent.data.action !== 'undefined') {
      detail.action = interactiveComponent.data.action;
      detail.payload = interactiveComponent.data.payload;
      detail.interactionText = interactiveComponent.data.interactionText;
    }
  }

  const event = new CustomEvent('object-activation', { detail });
  document.dispatchEvent(event);
};

const onInteractionHover: Behavior = (entityInitiator, { focused }: { focused: boolean }, delta, entityInteractive, time) => {
  const interactiveComponent = getComponent(entityInteractive, Interactable);

  // TODO: make interface for universal interactive data, and event data
  const detail: any = { focused };

  if (interactiveComponent.data) {
    if (typeof interactiveComponent.data.action !== 'undefined') {
      detail.action = interactiveComponent.data.action;
      detail.payload = interactiveComponent.data.payload;
    }
    detail.interactionText = interactiveComponent.data.interactionText;
  }
  const event = new CustomEvent('object-hover', { detail });
  document.dispatchEvent(event);

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