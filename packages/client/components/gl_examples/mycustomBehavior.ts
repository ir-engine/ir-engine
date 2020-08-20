import { Entity } from "@xr3ngine/engine/src/ecs/classes/Entity";
import { State } from "@xr3ngine/engine/src/state/components/State";
import { addComponent } from "@xr3ngine/engine/src/ecs/functions/EntityFunctions";

export const myCustomBehavior = (entity: Entity) => {
    addComponent(entity, State)
    console.log("set up the prefab!")
}