import { createMuiTheme } from '@material-ui/core/styles';
import { red } from '@material-ui/core/colors';

// Create a theme instance.
const darkTheme = createMuiTheme({
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
    fontFamily: ["Roboto", "Helvetica", "Arial", "sans-serif"].join(','),
    fontSize: 14,
      button: {
        color: '#FFFFFF'        
      },
  },
  
  overrides: { 
    MuiDialog:{
      paperWidthSm:{
        maxWidth: '40%',
        width: '40%',
        margin: '5% auto',   
        backgroundColor: 'rgba(0,0,0,0.8)',
        color: '#FFFFFF' ,
        fontSize: 16,   
        textAlign: 'center',
        '@media (max-width: 768px)': {
          maxWidth: '90%',
          width: '90%',
        }
      }
    },
    MuiIconButton:{
      root:{
        right: '-46%',
        top: '-10px',
        color: '#FFFFFF',
      }
    },
    MuiSnackbar:{
      root: {
        maxWidth: '40%',
        width: '40%',
        left: '30%',
        right: '30%',
        userSelect: 'none',
        borderRadius: '5px',
        fontSize: 16,  
        backgroundColor: 'rgba(0,0,0,0.8)',
        color: '#FFFFFF' ,
        padding: '20px',  
        '@media (max-width: 768px)': {
          maxWidth: '90%',
          width: '90%',
          left: '5%',
          right: '5%',
        },
        MuiSvgIcon:{
          root:{
            height:'7em',
            width:'auto',
            color:'#FFFFFF'
          }
        }
      }
    },
    MuiPaper:{
      root:{
        backgroundColor: 'rgba(0,0,0,0.8)',
        color: '#FFFFFF' ,
      }
    },
    MuiSnackbarContent:{
      root:{
        backgroundColor: 'rgba(0,0,0,0.8)',
        color: '#FFFFFF' ,
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

const lightTheme = createMuiTheme({
  palette: {
    primary: {
      main: '#0478ff'
    },
    secondary: {
      main: '#ff0100'
    },
    error: {
      main: red.A400
    },
    background: {
      default: '#000000'
    },
    text:{
      primary: '#FFFFFF',
    },
  },
  typography: {
    fontFamily: ["Roboto", "Helvetica", "Arial", "sans-serif"].join(','),
    
    fontSize: 14,
      button: {
        color: '#FFFFFF'        
      },
  },
  overrides: { 
    MuiDialog:{
      paperWidthSm:{
        maxWidth: '40%',
        width: '40%',
        margin: '0 auto',   
        backgroundColor: 'rgba(255,255,255,0.8)',
        color: '#000000' ,
        fontSize: 16,       
        textAlign: 'center',
        '@media (max-width: 768px)': {
          maxWidth: '90%',
          width: '90%',
        }
      }
    },
    MuiButtonBase:{
      root:  {
        backgroundColor: 'rgba(255,255,255,0.8)',
        color: '#000000' ,
        fontSize: 16,       
        textAlign: 'center',
      }
    },
    MuiIconButton:{
      root:{
        right: '-46%',
        top: '-10px',
        color: '#000000',
        '&:hover':{
          backgroundColor: 'transparent',
        }
      }
    },
    MuiMenuItem:{
      root:{
        padding: '5px',
      }
    },
    MuiSnackbar:{
      root: {
        maxWidth: '40%',
        width: '40%',
        left: '30%',
        right: '30%',        
        userSelect: 'none',
        borderRadius: '5px',
        fontSize: 16,    
        backgroundColor: 'rgba(255,255,255,0.8)',
        color: '#000000' ,
        padding: '20px',        
        '@media (max-width: 768px)': {
          maxWidth: '90%',
          width: '90%',
          left: '5%',
          right: '5%',
        } ,
        MuiSvgIcon:{
          root:{
            height:'7em',
            width:'auto',
            color:'#000000'
          }
        }      
      },
    },
    MuiPaper:{
      root:{
        backgroundColor: 'rgba(255,255,255,0.8)',
        color: '#000000' ,
      }
    },
    MuiSnackbarContent:{
      root:{
        backgroundColor: 'rgba(255,255,255,0.8)',
        color: '#000000' ,
      }
    },
    MuiInputBase:{
      input:{
        color: '#000000',
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
          boxShadow: '0 0 10px #0478ff'
        }        
      },
      outlinedSecondary:{
        '&:hover':{
          boxShadow: '0 0 10px #ff0100'
        }        
      },
      contained:{
        color: '#0076ff', 
        backgroundColor: 'rgba(255,255,255,0.8)',       
        width: 'auto',
        fontWeight: 'bold',
        padding: '15px 30x',
        borderRadius: '5px',
        fontSize: 18,
      }
    },    
    MuiFab: {
      root: {
        height: '3em',
        width: '3em',
        margin: '0px 5px',
        text:{
          color: '#FFFFFF' 
        }           
      },
    },  
  },
});

// export default darkTheme;
export default lightTheme;
