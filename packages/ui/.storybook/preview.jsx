// import { withThemes } from '@react-theming/storybook-addon'
import { ArgsTable, Description, Primary, PRIMARY_STORY, Stories, Subtitle, Title } from '@storybook/addon-docs'
import { withTests } from '@storybook/addon-jest'
import { withRouter } from 'storybook-addon-react-router-v6'

// import { theme as defaultTheme, useTheme } from '@etherealengine/client-core/src/theme'
// import GlobalStyle from '@etherealengine/client-core/src/util/GlobalStyle'

// import { StyledEngineProvider, ThemeProvider } from '@mui/material/styles'

import results from '../tests/jest-test-results.json'
import { withThemesProvider } from './decorators'

import 'tailwindcss/tailwind.css';
import '@etherealengine/client/src/index.css';

export const decorators = [withRouter, withTests({ results }), withThemesProvider]

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
