import { Component } from "../../ecs/classes/Component";
import { Types } from "../../ecs/types/Types";
import { AnimationState, AnimationStateGraph } from "../animations/AnimationState";

export class AnimationComponent extends Component<AnimationComponent> {
  animationsSchema: any;
  updateAnimationsValues: any;

  currentState: AnimationState;
	animationGraph = AnimationStateGraph; // TODO: rename this

  areOtherAnimationsPaused: boolean;
  pauseOtherAnimations = (miliseconds: number): void => {
    this.areOtherAnimationsPaused = true;
		setTimeout(() => {
			this.areOtherAnimationsPaused = false;
		}, miliseconds);
  }
}

AnimationComponent._schema = {
	animationsSchema: { type: Types.Ref, default: null },
	updateAnimationsValues: { type: Types.Ref, default: null },

};
