import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router-dom'

import { LocationIcons } from '@etherealengine/client-core/src/components/LocationIcons'
import NetworkInstanceProvisioning from '@etherealengine/client-core/src/components/World/NetworkInstanceProvisioning'
import { FriendService } from '@etherealengine/client-core/src/social/services/FriendService'
import { LocationAction } from '@etherealengine/client-core/src/social/services/LocationService'
import { AuthService } from '@etherealengine/client-core/src/user/services/AuthService'
import { SceneService } from '@etherealengine/client-core/src/world/services/SceneService'
import { dispatchAction } from '@etherealengine/hyperflux'
import Mediapipe from '@etherealengine/ui/src/Mediapipe'

export const Recorder = (): any => {
  const { t } = useTranslation()

  const params = useParams()
  AuthService.useAPIListeners()
  SceneService.useAPIListeners()
  FriendService.useAPIListeners()

  const locationName = params.locationName

  console.log('locationName', locationName)

  useEffect(() => {
    if (!locationName) {
      throw new Error('not implemented')
    }
    dispatchAction(LocationAction.setLocationName({ locationName }))
  }, [])

  return (
    <div>
      <div>{<Mediapipe />}</div>
      <NetworkInstanceProvisioning />
      <LocationIcons />
    </div>
  )
}

export default Recorder
