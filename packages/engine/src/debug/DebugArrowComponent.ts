import { Vector3 } from "three";
import { Component } from "../ecs/classes/Component";
import { Types } from "../ecs/types/Types";

export class DebugArrowComponent extends Component<DebugArrowComponent> {

  public color: number;
  public direction: Vector3 = new Vector3(); 
  public position: Vector3 = new Vector3();

  static _schema = {
    color: { type:  Types.Ref, default: 0xff00ff },
  }
}