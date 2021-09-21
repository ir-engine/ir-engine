import { red } from '@material-ui/core/colors';
import { createTheme  } from '@material-ui/core/styles';

// A custom theme for this app
const theme = createTheme ({
  typography: {
    //fontFamily: "'Poppins', sans-serif",
  },
  palette: {
    primary: {
      main: '#00d092',
    },
    secondary: {
      main: '#00b894',
    },
    error: {
      main: red.A400,
    },
    background: {
      default: '#fafafa',
    },
  },
  overrides: {
    MuiIconButton: {
      label : {
        color : "#00b894"
      }
    },
    MuiAvatar: {
      colorDefault: {
        backgroundColor : '#00b894',
        color : 'white'
      },
    },
    MuiListItemIcon: {
      root: {
        color : '#00b894'
      },
    },
  },
});

export default theme;