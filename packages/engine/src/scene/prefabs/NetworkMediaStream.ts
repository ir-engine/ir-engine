import { DJModelName } from "../../character/AnimationManager";
import { AnimationComponent } from "../../character/components/AnimationComponent";
import { CharacterComponent } from "../../character/components/CharacterComponent";
import { awaitEngaged } from "../../ecs/classes/Engine";
import { delay } from "../../ecs/functions/EngineFunctions";
import { getEntityByName, getMutableComponent } from "../../ecs/functions/EntityFunctions";
import { NetworkPrefab } from "../../networking/interfaces/NetworkPrefab";
import { NetworkObjectCreateInterface } from "../../networking/interfaces/WorldState";
import { elementPlaying } from "../behaviors/createMedia";
import Video from "../classes/Video";
import { Object3DComponent } from "../components/Object3DComponent";

export const NetworkMediaStream: NetworkPrefab = {
  initialize: async (args: NetworkObjectCreateInterface) => {

    // Get entity from the name
    const entity = getEntityByName(args.parameters.sceneEntityName);

    // Get Object 3d component to get the video element
    const videoComp = getMutableComponent(entity, Object3DComponent);

    // Wait untill user made some engagement with the platform
    // If user is not engaged then latest browsers will prevent autoplay of the video

    console.log('awaiting engagement')

    // TODO: disabled for event
    // await awaitEngaged();
      
    // Get time elapsed since start of the video in seconds
    const time = Math.round(Date.now() - args.parameters.startTime);
    console.log('time', time)
    if (time < 0) {
      await delay(Math.abs(time))
    }

    const interval = setInterval(async () => {

      const video = videoComp.value as Video;
      await video.loadVideo(args.parameters.src);

      const videoElement = video.el;

      console.log('playing video...')
      console.log(time / 1000, videoElement.duration)
      // If event has already started, sync to the current time
      if (time > 0) {
        // If time is greater than duration of the video then loop the video
        videoElement.currentTime = (time / 1000) % 3587;
      } else {
        videoElement.currentTime = 0
      }
      if(!(window as any).iOS) {
        videoElement.play();
      }

      await delay(100)

      console.log(videoElement.currentTime, !videoElement.paused, !videoElement.ended, videoElement.readyState > 2)

      if(videoElement.readyState > 2 && !videoElement.paused ) {

        // Start animation for DJ.
        const djEntity = getEntityByName(DJModelName);
    
        if (djEntity) {
          const animationComponent = getMutableComponent(djEntity, AnimationComponent);
    
          animationComponent.currentState.animations[0].action.play();
          animationComponent.mixer.update(videoElement.currentTime)
        }

        clearInterval(interval)
      }

    }, 2000)
  },
  clientComponents: [],
  networkComponents: [],
  serverComponents: [],
};
