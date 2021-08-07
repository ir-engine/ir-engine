import { addComponent, getEntityByName, getMutableComponent } from '@xrengine/engine/src/ecs/functions/EntityFunctions'
import { AnimationComponent } from '@xrengine/engine/src/avatar/components/AnimationComponent'
import { EngineEvents } from '@xrengine/engine/src/ecs/classes/EngineEvents'
import Video from '@xrengine/engine/src/scene/classes/Video'
import { Object3DComponent } from '@xrengine/engine/src/scene/components/Object3DComponent'
import { AnimationClip, LoopRepeat } from 'three'
import { delay } from '@xrengine/engine/src/common/functions/delay'

export const DJModelName = 'dj'
export const DJAnimationName = 'Animation'

export const basscoast = async () => {
  EngineEvents.instance.addEventListener(EngineEvents.EVENTS.JOINED_WORLD, async () => {
    const djEntity = getEntityByName(DJModelName)

    const animationComponent = getMutableComponent(djEntity, AnimationComponent)

    const action = animationComponent.mixer.clipAction(
      AnimationClip.findByName(animationComponent.animations, DJAnimationName)
    )
    action.setEffectiveWeight(1)
    animationComponent.currentState.animations = [
      {
        name: DJAnimationName,
        weight: 1,
        loopType: LoopRepeat,
        action
      }
    ]
    // Get entity from the name
    const entity = getEntityByName('video')

    // Get Object 3d component to get the video element
    const videoComp = getMutableComponent(entity, Object3DComponent)
    const video = videoComp.value as Video

    // Wait untill user made some engagement with the platform
    // If user is not engaged then latest browsers will prevent autoplay of the video

    // Get time elapsed since start of the video in seconds
    const time = Math.round(Date.now() - video.startTime)

    if (time < 0) {
      await delay(Math.abs(time))
    }

    await video.loadVideo(video.src)

    const videoElement = video.el

    videoElement.addEventListener('play', () => {
      const djEntity = getEntityByName(DJModelName)

      if (djEntity) {
        const animationComponent = getMutableComponent(djEntity, AnimationComponent)

        animationComponent.currentState.animations[0].action.play()
        animationComponent.mixer.update(videoElement.currentTime)
      }
    })

    // If event has already started, sync to the current time
    if (time > 0) {
      // If time is greater than duration of the video then loop the video
      video.seek((time / 1000) % 3587)
    }

    // iOS MUST have video.play() called from a user interaction DOM event

    if ((window as any).iOS) {
      // TODO: we should add some sort of notify to the user
      const onUserEngage = () => {
        ;['click', 'touchstart', 'touchend', 'pointerdown'].forEach((type) => {
          window.removeEventListener(type, onUserEngage)
        })
        videoElement.muted = false
        videoElement.play()
      }
      ;['click', 'touchstart', 'touchend', 'pointerdown'].forEach((type) => {
        window.addEventListener(type, onUserEngage)
      })
    } else {
      videoElement.muted = false
      videoElement.play()
    }
  })
}
