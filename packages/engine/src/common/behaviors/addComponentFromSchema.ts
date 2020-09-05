import { addComponent } from "../../ecs/functions/EntityFunctions";

export const addComponentFromSchema = (entity, args: { component: any; componentArgs: any; }) => {
    addComponent(entity, args.component, args.componentArgs);
};
