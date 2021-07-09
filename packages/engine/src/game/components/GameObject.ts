import { Component } from '../../ecs/classes/Component'
import { Types } from '../../ecs/types/Types'
import type { GameObjectInteractionSchema } from '../interfaces/GameObjectPrefab'
/**
 * @author HydraFire <github.com/HydraFire>
 */
export class GameObject extends Component<GameObject> {
  gameName: string
  role: string
  uuid: string
  collisionBehaviors: GameObjectInteractionSchema

  static _schema = {
    gameName: { type: Types.String, default: null },
    role: { type: Types.String, default: null },
    uuid: { type: Types.String, default: null },
    collisionBehaviors: { type: Types.JSON, default: {} }
  }
}
