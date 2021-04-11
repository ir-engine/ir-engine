import { System } from "../../ecs/classes/System";
import { SystemUpdateType } from "../../ecs/functions/SystemUpdateType";
import { Game } from "../components/Game";
import { GameObject } from "../components/GameObject";
import { GamePlayer } from "../components/GamePlayer";

export class GameManagerSystem extends System {

  updateType = SystemUpdateType.Fixed;
  
  execute (delta: number): void {

  }
}

GameManagerSystem.queries = {
  game: {
    components: [Game],
    listen: {
      added: true,
      removed: true
    }
  },
  gameObject: {
    components: [GameObject],
    listen: {
      added: true,
      removed: true
    }
  },
  gamePlayers: {
    components: [GamePlayer],
    listen: {
      added: true,
      removed: true
    }
  },
}