import React, { useEffect, useState } from 'react'

import Splash from '@xrengine/social/src/components/Splash'
import OnBoardingComponent from '@xrengine/social/src/components/OnBoarding'

interface Props {}

export const OnBoarding = (props: Props) => {
  const [isSplash, setIsSplash] = useState(true)

  useEffect(() => {
    const splashTimeout = setTimeout(() => {
      setIsSplash(false)
      clearTimeout(splashTimeout)
    }, 2000)
  }, [])

  const splashMedia = {
    screen: '/assets/splash_background.png',
    logo: '/assets/arcLogoVanishinglinesWhite.png'
  }

  const onBoardingMedia = [
    { screenBg: '/assets/onboarding_background_0.png', images: [] },
    { screenBg: null, images: ['/assets/onboarding_1_0.png'] },
    { screenBg: null, images: ['/assets/onboarding_2_0.png'] }
  ]

  return isSplash === true ? <Splash media={splashMedia} /> : <OnBoardingComponent media={onBoardingMedia} />
}

export default OnBoarding
