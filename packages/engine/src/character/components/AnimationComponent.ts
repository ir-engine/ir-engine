import { Component } from "../../ecs/classes/Component";
import { Types } from "../../ecs/types/Types";

export class AnimationComponent extends Component<AnimationComponent> {
  animationsSchema: any;
  updateAnimationsValues: any;
}

AnimationComponent._schema = {
	animationsSchema: { type: Types.Ref, default: null },
	updateAnimationsValues: { type: Types.Ref, default: null },

};
