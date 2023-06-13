import React, { useEffect, useLayoutEffect } from 'react'

import { Entity } from '../../ecs/classes/Entity'
import { defineComponent, removeComponent, setComponent, useComponent } from '../../ecs/functions/ComponentFunctions'
import { useEntityContext } from '../../ecs/functions/EntityFunctions'
import { BoundingBoxComponent } from '../../interaction/components/BoundingBoxComponents'
import { HighlightComponent } from '../../renderer/components/HighlightComponent'

export const InputComponent = defineComponent({
  name: 'InputComponent',

  onInit: () => {
    return {
      /** populated automatically by ClientInputSystem */
      inputSources: [] as Entity[]
      // priority: 0
    }
  },

  onSet: (entity, component, json) => {
    setComponent(entity, BoundingBoxComponent)
  },

  reactor: () => {
    const entity = useEntityContext()
    const input = useComponent(entity, InputComponent)
    useLayoutEffect(() => {
      if (input.inputSources.length === 0) return
      setComponent(entity, HighlightComponent)
      return () => {
        removeComponent(entity, HighlightComponent)
      }
    }, [input.inputSources])
    return null
  }
})
