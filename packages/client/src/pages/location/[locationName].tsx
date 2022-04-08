import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useRouteMatch } from 'react-router-dom'
import { Quaternion, Vector3 } from 'three'

import Layout from '@xrengine/client-core/src/components/Layout/Layout'
import { LoadingCircle } from '@xrengine/client-core/src/components/LoadingCircle'
import { LoadEngineWithScene } from '@xrengine/client-core/src/components/World/LoadEngineWithScene'
import LoadLocationScene from '@xrengine/client-core/src/components/World/LoadLocationScene'
import NetworkInstanceProvisioning from '@xrengine/client-core/src/components/World/NetworkInstanceProvisioning'
import { client } from '@xrengine/client-core/src/feathers'
import { AuthService, useAuthState } from '@xrengine/client-core/src/user/services/AuthService'
import { useHookedEffect } from '@xrengine/common/src/utils/useHookedEffect'
import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import { useEngineState } from '@xrengine/engine/src/ecs/classes/EngineService'
import { receiveJoinWorld } from '@xrengine/engine/src/networking/functions/receiveJoinWorld'

const LocationPage = () => {
  const { t } = useTranslation()
  const match = useRouteMatch()
  const params = match.params as any
  const locationName = params.locationName ?? `${params.projectName}/${params.sceneName}`
  const engineState = useEngineState()
  const authState = useAuthState()

  const offline = params.locationName === 'offline'

  /** OFFLINE */
  useHookedEffect(() => {
    console.log('offline', offline, engineState.sceneLoaded.value)
    if (offline && engineState.sceneLoaded.value) {
      console.log(authState.value)
      client
        .service('user')
        .get(authState.authUser.identityProvider.userId.value)
        .then((...a) => console.log('=======USER', ...a))
      Engine.userId = authState.authUser.identityProvider.userId.value
      receiveJoinWorld({
        tick: 0,
        clients: [
          {
            userId: authState.authUser.identityProvider.userId.value,
            index: 1,
            name: authState.user.name.value
          }
        ],
        cachedActions: [],
        avatarDetail: {
          avatarURL: authState.user.avatarUrl.value!,
          thumbnailURL: null!
        },
        avatarSpawnPose: { position: new Vector3(), rotation: new Quaternion() }
      })
    }
  }, [engineState.connectedWorld, engineState.sceneLoaded])

  return (
    <Layout useLoadingScreenOpacity pageTitle={t('location.locationName.pageTitle')}>
      {engineState.isEngineInitialized.value ? <></> : <LoadingCircle />}
      <LoadEngineWithScene />
      {offline ? <></> : <NetworkInstanceProvisioning locationName={locationName} />}
      <LoadLocationScene locationName={locationName === 'offline' ? 'default' : locationName} />
    </Layout>
  )
}

export default LocationPage
