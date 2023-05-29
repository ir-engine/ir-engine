import { ArgsTable, Description, Primary, PRIMARY_STORY, Stories, Subtitle, Title } from '@storybook/addon-docs'
import { Preview } from '@storybook/react'
import React from 'react'
import { withRouter } from 'storybook-addon-react-router-v6'

import Engine_tw from '@etherealengine/client/src/engine_tw'
import { ThemeContextProvider } from '@etherealengine/client/src/themes/themeContext'

export const decorators = [
  withRouter,
  (Story) => {
    return (
      <ThemeContextProvider>
        <Engine_tw>
          <Story />
        </Engine_tw>
      </ThemeContextProvider>
    )
  }
]

const preview: Preview = {
  globalTypes: {
    eeEnabled: {
      description: 'Ethreal Engine',
      defaultValue: false
    }
  }
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
