import { Object3D, Vector3 } from 'three'
import { defineQuery, getComponent } from '../ecs/functions/ComponentFunctions'
import { AnimationComponent } from './components/AnimationComponent'
import { AvatarAnimationGraph } from './animation/AvatarAnimationGraph'
import { AvatarStates } from './animation/Util'
import { AnimationManager } from './AnimationManager'
import { AvatarAnimationComponent } from './components/AvatarAnimationComponent'
import { AnimationGraph } from './animation/AnimationGraph'
import { World } from '../ecs/classes/World'
import { Engine } from '../ecs/classes/Engine'
import { NetworkObjectComponent } from '../networking/components/NetworkObjectComponent'
import matches from 'ts-matches'
import { NetworkWorldAction } from '../networking/functions/NetworkWorldAction'
import { IKRigComponent } from '../ikrig/components/IKRigComponent'

const animationQuery = defineQuery([AnimationComponent, IKRigComponent])
const avatarAnimationQuery = defineQuery([AnimationComponent, AvatarAnimationComponent])

export default async function AnimationSystem(world: World) {
  // world.receptors.push(animationActionReceptor)

  // function animationActionReceptor(action) {
  //   matches(action).when(NetworkWorldAction.avatarAnimation.matches, ({ $from }) => {
  //     if ($from === Engine.userId) {
  //       return
  //     }

  //     const avatarEntity = world.getUserAvatarEntity($from)
  //     const networkObject = getComponent(avatarEntity, NetworkObjectComponent)
  //     if (!networkObject) {
  //       return console.warn(`Avatar Entity for user id ${$from} does not exist! You should probably reconnect...`)
  //     }
  //     action.params.forceTransition = true
  //     AnimationGraph.forceUpdateAnimationState(avatarEntity, action.newStateName, action.params)
  //   })
  // }

  await AnimationManager.instance.getAnimations()

  let log = true

  return () => {
    const { delta } = world

    for (const entity of animationQuery(world)) {
      const animationComponent = getComponent(entity, AnimationComponent)
      const modifiedDelta = delta * animationComponent.animationSpeed
      animationComponent.mixer.update(modifiedDelta)

      const bones = getComponent(entity, IKRigComponent).boneStructure
      // console.log(bones.Hips.position)

      const rootPos = AnimationManager.instance._defaultRootBone.position
      //bones.Hips.position.setX(rootPos.x).setY(rootPos.y).z
      bones.Hips.position.copy(rootPos)
    }

    for (const entity of avatarAnimationQuery.enter(world)) {
      // const avatarAnimationComponent = getComponent(entity, AvatarAnimationComponent)
      // const animationComponent = getComponent(entity, AnimationComponent)
    }

    for (const entity of avatarAnimationQuery(world)) {
      const animationComponent = getComponent(entity, AnimationComponent)
      const avatarAnimationComponent = getComponent(entity, AvatarAnimationComponent)
      const deltaTime = delta * animationComponent.animationSpeed
      avatarAnimationComponent.animationGraph.update(deltaTime)
    }
  }
}
