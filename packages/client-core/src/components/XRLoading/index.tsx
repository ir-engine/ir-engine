import React from 'react'
import { useTranslation } from 'react-i18next'

import { XRState } from '@etherealengine/engine/src/xr/XRState'
import { getState, useHookstate } from '@etherealengine/hyperflux'

import { LoadingCircle } from '../LoadingCircle'

export const XRLoading = () => {
  const { t } = useTranslation()
  const xrState = useHookstate(getState(XRState))
  return xrState.requestingSession.value ? <LoadingCircle message={t('common:loader.loadingXRSystems')} /> : <></>
}
