/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/ir-engine/ir-engine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Infinite Reality Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Infinite Reality Engine team.

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2023 
Infinite Reality Engine. All Rights Reserved.
*/

import { Tween } from '@tweenjs/tween.js'
import { useEffect } from 'react'
import { Vector3 } from 'three'

import { defineComponent, getComponent, removeComponent, setComponent } from '@ir-engine/ecs/src/ComponentFunctions'
import { Entity } from '@ir-engine/ecs/src/Entity'
import { entityExists, useEntityContext } from '@ir-engine/ecs/src/EntityFunctions'

import { TransformComponent } from '../../transform/components/TransformComponent'
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

    useEffect(() => {
      const transformComponent = getComponent(entity, TransformComponent) ?? getComponent(entity, TransformComponent)
      const originalScale = transformComponent.scale.clone()

      const sizeMultiplier = getComponent(entity, AnimateScaleComponent).multiplier
      animateScale(entity, originalScale.clone().multiplyScalar(sizeMultiplier))

      return () => {
        if (!entityExists(entity)) return
        animateScale(entity, originalScale)
      }
    }, [])

    return null
  }
})

/** @todo Export this function so that it is accessible by this file's UnitTests */
const animateScale = (entity: Entity, newScale: Vector3) => {
  const highlight = { scaler: 0 }
  const { scale } = getComponent(entity, TransformComponent) ?? getComponent(entity, TransformComponent)
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
