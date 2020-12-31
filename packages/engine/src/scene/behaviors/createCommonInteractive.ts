import { Behavior } from "../../common/interfaces/Behavior";
import { addComponent } from "../../ecs/functions/EntityFunctions";
import { onInteraction, onInteractionHover } from "../../templates/interactive/functions/commonInteractive";
import { Interactable } from "../../interaction/components/Interactable";
import { CommonInteractiveData } from "../../templates/interactive/interfaces/CommonInteractiveData";

export const createCommonInteractive: Behavior = (entity, args: any) => {
  if (!args.objArgs.interactable) {
    return;
  }

  let data:CommonInteractiveData;

  if (args.objArgs.interactionType === "infoBox") {
    data = {
      action: 'infoBox',
      payload: {
        name: args.objArgs.payloadName,
        url: args.objArgs.payloadUrl,
        buyUrl: args.objArgs.payloadBuyUrl,
        learnMoreUrl: args.objArgs.payloadLearnMoreUrl,
        modelUrl: args.objArgs.payloadModelUrl,
        htmlContent:args.objArgs.payloadHtmlContent,
      },
      interactionText: args.objArgs.interactionText
    };
  } else if (args.objArgs.interactionType === "link") {
    data = {
      action: 'link',
      payload: {
        name: args.objArgs.payloadName,
        url: args.objArgs.payloadUrl,
      },
      interactionText: args.objArgs.interactionText
    };
  } else {
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