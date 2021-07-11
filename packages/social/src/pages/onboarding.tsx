import React, { useEffect, useState } from 'react'

import Splash from '@xrengine/client-core/src/socialmedia/components/Splash'
import OnBoardingComponent from '@xrengine/client-core/src/socialmedia/components/OnBoarding'
import { selectAppOnBoardingStep } from '@xrengine/client-core/src/common/reducers/app/selector'
import { connect } from 'react-redux'

const mapStateToProps = (state: any): any => {
  return {
    onBoardingStep: selectAppOnBoardingStep(state)
  }
}

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

export default connect(mapStateToProps)(OnBoarding)
