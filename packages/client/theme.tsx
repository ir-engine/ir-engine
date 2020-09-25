import { createMuiTheme } from '@material-ui/core/styles';
import red from '@material-ui/core/colors/red';

// // Create a theme instance.
// const theme = createMuiTheme({
//   palette: {
//     primary: {
//       main: '#556cd6'
//     },
//     secondary: {
//       main: '#19857b'
//     },
//     error: {
//       main: red.A400
//     },
//     background: {
//       default: '#fff'
//     }
//   },
//   typography: {
//     fontFamily: '"Roboto", sans-serif'
//   }
// });

const theme = createMuiTheme({
  palette: {
    primary: {
      main: '#66B933'
    },
    secondary: {
      main: '#633d6d'
    },
    error: {
      main: red.A400
    },
    background: {
      default: '#121212'
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
