import { Behavior } from "../../common/interfaces/Behavior";
import { isServer } from '../../common/functions/isServer';
import { addComponent, getMutableComponent } from "../../ecs/functions/EntityFunctions";
import { Game } from "../../game/components/Game";
import { GameObject } from "../../game/components/GameObject";
import { TransformComponent } from '../../transform/components/TransformComponent';

export const createGame: Behavior = (entity, args: any) => {
  console.warn(args.objArgs.isGlobal);
  console.warn(isServer && !args.objArgs.isGlobal);
//  if (isServer && !args.objArgs.isGlobal) return;
  console.log("************ GAME CREATED!!!!!!!!!!!!!!");
  console.log(args.objArgs);

  const transform = getMutableComponent(entity, TransformComponent);

  transform.scale.set(
    Math.abs(transform.scale.x) / 2,
    Math.abs(transform.scale.y) / 2,
    Math.abs(transform.scale.z) / 2
  );

  let p = transform.position;
  let s = transform.scale;
  let min = { x: (-s.x) + p.x, y: (-s.y) + p.y, z: (-s.z) + p.z };
  let max = { x: s.x + p.x, y: s.y + p.y, z: s.z + p.z };

  const gameData = {
    name: args.objArgs.name,
    isGlobal: args.objArgs.isGlobal,
    minPlayers: args.objArgs.minPlayers,
    maxPlayers: args.objArgs.maxPlayers,
    gameMode: args.objArgs.gameMode,
    gameArea: { min, max }
  };

  addComponent(entity, Game, gameData);
};

export const createGameObject: Behavior = (entity, args: any) => {
  console.log("************ Object CREATED!!!!!!!!!!!!!!");
  if (args.objArgs.uuid === undefined) {
    console.warn("DONT SAVE COLLIDER FOR GAME OBJECT");
  }
//  if (isServer && !args.objArgs.isGlobal) {
    //removeEntity(entity);
//    return;
//  }
  const data = {
    game: args.objArgs.game,
    role: args.objArgs.role,
    uuid: args.objArgs.uuid
  };
  addComponent(entity, GameObject, data);
};
