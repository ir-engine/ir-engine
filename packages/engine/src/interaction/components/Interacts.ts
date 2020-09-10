import { Component } from "../../ecs/classes/Component";
import { Entity } from "../../ecs/classes/Entity";
import { Intersection } from "three";

export class Interacts extends Component<Interacts> {
  public focusedInteractive: Entity | null
  public focusedRayHit: Intersection | null
}