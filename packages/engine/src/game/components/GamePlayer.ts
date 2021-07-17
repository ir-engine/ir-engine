import { Component } from '../../ecs/classes/Component'
import { Types } from '../../ecs/types/Types'
/**
 * @author HydraFire <github.com/HydraFire>
 */
export class GamePlayer extends Component<GamePlayer> {
  gameName: string
  role: string
  uuid: string
}

GamePlayer._schema = {
  gameName: { type: Types.String, default: null },
  role: { type: Types.String, default: null },
  uuid: { type: Types.String, default: null }
}
