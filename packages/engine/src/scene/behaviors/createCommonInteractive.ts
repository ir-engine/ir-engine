import { Behavior } from "../../common/interfaces/Behavior";
import { addComponent } from "../../ecs/functions/EntityFunctions";
import { onInteraction, onInteractionHover } from "../../templates/interactive/functions/commonInteractive";
import { Interactable } from "../../interaction/components/Interactable";
import { CommonInteractiveData } from "../../templates/interactive/interfaces/CommonInteractiveData";
import { InteractiveSchema } from '../constants/InteractiveSchema';

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