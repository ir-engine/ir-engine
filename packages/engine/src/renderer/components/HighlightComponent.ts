import { Component } from "../../ecs/classes/Component";
import { Types } from '../../ecs/types/Types';
/** Component Class For Highlight. */
export class HighlightComponent extends Component<HighlightComponent> {
  color: number
  hiddenColor: number
  edgeStrength: number
}

HighlightComponent._schema = {
  color: { type: Types.Ref, default: 0x0000ff },
  hiddenColor: { type: Types.Ref, default: 0xff0000 },
  edgeStrength: { type: Types.Ref, default: 1 }
};
