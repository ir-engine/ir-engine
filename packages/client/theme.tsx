import { createMuiTheme } from '@material-ui/core/styles';
import { yellow, red } from '@material-ui/core/colors';
import { Palette } from '@styled-icons/fa-solid';

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
    fontSize: 14,
      button: {
        color: '#FFFFFF'        
      },
  },
  
  overrides: { 
    MuiDialog:{
      paperWidthSm:{
        maxWidth: '90%',
        width: '90%',
        margin: '5%',   
        backgroundColor: 'rgba(0,0,0,0.8)',
        color: '#FFFFFF' ,
        fontSize: 16,       
      }
    },
    MuiSnackbar:{
      root: {
        maxWidth: '90%',
        width: '90%',
        left: '5%',
        right: '5%',
        backgroundColor: 'rgba(0,0,0,0.8)',
        color: '#FFFFFF' ,
        userSelect: 'none',
        borderRadius: '5px',
        fontSize: 16,       
      }
    },
    MuiButton: {
      root:{
        width: '220px',    
        margin: '10px auto',
        cursor: 'pointer',    
        fontSize: 16,       
      },
      label: {
        textTransform: 'capitalize',
      },
      outlinedPrimary:{
        '&:hover':{
          boxShadow: '0 0 10px #0076ff'
        }        
      },
      outlinedSecondary:{
        '&:hover':{
          boxShadow: '0 0 10px #09fc3b'
        }        
      },
      contained:{
        color: '#0076ff', 
        backgroundColor: 'rgba(0,0,0,1)',       
        width: 'auto',
        fontWeight: 'bold',
        padding: '15px 30x',
        borderRadius: '5px',
        fontSize: 18,
      }
    },    
    MuiFab: {
      root: {
        text:{
          color: '#FFFFFF' 
        }           
      },
    },  
  },
});
export default theme;