import { Component } from "../../ecs/classes/Component";
import { Types } from "../../ecs/types/Types";
import { Behavior } from "../../common/interfaces/Behavior";
import { InteractionCheckHandler } from "../types/InteractionTypes";

export class Interactable extends Component<Interactable> {
  static _schema = {
    interactiveDistance: { type: Types.Number, default: Infinity },
    onInteractionCheck: { type: Types.Ref },
    onInteractionFocused: { type: Types.Ref },
    onInteraction: { type: Types.Ref },
    interactionParts: { type: Types.Array },
    interactionPartsPosition: { type: Types.Array },
    data: { type: Types.Ref }
  }

  public onInteractionCheck: InteractionCheckHandler
  public onInteraction: Behavior
  public onInteractionFocused: Behavior
  public interactiveDistance: number
  public interactionParts: Array<any> = []
  public interactionPartsPosition: Array<any> = []
  public data: any
}
