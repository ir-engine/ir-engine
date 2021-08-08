import { defineQuery, defineSystem } from 'bitecs'
import { AnimationClip, AnimationMixer } from 'three'


// === AnimationComponent.ts === /
type AnimationComponentType = {
  mixer: AnimationMixer
  animations: AnimationClip[]
  animationSpeed: number
}

export const AnimationComponent = createMappedComponent<AnimationComponentType>()

// === AnimationModule.ts === /
const animationQuery = defineQuery([AnimationComponent])

export const createAnimationSystem = async (): Promise<System> => {
  return defineSystem((world: ECSWorld) => {
    const { delta } = world
    for (const entity of animationQuery(world)) {
      const anim = getComponent(entity, AnimationComponent)
      anim.mixer.update(delta)
    }
    return world
  })
}
