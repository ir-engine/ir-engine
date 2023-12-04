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
import { Vector3 } from 'three'

import { Tween } from '@tweenjs/tween.js'
import { Entity } from '../../ecs/classes/Entity'
import {
  defineComponent,
  getComponent,
  removeComponent,
  setComponent,
  useComponent
} from '../../ecs/functions/ComponentFunctions'
import { entityExists, useEntityContext } from '../../ecs/functions/EntityFunctions'
import { LocalTransformComponent, TransformComponent } from '../../transform/components/TransformComponent'
import { TweenComponent } from '../../transform/components/TweenComponent'

export const AnimateScaleComponent = defineComponent({
  name: 'AnimateScaleComponent',

  onInit(entity) {
    return {
      multiplier: 1.05
    }
  },

  onSet(entity, component, json) {
    if (!json) return

    if (typeof json.multiplier === 'number') component.multiplier.set(json.multiplier)
  },

  reactor: function () {
    const entity = useEntityContext()

    const sizeMultiplier = useComponent(entity, AnimateScaleComponent).multiplier

    useEffect(() => {
      const transformComponent = getComponent(entity, TransformComponent)
      const originalScale = transformComponent.scale.clone()

      animateScale(entity, originalScale.clone().multiplyScalar(sizeMultiplier.value))

      return () => {
        if (!entityExists(entity)) return
        animateScale(entity, originalScale)
      }
    }, [])

    return null
  }
})

const animateScale = (entity: Entity, newScale: Vector3) => {
  const highlight = { scaler: 0 }
  const scale = getComponent(entity, LocalTransformComponent).scale
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
        scale.lerp(newScale, highlight.scaler)
      })
      .start()
      .onComplete(() => {
        if (!entityExists(entity)) return
        removeComponent(entity, TweenComponent)
      })
  )
}
