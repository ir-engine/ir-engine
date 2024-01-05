import { defineState, syncStateWithLocalStorage } from '@etherealengine/hyperflux'

export const FilesViewModeState = defineState({
  name: 'FilesViewModeState',
  initial: {
    viewMode: 'icons' as 'icons' | 'list'
  },
  onCreate: (store, state) => {
    syncStateWithLocalStorage(FilesViewModeState, ['viewMode'])
  }
})

export const FilesViewModeSettings = defineState({
  name: 'FilesViewModeSettings',
  initial: {
    icons: {
      iconSize: 90
    }
  },
  onCreate: (store, state) => {
    syncStateWithLocalStorage(FilesViewModeSettings, ['icons'])
  }
})
