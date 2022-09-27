import { useHookstate } from '@hookstate/core'

import { getState } from '@xrengine/hyperflux'

import { AppState } from '../../common/services/AppService'
import shelfStyles from './shelf.style.scss'

export const useShelfStyles = () => {
  const appState = useHookstate(getState(AppState))
  const showTopShelf = appState.showTopShelf.value
  const showBottomShelf = appState.showBottomShelf.value
  return {
    topShelfStyle: showTopShelf ? shelfStyles.animateTop : shelfStyles.fadeOutTop,
    bottomShelfStyle: showBottomShelf ? shelfStyles.animateBottom : shelfStyles.fadeOutBottom
  }
}
