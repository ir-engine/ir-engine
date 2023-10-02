/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/EtherealEngine/etherealengine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Ethereal Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Ethereal Engine team.

All portions of the code written by the Ethereal Engine team are Copyright © 2021-2023 
Ethereal Engine. All Rights Reserved.
*/

import { useEffect } from 'react'

import { getState } from '@etherealengine/hyperflux'
import { useTranslation } from 'react-i18next'
import { MeshBasicMaterial, Vector3 } from 'three'
import { clamp } from 'three/src/math/MathUtils'
import { getAvatarBoneWorldPosition } from '../../avatar/functions/avatarFunctions'
import { matches } from '../../common/functions/MatchesUtils'
import { isClient } from '../../common/functions/getEnvironment'
import { Engine } from '../../ecs/classes/Engine'
import { EngineState } from '../../ecs/classes/EngineState'
import { Entity } from '../../ecs/classes/Entity'
import { SceneServices } from '../../ecs/classes/Scene'
import {
  defineComponent,
  getComponent,
  getOptionalComponent,
  hasComponent,
  removeComponent,
  setComponent,
  useComponent,
  useOptionalComponent
} from '../../ecs/functions/ComponentFunctions'
import { InputSystemGroup } from '../../ecs/functions/EngineFunctions'
import { useEntityContext } from '../../ecs/functions/EntityFunctions'
import { useExecute } from '../../ecs/functions/SystemFunctions'
import { InputComponent } from '../../input/components/InputComponent'
import { InputSourceComponent } from '../../input/components/InputSourceComponent'
import { XRStandardGamepadButton } from '../../input/state/ButtonState'
import { BoundingBoxComponent } from '../../interaction/components/BoundingBoxComponents'
import { createInteractUI } from '../../interaction/functions/interactUI'
import {
  InteractableTransitions,
  addInteractableUI,
  removeInteractiveUI
} from '../../interaction/systems/InteractiveSystem'
import { EngineRenderer } from '../../renderer/WebGLRendererSystem'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { XRState } from '../../xr/XRState'
import { addError, clearErrors } from '../functions/ErrorFunctions'
import { VisibleComponent } from './VisibleComponent'

const linkLogic = (linkComponent, xrState) => {
  if (!linkComponent.sceneNav) {
    xrState && xrState.session?.end()
    typeof window === 'object' && window && window.open(linkComponent.url, '_blank')
  } else {
    SceneServices.setCurrentScene(linkComponent.projectName, linkComponent.sceneName)
  }
}

const vec3 = new Vector3()
const onLinkInteractUpdate = (entity: Entity, xrui: ReturnType<typeof createInteractUI>) => {
  const transform = getComponent(xrui.entity, TransformComponent)
  if (!transform || !hasComponent(Engine.instance.localClientEntity, TransformComponent)) return
  const boundingBox = getComponent(entity, BoundingBoxComponent)
  const input = getComponent(entity, InputComponent)

  if (hasComponent(xrui.entity, VisibleComponent)) {
    transform.position.copy(getComponent(entity, TransformComponent).position)
    if (boundingBox) {
      transform.position.y += boundingBox.box.max.y + 0.5
    } else {
      transform.position.y += 0.5
    }
    const cameraTransform = getComponent(Engine.instance.cameraEntity, TransformComponent)
    transform.rotation.copy(cameraTransform.rotation)
    getAvatarBoneWorldPosition(Engine.instance.localClientEntity, 'Hips', vec3)
    const distance = vec3.distanceToSquared(transform.position)
    transform.scale.set(1, 1, 1)
    transform.scale.addScalar(clamp(distance * 0.01, 1, 5))
  }

  const transition = InteractableTransitions.get(entity)!

  if (transition.state === 'OUT' && input.inputSources.length > 0) {
    transition.setState('IN')
    setComponent(xrui.entity, VisibleComponent)
  }
  if (transition.state === 'IN' && input.inputSources.length == 0) {
    transition.setState('OUT')
  }

  const deltaSeconds = getState(EngineState).deltaSeconds
  transition.update(deltaSeconds, (opacity) => {
    if (opacity === 0) {
      removeComponent(xrui.entity, VisibleComponent)
    }
    xrui.container.rootLayer.traverseLayersPreOrder((layer) => {
      const mat = layer.contentMesh.material as MeshBasicMaterial
      mat.opacity = opacity
    })
  })
}

export const LinkComponent = defineComponent({
  name: 'LinkComponent',
  jsonID: 'link',

  onInit: (entity) => {
    return {
      url: 'https://www.etherealengine.org',
      sceneNav: false,
      projectName: '',
      sceneName: ''
    }
  },

  onSet: (entity, component, json) => {
    if (!json) return
    matches.string.test(json.url) && component.url.set(json.url as string)
    matches.boolean.test(json.sceneNav) && component.sceneNav.set(json.sceneNav as boolean)
    matches.string.test(json.projectName) && component.projectName.set(json.projectName as string)
    matches.string.test(json.sceneName) && component.sceneName.set(json.sceneName as string)
  },

  toJSON: (entity, component) => {
    return {
      url: component.url.value,
      sceneNav: component.sceneNav.value,
      projectName: component.projectName.value,
      sceneName: component.sceneName.value
    }
  },

  errors: ['INVALID_URL'],

  reactor: function () {
    if (!isClient) return null
    const entity = useEntityContext()
    const link = useComponent(entity, LinkComponent)
    const input = useOptionalComponent(entity, InputComponent)
    const { t } = useTranslation()

    useEffect(() => {
      if (getState(EngineState).isEditor || !input) return
      const canvas = EngineRenderer.instance.renderer.domElement
      if (input.inputSources.length > 0) {
        canvas.style.cursor = 'pointer'
      }
      return () => {
        canvas.style.cursor = 'auto'
      }
    }, [input?.inputSources])

    useEffect(() => {
      clearErrors(entity, LinkComponent)
      if (link.sceneNav.value) return
      try {
        new URL(link.url.value)
      } catch {
        return addError(entity, LinkComponent, 'INVALID_URL', 'Please enter a valid URL.')
      }
      return
    }, [link.url, link.sceneNav])

    useEffect(() => {
      setComponent(entity, BoundingBoxComponent)
      setComponent(entity, InputComponent, { highlight: true, grow: true })
      if (!getState(EngineState).isEditor) {
        addInteractableUI(entity, createInteractUI(entity, t('common:interactables.link')), onLinkInteractUpdate)
        return () => {
          removeInteractiveUI(entity)
        }
      }
    }, [])

    useExecute(
      () => {
        if (getState(EngineState).isEditor) return

        const linkComponent = getComponent(entity, LinkComponent)
        const inputComponent = getComponent(entity, InputComponent)
        const inputSourceEntity = inputComponent?.inputSources[0]

        if (inputSourceEntity) {
          const inputSource = getOptionalComponent(inputSourceEntity, InputSourceComponent)
          if (inputSource?.assignedButtonEntity != entity) return
          const buttons = inputSource?.buttons

          if (buttons)
            if (buttons.PrimaryClick?.touched) {
              if (buttons.PrimaryClick.up) {
                linkLogic(linkComponent, undefined)
              }
            } else if (buttons[XRStandardGamepadButton.Trigger]?.down) {
              const xrState = getState(XRState)
              linkLogic(linkComponent, xrState)
            }
        }
      },
      { with: InputSystemGroup }
    )

    return null
  }
})
