import React, { useEffect, useState } from 'react';

import Splash from '@xr3ngine/client-core/components/social/Splash';
import OnBoardingComponent from '@xr3ngine/client-core/components/social/OnBoarding';
import { selectAppOnBoardingStep } from '@xr3ngine/client-core/redux/app/selector';
import { connect } from 'react-redux';

const mapStateToProps = (state: any): any => {
    return {
        onBoardingStep: selectAppOnBoardingStep(state),
    };
};

interface Props {}

export const OnBoarding = (props: Props) => {
    const [isSplash, setIsSplash] = useState(true);
    
    useEffect(()=>{
        const splashTimeout = setTimeout(()=>{
            setIsSplash(false);
            clearTimeout(splashTimeout);
        }, 2000);
    }, []);    

    const splashMedia = {
        screen: '/assets/splash_background.png',
        logo: '/assets/arcLogoVanishinglinesWhite.png'
    }

    const onBoardingMedia = [
        {screenBg: '/assets/onboarding_background_0.png',
            images: []},
        {screenBg: null,
            images: ['/assets/onboarding_1_0.png']},
        {screenBg: null,
            images: ['/assets/onboarding_2_0.png']}
    ]

    return isSplash === true ? <Splash media={splashMedia} /> : 
            <OnBoardingComponent media={onBoardingMedia} />;
};

export default connect(mapStateToProps)(OnBoarding);
