import { Entity } from "../../ecs/classes/Entity";
import { CommonInteractiveData } from "../../templates/interactive/interfaces/CommonInteractiveData";


export const InteractiveSchema = {
    infoBox: (objArgs, entity: Entity): CommonInteractiveData => {
        return {
            action: 'infoBox',
            payload: {
                name: objArgs.interactionText,
                url: objArgs.payloadUrl,
                buyUrl: objArgs.payloadBuyUrl,
                learnMoreUrl: objArgs.payloadLearnMoreUrl,
                modelUrl: objArgs.payloadModelUrl,
                htmlContent: objArgs.payloadHtmlContent,
            },
            interactionText: objArgs.interactionText
        };
    },
    link: (objArgs, entity: Entity): CommonInteractiveData => {
        return {
            action: 'link',
            payload: {
                name: objArgs.interactionText,
                url: objArgs.payloadUrl,
            },
            interactionText: objArgs.interactionText
        };
    }
};