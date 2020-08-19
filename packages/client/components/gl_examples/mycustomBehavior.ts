import { Entity } from "@xr3ngine/engine/src/ecs/classes/Entity";
import { addComponent } from "@xr3ngine/engine/src/ecs";
import { State } from "@xr3ngine/engine/src/state/components/State";

export const myCustomBehavior = (entity: Entity) => {
    addComponent(entity, State)
    console.log("set up the prefab!")
}