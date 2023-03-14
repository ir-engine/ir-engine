import { useHookstate } from '@hookstate/core'

import { getMutableState } from '@etherealengine/hyperflux'

import { AppState } from '../../common/services/AppService'
import shelfStyles from './index.module.scss'

export const useShelfStyles = () => {
  const appState = useHookstate(getMutableState(AppState))
  return {
    topShelfStyle: appState.showTopShelf.value ? shelfStyles.animateTop : shelfStyles.fadeOutTop,
    bottomShelfStyle: appState.showBottomShelf.value ? shelfStyles.animateBottom : shelfStyles.fadeOutBottom
  }
}
