import { defineState } from '@ir-engine/hyperflux'

export const EngineCanvasState = defineState({
  name: 'EngineCanvasState',
  initial: {
    previousEngineCanvasParent: null as HTMLElement | null
  }
})
