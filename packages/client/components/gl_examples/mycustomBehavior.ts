import { Entity } from "@xr3ngine/engine/src/ecs/classes/Entity";
import { State } from "@xr3ngine/engine/src/state/components/State";
import { ScaleComponent } from "@xr3ngine/engine/src/transform/components/ScaleComponent";
import { TransformComponent } from "@xr3ngine/engine/src/transform/components/TransformComponent";
import { addComponent } from "@xr3ngine/engine/src/ecs/functions/EntityFunctions";
import { getMutableComponent, getComponent } from "@xr3ngine/engine/src/ecs/functions/EntityFunctions";

export const myCustomBehavior = (entity: Entity) => {
  console.log(entity);
  console.log('test');

  addComponent(entity,ScaleComponent)
  addComponent(entity,TransformComponent)
  let scal = getMutableComponent(entity, ScaleComponent);
  let follower = getMutableComponent(entity, TransformComponent);
//  target = getComponent<TransformComponent>(entityOut, TransformComponent);

  // follower.position = target.position
  scal.scale[2] = 9
  follower.position[1] = 8;
    console.log("set up the prefab!");
    console.log(entity);

};
