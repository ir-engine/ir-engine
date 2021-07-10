import { Entity } from "../../ecs/classes/Entity";
import { getMutableComponent } from "../../ecs/functions/EntityFunctions";
import { Network } from "../../networking/classes/Network";
import { convertBufferSupportedStringToObj } from "../../networking/functions/jsonSerialize";
import { NetworkObjectEditInterface } from "../../networking/interfaces/WorldState";
import { AnimationComponent } from "../components/AnimationComponent";

export const handleAnimationStateChange = (editObject: NetworkObjectEditInterface): void => {
    if(!Network.instance.networkObjects[editObject.networkId]) {
        return console.warn(`Entity with id ${editObject.networkId} does not exist! You should probably reconnect...`);
    }

    if (Network.instance.networkObjects[editObject.networkId].ownerId === Network.instance.userId) return;

    const entity: Entity = Network.instance.networkObjects[editObject.networkId].component.entity;
    const animationComponent = getMutableComponent(entity, AnimationComponent);

    const animationDetail = convertBufferSupportedStringToObj(editObject.data[0]);
    const animationState = animationComponent.animationGraph.states[animationDetail.state];

    if (animationDetail.params.recalculateWeights && animationState.name === animationComponent.currentState.name) {
        if (animationComponent.currentState.changeAnimationSmoothly) {
            animationComponent.currentState.changeAnimationSmoothly(animationDetail.params)
        }
    } else {
        animationComponent.animationGraph.transitionState(animationComponent, animationState.name, animationDetail.params);
        if (animationDetail.params.smoothChange && animationComponent.currentState.changeAnimationSmoothly) {
            animationComponent.currentState.changeAnimationSmoothly(animationDetail.params)
        }
    }
}
