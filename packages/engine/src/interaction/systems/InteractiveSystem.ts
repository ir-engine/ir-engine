import { Not } from 'bitecs'

import { dispatchAction } from '@xrengine/hyperflux'

import { AudioComponent } from '../../audio/components/AudioComponent'
import { AvatarComponent } from '../../avatar/components/AvatarComponent'
import { EngineActions } from '../../ecs/classes/EngineState'
import { Entity } from '../../ecs/classes/Entity'
import {
  addComponent,
  defineQuery,
  getComponent,
  hasComponent,
  removeComponent
} from '../../ecs/functions/ComponentFunctions'
import { HighlightComponent } from '../../renderer/components/HighlightComponent'
import { Object3DComponent } from '../../scene/components/Object3DComponent'
import { VideoComponent } from '../../scene/components/VideoComponent'
import { VolumetricComponent } from '../../scene/components/VolumetricComponent'
import { toggleAudio } from '../../scene/functions/loaders/AudioFunctions'
import { toggleVideo } from '../../scene/functions/loaders/VideoFunctions'
import { toggleVolumetric } from '../../scene/functions/loaders/VolumetricFunctions'
import { BoundingBoxComponent } from '../components/BoundingBoxComponent'
import { InteractableComponent } from '../components/InteractableComponent'
import { InteractedComponent } from '../components/InteractedComponent'
import { InteractorComponent } from '../components/InteractorComponent'
import { createBoxComponent } from '../functions/createBoxComponent'
import { interactBoxRaycast } from '../functions/interactBoxRaycast'
import { createInteractUI, updateInteractUI } from '../functions/interactUI'

export default async function InteractiveSystem() {
  const interactorsQuery = defineQuery([InteractorComponent])

  // Included Object3DComponent in query because Object3DComponent might be added with delay for network spawned objects
  const interactableQuery = defineQuery([InteractableComponent, Object3DComponent, Not(AvatarComponent)])

  const interactedQuery = defineQuery([InteractedComponent])

  const InteractiveUI = new Map<Entity, ReturnType<typeof createInteractUI>>()

  const setupInteractable = (entity: Entity) => {
    const interactable = getComponent(entity, InteractableComponent).value
    if (!hasComponent(entity, BoundingBoxComponent)) {
      createBoxComponent(entity)
    }
    if (interactable.interactionType === 'ui-modal' && !InteractiveUI.get(entity)) {
      InteractiveUI.set(entity, createInteractUI(entity))
    }
  }

  return () => {
    for (const entity of interactableQuery.enter()) {
      setupInteractable(entity)
    }

    for (const entity of interactableQuery.exit()) {
      if (InteractiveUI.has(entity)) InteractiveUI.delete(entity)
      if (hasComponent(entity, HighlightComponent)) removeComponent(entity, HighlightComponent)
    }

    const interactives = interactableQuery()

    for (const entity of interactives) {
      if (InteractiveUI.has(entity)) updateInteractUI(entity, InteractiveUI.get(entity)!)
      if (hasComponent(entity, HighlightComponent)) removeComponent(entity, HighlightComponent)
    }

    for (const entity of interactorsQuery()) {
      interactBoxRaycast(entity, interactives)
      const interactor = getComponent(entity, InteractorComponent)
      if (interactor.focusedInteractive) {
        if (!hasComponent(interactor.focusedInteractive, HighlightComponent)) {
          addComponent(interactor.focusedInteractive, HighlightComponent, {})
        }
      }
    }

    for (const entity of interactedQuery.enter()) {
      const interactiveComponent = getComponent(entity, InteractableComponent).value
      if (hasComponent(entity, AudioComponent)) {
        toggleAudio(entity)
      } else if (hasComponent(entity, VideoComponent)) {
        toggleVideo(entity)
      } else if (hasComponent(entity, VolumetricComponent)) {
        toggleVolumetric(entity)
      } else {
        dispatchAction(EngineActions.objectActivation({ interactionData: interactiveComponent }))
      }
      removeComponent(entity, InteractedComponent)
    }
  }
}
