import { createMuiTheme } from '@material-ui/core/styles'
import red from '@material-ui/core/colors/red'

// Create a theme instance.
const theme = createMuiTheme({
  palette: {
    primary: {
      main: '#556cd6'
    },
    secondary: {
      main: '#19857b'
    },
    error: {
      main: red.A400
    },
    background: {
      default: '#fff'
    }
  },
  typography: {
    fontFamily: '"Noto Sans", sans-serif',
    h1: {
      fontFamily: 'Freude, "Comic Sans"'
    },
    h2: {
      fontFamily: 'Freude, "Comic Sans"'
    },
    h3: {
      fontFamily: 'Freude, "Comic Sans"'
    },
    h4: {
      fontFamily: 'Freude, "Comic Sans"'
    },
    h5: {
      fontFamily: 'Freude, "Comic Sans"'
    },
    h6: {
      fontFamily: 'Freude, "Comic Sans"'
    }
  }
})

export default theme
