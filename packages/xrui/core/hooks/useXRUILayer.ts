import { createEntity, setComponent, useComponent } from '@etherealengine/ecs'
import React from 'react'
import { XRUILayerComponent } from '../components/XRUILayerComponent'

export function useXRUILayer() {
  const entity = React.useMemo(() => {
    const entity = createEntity()
    setComponent(entity, XRUILayerComponent)
    return entity
  }, [])

  const state = useComponent(entity, XRUILayerComponent)

  return {
    ref: (v: HTMLElement | null) => {
      v?.setAttribute('xr-layer', 'true')
      state.element.set(v)
    },
    entity,
    state
  }
}
