import { Not } from 'bitecs'

import { XRUIComponent } from '@xrengine/engine/src/xrui/components/XRUIComponent'

import { AudioComponent } from '../../audio/components/AudioComponent'
import { AvatarComponent } from '../../avatar/components/AvatarComponent'
import { EngineEvents } from '../../ecs/classes/EngineEvents'
import { accessEngineState, EngineActions } from '../../ecs/classes/EngineService'
import { Entity } from '../../ecs/classes/Entity'
import { World } from '../../ecs/classes/World'
import {
  addComponent,
  defineQuery,
  getComponent,
  hasComponent,
  removeComponent
} from '../../ecs/functions/ComponentFunctions'
import { dispatchLocal } from '../../networking/functions/dispatchFrom'
import { receiveActionOnce } from '../../networking/functions/matchActionOnce'
import { HighlightComponent } from '../../renderer/components/HighlightComponent'
import { Object3DComponent } from '../../scene/components/Object3DComponent'
import { VideoComponent } from '../../scene/components/VideoComponent'
import { VolumetricComponent } from '../../scene/components/VolumetricComponent'
import { toggleAudio } from '../../scene/functions/loaders/AudioFunctions'
import { toggleVideo } from '../../scene/functions/loaders/VideoFunctions'
import { toggleVolumetric } from '../../scene/functions/loaders/VolumetricFunctions'
import { BoundingBoxComponent } from '../components/BoundingBoxComponent'
import { EquippedComponent } from '../components/EquippedComponent'
import { InteractableComponent } from '../components/InteractableComponent'
import { InteractedComponent } from '../components/InteractedComponent'
import { InteractiveFocusedComponent } from '../components/InteractiveFocusedComponent'
import { InteractorComponent } from '../components/InteractorComponent'
import { SubFocusedComponent } from '../components/SubFocusedComponent'
import { createBoxComponent } from '../functions/createBoxComponent'
import { interactBoxRaycast } from '../functions/interactBoxRaycast'
import { createInteractUI, hideInteractUI, showInteractUI, updateInteractUI } from '../functions/interactUI'

export const InteractiveUI = new Map<Entity, ReturnType<typeof createInteractUI>>()

export default async function InteractiveSystem(world: World) {
  const interactorsQuery = defineQuery([InteractorComponent])
  // Included Object3DComponent in query because Object3DComponent might be added with delay for network spawned objects
  const interactiveQuery = defineQuery([
    InteractableComponent,
    Object3DComponent,
    Not(EquippedComponent),
    Not(AvatarComponent)
  ])
  const boundingBoxQuery = defineQuery([BoundingBoxComponent])
  const focusQuery = defineQuery([InteractableComponent, InteractiveFocusedComponent])
  const subfocusQuery = defineQuery([InteractableComponent, SubFocusedComponent])
  const interactedQuery = defineQuery([InteractedComponent])

  return () => {
    for (const entity of interactiveQuery.enter(world)) {
      // TODO: quick hack while objects to not load immediately #5352

      const setupInteractable = () => {
        const interactable = getComponent(entity, InteractableComponent).value
        if (!hasComponent(entity, BoundingBoxComponent)) {
          createBoxComponent(entity)
        }
        if (interactable.interactionType === 'ui-modal' && !InteractiveUI.get(entity)) {
          createInteractUI(entity)
        }
      }

      if (accessEngineState().sceneLoaded.value) setupInteractable()
      else receiveActionOnce(EngineEvents.EVENTS.SCENE_LOADED, setupInteractable)
    }

    for (const entity of interactiveQuery.exit(world)) {
      // this getComponent check is required for handling cases when multiple setEquippedObject cached network action are received
      // and this exit query could get called with EquippedComponent not being present on the entity
      if (getComponent(entity, EquippedComponent)) {
        removeComponent(entity, BoundingBoxComponent)
      }

      hasComponent(entity, InteractableComponent) && removeComponent(entity, InteractiveFocusedComponent)
      hasComponent(entity, SubFocusedComponent) && removeComponent(entity, SubFocusedComponent)
    }

    const interactives = interactiveQuery(world)

    for (const entity of interactorsQuery(world)) {
      if (interactives.length) {
        interactBoxRaycast(entity, boundingBoxQuery(world))
        const interacts = getComponent(entity, InteractorComponent)
        if (interacts.focusedInteractive) {
          if (!hasComponent(interacts.focusedInteractive, InteractiveFocusedComponent)) {
            addComponent(interacts.focusedInteractive, InteractiveFocusedComponent, {})
          }
        }

        // unmark all unfocused
        for (const entityInter of interactives) {
          if (entityInter !== interacts.focusedInteractive && hasComponent(entityInter, InteractiveFocusedComponent)) {
            removeComponent(entityInter, InteractiveFocusedComponent)
          }
          if (interacts.subFocusedArray.some((v) => v[0].entity === entityInter)) {
            if (!hasComponent(entityInter, SubFocusedComponent)) {
              addComponent(entityInter, SubFocusedComponent, { subInteracts: entityInter })
            }
          } else {
            removeComponent(entityInter, SubFocusedComponent)
          }
        }
      }
    }

    // removal is the first because the hint must first be deleted, and then a new one appears
    for (const entity of focusQuery.exit()) {
      hideInteractUI(entity)
    }

    for (const entity of focusQuery.enter()) {
      showInteractUI(entity)
    }

    for (const entity of subfocusQuery.enter()) {
      addComponent(entity, HighlightComponent, {})
    }
    for (const entity of subfocusQuery.exit()) {
      removeComponent(entity, HighlightComponent)
    }

    for (const [entity, ui] of InteractiveUI) {
      updateInteractUI(entity, ui)
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
        dispatchLocal(EngineActions.objectActivation(interactiveComponent))
      }
      removeComponent(entity, InteractedComponent)
    }
  }
}
