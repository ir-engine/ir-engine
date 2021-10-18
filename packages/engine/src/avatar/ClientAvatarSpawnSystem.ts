import { FollowCameraComponent } from '../camera/components/FollowCameraComponent'
import { CameraMode } from '../camera/types/CameraMode'
import { addComponent } from '../ecs/functions/ComponentFunctions'
import { LocalInputTagComponent } from '../input/components/LocalInputTagComponent'
import { PersistTagComponent } from '../scene/components/PersistTagComponent'
import { ShadowComponent } from '../scene/components/ShadowComponent'
import { createAvatar } from './functions/createAvatar'
import { AudioTagComponent } from '../audio/components/AudioTagComponent'
import { System } from '../ecs/classes/System'
import { World } from '../ecs/classes/World'
import { Engine } from '../ecs/classes/Engine'
import { NetworkWorldAction } from '../networking/functions/NetworkWorldAction'
import matches from 'ts-matches'
import { Raycaster } from 'three'

export default async function ClientAvatarSpawnSystem(world: World): Promise<System> {
  world.receptors.push((action) => {
    matches(action).when(NetworkWorldAction.spawnAvatar.matches, (spawnAction) => {
      const entity = createAvatar(spawnAction)

      addComponent(entity, AudioTagComponent, {})
      // addComponent(entity, InterpolationComponent, {})
      addComponent(entity, ShadowComponent, { receiveShadow: true, castShadow: true })

      if (spawnAction.userId === Engine.userId) {
        addComponent(entity, LocalInputTagComponent, {})
        addComponent(entity, FollowCameraComponent, {
          mode: CameraMode.ThirdPerson,
          distance: 5,
          zoomLevel: 5,
          zoomVelocity: { value: 0 },
          minDistance: 2,
          maxDistance: 7,
          theta: Math.PI,
          phi: 0,
          shoulderSide: true,
          locked: true,
          raycaster: new Raycaster()
        })
        addComponent(entity, PersistTagComponent, {})
      }
    })
  })

  return () => {}
}
