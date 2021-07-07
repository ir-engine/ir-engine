import { DJModelName } from "../../character/AnimationManager";
import { AnimationComponent } from "../../character/components/AnimationComponent";
import { awaitEngaged } from "../../ecs/classes/Engine";
import { getEntityByName, getMutableComponent } from "../../ecs/functions/EntityFunctions";
import { NetworkPrefab } from "../../networking/interfaces/NetworkPrefab";
import { NetworkObjectCreateInterface } from "../../networking/interfaces/WorldState";
import { Object3DComponent } from "../components/Object3DComponent";

export const NetworkMediaStream: NetworkPrefab = {
    initialize: async (args: NetworkObjectCreateInterface) => {
        // Get entity from the name
        const entity = getEntityByName(args.parameters.sceneEntityName);

        // Get Object 3d component to get the video element
        const videoComp = getMutableComponent(entity, Object3DComponent);

        // Wait untill user made some engagement with the platform
        // If user is not engaged then latest browsers will prevent autoplay of the video
        await awaitEngaged();

        const videoElement = (videoComp.value as any).el as HTMLVideoElement;
        if (videoElement) {
            // Get time elapsed since start of the video in seconds
            const time = (Date.now() - args.parameters.startTime) / 1000;

            // If time is greater than duration of the video then loop the video
            videoElement.currentTime = time % videoElement.duration;
            videoElement.play();

            // Start animation for DJ.
            const djEntity = getEntityByName(DJModelName);

            if (djEntity) {
                const animationComponent = getMutableComponent(djEntity, AnimationComponent);
                animationComponent.currentState.animations[0].action.play();
            }
        }
    },
    clientComponents: [],
    networkComponents: [],
    serverComponents: [],
};
