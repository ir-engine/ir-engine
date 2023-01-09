import React from 'react'
import { useTranslation } from 'react-i18next'

import { XRState } from '@xrengine/engine/src/xr/XRState'
import { getMutableState, useHookstate } from '@xrengine/hyperflux'

import { LoadingCircle } from '../LoadingCircle'

export const XRLoading = () => {
  const { t } = useTranslation()
  const xrState = useHookstate(getMutableState(XRState))
  return xrState.requestingSession.value ? <LoadingCircle message={t('common:loader.loadingXRSystems')} /> : <></>
}
