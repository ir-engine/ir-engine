import { createActionQueue } from '@xrengine/hyperflux'

import { Engine } from '../../ecs/classes/Engine'
import { EngineActions } from '../../ecs/classes/EngineState'
import { World } from '../../ecs/classes/World'
import { defineQuery, getComponent, hasComponent } from '../../ecs/functions/ComponentFunctions'
import { MountPoint, MountPointComponent } from '../../scene/components/MountPointComponent'
import { createInteractUI } from '../functions/interactUI'
import { addInteractableUI } from './InteractiveSystem'

const mountPointInteractMessages = {
  [MountPoint.seat]: 'Press E to Sit'
}

export default async function MountPointSystem(world: World) {
  const mountPointActionQueue = createActionQueue(EngineActions.interactedWithObject.matches)

  const mountPointQuery = defineQuery([MountPointComponent])

  if (Engine.instance.isEditor) return () => {}

  return () => {
    for (const entity of mountPointQuery.enter()) {
      const mountPoint = getComponent(entity, MountPointComponent)
      addInteractableUI(entity, createInteractUI(entity, mountPointInteractMessages[mountPoint.type]))
    }

    for (const action of mountPointActionQueue()) {
      if (!hasComponent(action.targetEntity, MountPointComponent)) return
      const mountPoint = getComponent(action.targetEntity, MountPointComponent)
      if (mountPoint.type === MountPoint.seat) {
        console.log('sitting')
      }
    }

    for (const entity of mountPointQuery.exit(world)) {
    }
  }
}
