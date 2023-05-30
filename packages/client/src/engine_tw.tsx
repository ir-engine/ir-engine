import React, { Suspense } from 'react'
import { useTranslation } from 'react-i18next'
import { v4 as uuidv4 } from 'uuid'

import { API } from '@etherealengine/client-core/src/API'
import { PeerID } from '@etherealengine/common/src/interfaces/PeerID'
import { Engine } from '@etherealengine/engine/src/ecs/classes/Engine'
import { EngineState } from '@etherealengine/engine/src/ecs/classes/EngineState'
import { initializeBrowser } from '@etherealengine/engine/src/initializeBrowser'
import { createEngine } from '@etherealengine/engine/src/initializeEngine'
import { getMutableState } from '@etherealengine/hyperflux'
import LoadingCircle from '@etherealengine/ui/src/primitives/tailwind/LoadingCircle'

import { initializei18n } from './util'

createEngine()
Engine.instance.peerID = uuidv4() as PeerID
getMutableState(EngineState).publicPath.set(
  // @ts-ignore
  import.meta.env.BASE_URL === '/client/' ? location.origin : import.meta.env.BASE_URL!.slice(0, -1) // remove trailing '/'
)
initializei18n()
initializeBrowser()
API.createAPI()

export default function ({ children }) {
  const { t } = useTranslation()
  return <Suspense fallback={<LoadingCircle message={t('common:loader.connecting')} />}>{children}</Suspense>
}
