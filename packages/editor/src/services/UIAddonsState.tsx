import { defineState, syncStateWithLocalStorage } from '@ir-engine/hyperflux'
import { StudioUIAddons } from './EditorServices'

export const UIAddonsState = defineState({
  name: 'UIAddonsState',
  initial: () => ({
    projectName: null as string | null,
    editor: {
      container: {},
      newScene: {}
    } as StudioUIAddons,
    dashboard: {
      newScene: {}
    } as StudioUIAddons
  }),
  extension: syncStateWithLocalStorage(['projectName'])
})
