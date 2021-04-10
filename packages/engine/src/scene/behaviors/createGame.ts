import { Behavior } from "../../common/interfaces/Behavior";
import { addComponent } from "../../ecs/functions/EntityFunctions";
import { Game } from "../../game/components/Game";

export const createGame: Behavior = (entity, args: any) => {

  // TODO: We need to set the transform of this object

  console.log("************ GAME CREATED!!!!!!!!!!!!!!");
  console.log(args);

  const gameData = {
    isGlobal: args.isGlobal,
    minPlayers: args.minPlayers,
    maxPlayers: args.maxPlayers,
    gameMode: args.gameMode
  };

  addComponent(entity, Game, gameData);
};