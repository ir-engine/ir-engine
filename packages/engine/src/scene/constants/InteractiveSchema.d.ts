import { Entity } from "../../ecs/classes/Entity";
import { CommonInteractiveData } from "../../templates/interactive/interfaces/CommonInteractiveData";
export declare const InteractiveSchema: {
    infoBox: (objArgs: any, entity: Entity) => CommonInteractiveData;
    link: (objArgs: any, entity: Entity) => CommonInteractiveData;
};
