import { ArgsTable, Description, Primary, PRIMARY_STORY, Stories, Subtitle, Title } from '@storybook/addon-docs'
import { withThemeByClassName } from '@storybook/addon-styling'
import { FORCE_RE_RENDER } from '@storybook/core-events'
import { useGlobals } from '@storybook/manager-api'
import { addons } from '@storybook/preview-api'
// .storybook/preview.ts

// Replace your-framework with the framework you are using (e.g., react, vue3)
import { Preview } from '@storybook/react'
import React, { useCallback, useEffect } from 'react'
import { Suspense } from 'react'
import { withRouter } from 'storybook-addon-react-router-v6'

import Engine_tw from '@etherealengine/client/src/engine_tw'
// import { withTests } from '@storybook/addon-jest'
// import results from '../tests/jest-test-results.json'
import { ThemeContextProvider } from '@etherealengine/client/src/themes/themeContext'

// import LoadingCircle from '@etherealengine/ui/src/primitives/tailwind/LoadingCircle'

// // import { withThemes } from '@react-theming/storybook-addon'

// // import sStyle from '@etherealengine/client-core/src/util/GlobalStyle'

// // import { theme as defaultTheme, useTheme } from '@etherealengine/client-core/src/theme'

// import { MediaStreamService, MediaStreamState } from '@etherealengine/client-core/src/transports/MediaStreams'
// import { useHookstate } from '@hookstate/core'
// import { useMediaInstance } from '@etherealengine/client-core/src/common/services/MediaInstanceConnectionService'
// import { RecordingState } from '@etherealengine/client-core/src/recording/RecordingService'

// import { getMutableState, getState } from '@etherealengine/hyperflux'
// // let videoStream

//   let mediaConnection
//   let mediaStreamState
//   let recordingState

//   let videoActive
//   let isDetecting

// let isCamVideoEnabled
//   let videoStatus

export const decorators = [
  withRouter,
  // withTests({ results }),
  // withThemeByClassName({
  //   themes: {
  //     light: "light",
  //     dark: "dark",
  //   },
  //   defaultTheme: "light",
  // }),
  (Story) => {
    //   const [globals, updateGlobals] = useGlobals()

    // //   const [globals, useGlobals] = useGlobals();
    // //   // videoStream = useHookstate(getMutableState(MediaStreamState).videoStream)

    // //   // Function that will update the global value and trigger a UI refresh.
    // const refreshAndUpdateGlobal = useCallback((key: string, val: any) => {
    //   // Updates Storybook global value
    //   updateGlobals({
    //     [key]: val,
    //   }),
    //     // Invokes Storybook's addon API method (with the FORCE_RE_RENDER) event to trigger a UI refresh
    //     addons.getChannel().emit(FORCE_RE_RENDER);
    // }, [])

    //   const mediaInstance = useMediaInstance()
    //   useEffect(() => {
    //     if (context?.globals?.eeStatus?.mediaInstance === 'init') {
    //       refreshAndUpdateGlobal('eeStatus', {
    //         ...context.globals,
    //         mediaInstance: mediaInstance?.connected?.value
    //       })
    //     }
    //   }, [mediaInstance?.connected])
    // mediaStreamState = useHookstate(getMutableState(MediaStreamState))
    // recordingState = useHookstate(getMutableState(RecordingState))

    // videoActive = useHookstate(false)
    // isDetecting = useHookstate(false)

    // isCamVideoEnabled =
    //     mediaStreamState?.camVideoProducer?.value !== null && mediaStreamState.videoPaused.value !== null
    //   videoStatus =
    //     mediaConnection?.connected?.value === false && videoActive?.value === false
    //       ? 'loading'
    //       : isCamVideoEnabled !== true
    //       ? 'ready'
    //       : 'active'
    return (
      <ThemeContextProvider>
        <Engine_tw>
          <Story />
        </Engine_tw>
      </ThemeContextProvider>
    )
  }
  // withThemes(null, [defaultTheme], { providerFn })
]

const preview: Preview = {
  // globalTypes: {
  //   eeStatus: {
  //     description: 'Ethreal Engine Status',
  //     defaultValue: null,
  //     toolbar: {
  //       title: 'EE Status',
  //       icon: 'info',
  //       items: [
  //         { value: 'active', title: `MediaInstance: ${'active'}` },
  //       ],
  //       dynamicTitle: true,
  //     },
  //   },
  // },
}

export default preview

export const parameters = {
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/
    }
  },
  options: {
    storySort: {
      order: ['Pages', 'Admin', 'Components', 'Primitives', 'Addons', 'Expermiental']
    }
  },
  docs: {
    source: {
      type: 'code'
    },
    page: () => (
      <>
        <Title />
        <Subtitle />
        <Description />
        <Primary />
        <ArgsTable story={PRIMARY_STORY} />
        <Stories />
      </>
    )
  },
  actions: { argTypesRegex: '^on[A-Z].*' }
}
