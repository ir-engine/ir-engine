import { createMuiTheme } from '@material-ui/core/styles';
import { yellow, red } from '@material-ui/core/colors';

// Create a theme instance.
const theme = createMuiTheme({
  palette: {
    primary: {
      main: '#0076ff'
    },
    secondary: {
      main: '#09fc3b'
    },
    error: {
      main: red.A400
    },
    background: {
      default: '#000000'
    }
  },
  typography: {
    fontFamily: '"Roboto", sans-serif',
      button: {
        color: '#FFF'        
      },
  },
  
  overrides: { 
    MuiFab: {
      root: {
        text:{
          color: '#FFF' 
        }           
      },
    },  
  },
});
export default theme;