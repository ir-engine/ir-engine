import { Component } from "../../ecs/classes/Component";
import { Entity } from "../../ecs/classes/Entity";
import { Types } from "../../ecs/types/Types";
import { Intersection } from "three";

export class Interactor extends Component<Interactor> {
  public focusedInteractive: any
  public focusedRayHit: Intersection | null
  public BoxHitResult: any
  public subFocusedArray: any[] | null

  static schema = {
    subFocusedArray: { type: Types.Array, default: [] }
  }
}
