import World from '../../components/World/index'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import MapMediaIconsBox from './MapMediaIconsBox'
import MapUserMenu from './MapUserMenu'
import { theme } from './theme'
import { AvatarInputSchema } from '@xrengine/engine/src/avatar/AvatarInputSchema'
import { TouchInputs } from '@xrengine/engine/src/input/enums/InputEnums'
import { BaseInput } from '@xrengine/engine/src/input/enums/BaseInput'
import UserProfile from './UserProfile'
import { EngineEvents } from '@xrengine/engine/src/ecs/classes/EngineEvents'

const LocationPage = (props) => {
  const { t } = useTranslation()
  const [isUserProfileOpen, setShowUserProfile] = useState(true)

  useEffect(() => {
    EngineEvents.instance.once(EngineEvents.EVENTS.INITIALIZED_ENGINE, () => {
      AvatarInputSchema.inputMap.set(TouchInputs.Touch, BaseInput.PRIMARY)
    })
  }, [])

  const customComponents = () => {
    return (
      <>
        <MapMediaIconsBox />
        <MapUserMenu showHideProfile={setShowUserProfile} />
      </>
    )
  }

  return (
    <>
      {/* todo: remove this in favour of reality packs */}
      <UserProfile isUserProfileShowing={isUserProfileOpen} showHideProfile={setShowUserProfile} />
      <World
        allowDebug={true}
        locationName={props.match.params.locationName}
        history={props.history}
        // todo: remove these props in favour of reality packs
        customComponents={customComponents}
        theme={theme}
        hideVideo={true}
        hideFullscreen={true}
      />
    </>
  )
}

export default LocationPage
