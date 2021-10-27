import matches from 'ts-matches'
import { AudioTagComponent } from '../audio/components/AudioTagComponent'
import { FollowCameraComponent, FollowCameraDefaultValues } from '../camera/components/FollowCameraComponent'
import { Engine } from '../ecs/classes/Engine'
import { System } from '../ecs/classes/System'
import { World } from '../ecs/classes/World'
import { addComponent } from '../ecs/functions/ComponentFunctions'
import { LocalInputTagComponent } from '../input/components/LocalInputTagComponent'
import { NetworkWorldAction } from '../networking/functions/NetworkWorldAction'
import { PersistTagComponent } from '../scene/components/PersistTagComponent'
import { ShadowComponent } from '../scene/components/ShadowComponent'
import { createAvatar } from './functions/createAvatar'

export default async function ClientAvatarSpawnSystem(world: World): Promise<System> {
  world.receptors.push((action) => {
    matches(action).when(NetworkWorldAction.spawnAvatar.matches, (spawnAction) => {
      const entity = createAvatar(spawnAction)

      addComponent(entity, AudioTagComponent, {})
      // addComponent(entity, InterpolationComponent, {})
      addComponent(entity, ShadowComponent, { receiveShadow: true, castShadow: true })

      if (spawnAction.userId === Engine.userId) {
        addComponent(entity, LocalInputTagComponent, {})
        addComponent(entity, FollowCameraComponent, FollowCameraDefaultValues)
        addComponent(entity, PersistTagComponent, {})
      }
    })
  })

  return () => {}
}
