import { addComponent } from "../../ecs/functions/EntityFunctions";

export const addComponentFromSchema = (entity, args: { component: any; componentArgs: any; }) => {
    addComponent(entity, args.component, args.componentArgs);
    console.log("Added component: ", args.component);
};
