import { Component } from "../../ecs/classes/Component";
import { Entity } from "../../ecs/classes/Entity";
import { Types } from "../../ecs/types/Types";
import { Intersection } from "three";

export class Interactor extends Component<Interactor> {
  public focusedInteractive: Entity | null
  public focusedRayHit: Intersection | null
  public BoxHitResult: [ Entity, boolean, number?, number? ] | null
  public subFocusedArray: any[] | null

  static schema = {
    subFocusedArray: { type: Types.Array, default: [] }
  }
}
