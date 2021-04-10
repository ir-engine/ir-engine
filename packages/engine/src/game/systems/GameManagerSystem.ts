import { System } from "../../ecs/classes/System";
import { SystemUpdateType } from "../../ecs/functions/SystemUpdateType";
import { GameMode } from "../types/GameMode";

export class GameManagerSystem extends System {

  updateType = SystemUpdateType.Fixed;
  
  // Hold a game mode
  gameMode: GameMode
  
  
  execute (delta: number): void {

  }


}

GameManagerSystem.queries = {

}