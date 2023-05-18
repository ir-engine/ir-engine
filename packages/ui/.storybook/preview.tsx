import { ArgsTable, Description, Primary, PRIMARY_STORY, Stories, Subtitle, Title } from '@storybook/addon-docs'
import React from 'react'
import { Suspense } from 'react'
import { withRouter } from 'storybook-addon-react-router-v6'

import Engine_tw from '@etherealengine/client/src/engine_tw'
// import { withTests } from '@storybook/addon-jest'
// import results from '../tests/jest-test-results.json'
import { ThemeContextProvider } from '@etherealengine/client/src/themes/themeContext'
import LoadingCircle from '@etherealengine/ui/src/primitives/tailwind/LoadingCircle'

// import { withThemes } from '@react-theming/storybook-addon'

// import sStyle from '@etherealengine/client-core/src/util/GlobalStyle'

// import { theme as defaultTheme, useTheme } from '@etherealengine/client-core/src/theme'

export const decorators = [
  withRouter,
  // withTests({ results }),
  (Story) => {
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

export const parameters = {
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/
    }
  },
  options: {
    storySort: {
      order: ['Expermiental']
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
