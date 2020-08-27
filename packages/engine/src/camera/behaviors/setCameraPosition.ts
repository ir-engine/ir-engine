import { Behavior } from '../../common/interfaces/Behavior';
import { Entity } from '../../ecs/classes/Entity';
import { Engine } from '../../ecs/classes/Engine';

export const setCameraPosition: Behavior = (entity: Entity): void => {
  Engine.camera.position.set(0, 1.2, 5);
  console.log("Positioning camera");
};
