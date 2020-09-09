import { Component } from "../../ecs/classes/Component";
import { Types } from "../../ecs/types/Types";
import { Behavior } from "../../common/interfaces/Behavior";
import { InteractionCheckHandler } from "../types";

export class Interactive extends Component<Interactive> {
  static schema = {
    interactiveDistance: { type: Types.Number, default: Infinity },
    onInteractionCheck: { type: Types.Ref },
    onInteraction: { type: Types.Ref }
  }

  public onInteractionCheck:InteractionCheckHandler
  public onInteraction:Behavior
  public interactiveDistance:number

}