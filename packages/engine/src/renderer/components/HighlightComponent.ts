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
import { Mesh, Vector3 } from 'three'

import { getMutableState, useHookstate } from '@etherealengine/hyperflux'

import { Tween } from '@tweenjs/tween.js'
import { Entity } from '../../ecs/classes/Entity'
import { defineComponent, removeComponent, setComponent, useComponent } from '../../ecs/functions/ComponentFunctions'
import { useEntityContext } from '../../ecs/functions/EntityFunctions'
import { GroupComponent } from '../../scene/components/GroupComponent'
import { TweenComponent } from '../../transform/components/TweenComponent'
import { RendererState } from '../RendererState'
import { EngineRenderer, PostProcessingSettingsState } from '../WebGLRendererSystem'

export const HighlightComponent = defineComponent({
  name: 'HighlightComponent',

  reactor: function () {
    const entity = useEntityContext()

    const postProcessingSettingsState = useHookstate(getMutableState(PostProcessingSettingsState))
    const usePostProcessing = useHookstate(getMutableState(RendererState).usePostProcessing)
    const group = useComponent(entity, GroupComponent)

    useEffect(() => {
      const objs = [...group.value]
      for (const object of objs) {
        object.traverse((obj) => {
          if (obj.type !== 'Mesh') return
          addToSelection(obj as Mesh)
          animateScale(entity, obj as Mesh, true)
        })
      }
      return () => {
        for (const object of objs) {
          object.traverse((obj) => {
            if (obj.type !== 'Mesh') return
            removeFromSelection(obj as Mesh)
            animateScale(entity, obj as Mesh, false)
          })
        }
      }
    }, [group, postProcessingSettingsState.effects, postProcessingSettingsState.enabled, usePostProcessing])

    return null
  }
})

const animateScale = (entity: Entity, obj: Mesh, grow: boolean) => {
  const highlight = { scaler: 0 }
  const objscale = obj.scale.clone().add(new Vector3(-0.05, -0.05, -0.05))
  const targetSacle = obj.scale.clone().add(new Vector3(0.05, 0.05, 0.05))
  setComponent(
    entity,
    TweenComponent,
    new Tween<any>(highlight)
      .to(
        {
          scaler: 1
        },
        300
      )
      .onUpdate(() => {
        const v = grow ? targetSacle : objscale
        obj.scale.lerp(v, highlight.scaler)
      })
      .start()
      .onComplete(() => {
        removeComponent(entity, TweenComponent)
      })
  )
}

const addToSelection = (obj: Mesh) => {
  if (!EngineRenderer.instance.effectComposer?.HighlightEffect) return
  EngineRenderer.instance.effectComposer.HighlightEffect.selection.add(obj)
}

const removeFromSelection = (obj: Mesh) => {
  if (!EngineRenderer.instance.effectComposer?.HighlightEffect) return
  EngineRenderer.instance.effectComposer.HighlightEffect.selection.delete(obj)
}
