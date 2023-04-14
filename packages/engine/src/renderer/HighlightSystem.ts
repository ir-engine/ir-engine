import { useEffect } from 'react'
import { Object3D } from 'three'

import { defineQuery, getComponent, removeQuery } from '../ecs/functions/ComponentFunctions'
import { defineSystem, PresentationSystemGroup } from '../ecs/functions/SystemFunctions'
import { GroupComponent } from '../scene/components/GroupComponent'
import { HighlightComponent } from './components/HighlightComponent'
import { EngineRenderer } from './WebGLRendererSystem'

const highlightedObjectQuery = defineQuery([GroupComponent, HighlightComponent])

const addToSelection = (obj: Object3D) => {
  EngineRenderer.instance.effectComposer.OutlineEffect.selection.add(obj)
}

const execute = () => {
  if (!EngineRenderer.instance.effectComposer.OutlineEffect) return

  EngineRenderer.instance.effectComposer.OutlineEffect.selection.clear()

  for (const entity of highlightedObjectQuery()) {
    const group = getComponent(entity, GroupComponent)
    for (const object of group) object.traverse(addToSelection)
  }
}

const reactor = () => {
  useEffect(() => {
    return () => {
      removeQuery(highlightedObjectQuery)
    }
  }, [])
  return null
}

export const HighlightSystem = defineSystem({
  uuid: 'ee.engine.HighlightSystem',
  execute,
  reactor,
  before: PresentationSystemGroup
})
