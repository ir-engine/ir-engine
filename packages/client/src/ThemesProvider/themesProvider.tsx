import React, { ReactNode } from 'react'
import { ThemeProvider as StyledThemeProvider } from 'styled-components'

import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles'

interface ThemesProviderProps {
  children: ReactNode
}

const muiTheme = {
  // Define your MUI theme here
}

const styledTheme = {
  // Define your styled-components theme here
}

const ThemesProvider: React.FC<ThemesProviderProps> = ({ children }) => {
  return (
    <MuiThemeProvider theme={muiTheme}>
      <StyledThemeProvider theme={styledTheme}>{children}</StyledThemeProvider>
    </MuiThemeProvider>
  )
}

export default ThemesProvider
