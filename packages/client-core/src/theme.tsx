import { createTheme } from '@mui/material/styles'
import { red } from '@mui/material/colors'
import { useTheme as styledUseTheme } from 'styled-components'

const theme = createTheme({
  lato: "'Lato', sans-serif",
  zilla: "'Zilla Slab', sans-serif",
  background: 'rgba(0,0,0,0)',
  inputBackground: '#070809',
  border: '#5D646C',
  panel: '#282C31',
  panel2: '#3A4048',
  selected: '#006EFF',
  selectedText: '#fff',
  hover: '#4B5562',
  hover2: '#636F80',
  text: '#FFFFFF',
  text2: '#9FA4B5',
  dropdown: '#000000',
  red: '#F44336',
  pink: '#E91E63',
  purple: '#9C27B0',
  deepPurple: '#673AB7',
  indigo: '#3F51B5',
  blue: '#006EFF',
  lightBlue: '#03A9F4',
  cyan: '#00BCD4',
  teal: '#009688',
  green: '#4CAF50',
  lightGreen: '#8BC34A',
  lime: '#CDDC39',
  yellow: '#FFEB3B',
  amber: '#FFC107',
  orange: '#FF9800',
  deepOrange: '#FF5722',
  brown: '#795548',
  blueHover: '#4D93F1',
  bluePressed: '#0554BC',
  disabled: '#222222',
  disabledText: 'grey',
  deemphasized: 'grey',
  toolbar: 'rgba(0, 0, 0, 0.0)',
  toolbar2: 'rgba(0, 0, 0, 0.0)',
  header: '#1b1b1b',
  white: '#fff',
  shadow15: '0px 4px 4px  rgba(0, 0, 0, 0.15)',
  shadow30: '0px 4px 4px  rgba(0, 0, 0, 0.3)',
  borderStyle: '1px solid #5D646C',
  palette: {
    primary: {
      main: 'rgb(81, 81, 255)'
    },
    secondary: {
      main: 'rgb(255, 214, 0)'
    }
  },
  components: {
    MuiListSubheader: {
      styleOverrides: {
        root: {
          'background-color': 'rgba(0,0,0,0)'
        }
      }
    },
    MuiTab: {
      styleOverrides: {
        root: {
          color: 'inherit',
          opacity: 0.7
        }
      }
    },
    // MuiTypography: {
    //   styleOverrides: {
    //     h1: {
    //       fontSize: 24,
    //       margin: '15px 0px',
    //       display: 'flex',
    //       alignItems: 'center'
    //     },
    //     h2: {
    //       fontSize: 16,
    //       fontWeight: 'bold',
    //       margin: '5px 0px',
    //       cursor: 'pointer',
    //       display: 'flex',
    //       alignItems: 'center',
    //       '&.MuiTypography-colorSecondary': {
    //         color: '#FFD600'
    //       }
    //     },
    //     h3: {
    //       fontSize: 14,
    //       margin: '5px 0px',
    //       fontWeight: 'bold',
    //       cursor: 'pointer',
    //       display: 'flex',
    //       alignItems: 'center',
    //       '&.MuiTypography-colorSecondary': {
    //         color: '#FFD600'
    //       }
    //     },
    //     h4: {
    //       fontSize: 14,
    //       margin: '5px 0px',
    //       cursor: 'pointer',
    //       display: 'flex',
    //       alignItems: 'center',
    //       '&.MuiTypography-colorSecondary': {
    //         color: '#FFD600'
    //       }
    //     },
    //     alignRight: {
    //       textAlign: 'right',
    //       justifyContent: 'flex-end',
    //       alignItems: 'right'
    //     },
    //     alignLeft: {
    //       textAlign: 'left',
    //       justifyContent: 'flex-start',
    //       alignItems: 'left'
    //     },
    //     alignCenter: {
    //       textAlign: 'center',
    //       justifyContent: 'center',
    //       alignItems: 'center'
    //     }
    //   }
    // },
    // MuiDialog: {
    //   styleOverrides: {
    //     paperWidthSm: {
    //       maxWidth: '40%',
    //       width: '40%',
    //       margin: '0 auto',
    //       fontSize: 16,
    //       textAlign: 'center',
    //       '@media (max-width: 768px)': {
    //         maxWidth: '90%',
    //         width: '90%'
    //       }
    //     }
    //   }
    // },
    // MuiDialogTitle: {
    //   styleOverrides: {
    //     root: {
    //       backgroundColor: 'rgba(0, 0, 0, 0.9)',
    //       display: 'flex',
    //       flexDirection: 'row-reverse',
    //       alignItems: 'center'
    //     }
    //   }
    // },
    // MuiDialogContent: {
    //   styleOverrides: {
    //     root: {
    //       backgroundColor: 'rgba(0, 0, 0, 0.9)',
    //       textAlign: 'justify',
    //       padding: ' 0 24px 24px 24px'
    //     }
    //   }
    // },
    // MuiButtonBase: {
    //   styleOverrides: {
    //     root: {
    //       backgroundColor: 'rgba(0, 0, 0, 0.9)',
    //       color: '#000000',
    //       fontSize: 16,
    //       textAlign: 'center'
    //     }
    //     // colorPrimary:{
    //     //   backgroundColor: 'transparent',
    //     //   color: '#FFFFFF',
    //     //   '&:hover':{
    //     //     backgroundColor: '#5151FF',
    //     //   },
    //     // },
    //   }
    // },
    // MuiIconButton: {
    //   styleOverrides: {
    //     root: {
    //       color: '#000000',
    //       '&:hover': {
    //         backgroundColor: 'transparent'
    //       }
    //     },
    //     colorPrimary: {
    //       backgroundColor: '#5151FF',
    //       color: '#FFFFFF',
    //       '&:hover': {
    //         backgroundColor: '#5151FF'
    //       }
    //     },
    //     colorSecondary: {
    //       backgroundColor: 'transparent',
    //       color: '#FFFFFF',
    //       '&:hover': {
    //         backgroundColor: '#5151FF'
    //       }
    //     }
    //   }
    // },
    // MuiSlider: {
    //   styleOverrides: {
    //     root: {
    //       color: '#484848'
    //     },
    //     thumb: {
    //       height: '24px',
    //       width: '24px',
    //       marginTop: '-10px',
    //       boxSizing: 'border-box'
    //     },
    //     thumbColorPrimary: {
    //       background: 'rgba(0, 0, 0, 0.8)',
    //       border: '2px solid #A8A8FF'
    //     }
    //   }
    // },
    // MuiMenuItem: {
    //   styleOverrides: {
    //     root: {
    //       padding: '5px',
    //       borderRadius: '8px'
    //     }
    //   }
    // },
    // MuiSnackbar: {
    //   styleOverrides: {
    //     root: {
    //       maxWidth: '80%',
    //       minWidth: '40%',
    //       width: 'auto',
    //       left: '30%',
    //       right: '30%',
    //       userSelect: 'none',
    //       borderRadius: '8px',
    //       fontSize: 16,
    //       backgroundColor: 'rgba(0,0,0,0.9)',
    //       boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.2)',
    //       padding: '20px',
    //       boxSizing: 'border-box',
    //       '@media (max-width: 768px)': {
    //         maxWidth: '90%',
    //         width: '90%',
    //         left: '5%',
    //         right: '5%'
    //       },
    //       MuiSvgIcon: {
    //         root: {
    //           height: '7em',
    //           width: 'auto',
    //           color: '#000000'
    //         }
    //       }
    //     },
    //     anchorOriginTopCenter: {
    //       top: '10%'
    //       // '@media (max-width: 768px)': {
    //       //   top: '10%',
    //       // },
    //     },
    //     anchorOriginBottomCenter: {
    //       bottom: '60px',
    //       left: '50%',
    //       transform: 'translate(-50%, 20px)'
    //     },
    //     anchorOriginTopLeft: {
    //       left: '0px',
    //       top: '24px',
    //       width: '52%',
    //       maxWidth: '80%',
    //       '@media (max-width: 768px)': {
    //         width: '90%'
    //       },
    //       '@media (min-width: 600px)': {
    //         left: '0px'
    //       }
    //     }
    //   }
    // },
    // MuiSnackbarContent: {
    //   styleOverrides: {
    //     root: {
    //       color: '#FFFFFF',
    //       backgroundColor: 'rgba(0, 0, 0, 0.9)',
    //       minWidth: '0px',
    //       '@media (min-width: 600px)': {
    //         minWidth: '0px'
    //       }
    //     }
    //   }
    // },
    // MuiDrawer: {
    //   styleOverrides: {
    //     paper: {
    //       padding: '20px',
    //       backgroundColor: 'rgba(0,0,0,0.85)'
    //     },
    //
    //     paperAnchorRight: {
    //       width: '25%',
    //       '@media (max-width: 1280px)': {
    //         width: '33%'
    //       },
    //       '@media (max-width: 1024px)': {
    //         width: '40%'
    //       },
    //       '@media (orientation: portrait)': {
    //         width: '100vw'
    //       }
    //     }
    //   }
    // },
    // MuiCardMedia: {
    //   styleOverrides: {
    //     media: {
    //       '&:hover': {
    //         backgroundColor: '#A8A8FF'
    //       }
    //     }
    //   }
    // },
    // MuiList: {
    //   styleOverrides: {
    //     root: {
    //       background: 'rgba(206,206,206,0.1)',
    //       color: '#FFFFFF'
    //     }
    //   }
    // },
    // MuiListItem: {
    //   styleOverrides: {
    //     root: {
    //       padding: '0px',
    //       paddingTop: '0px',
    //       margin: '2px 0'
    //     }
    //   }
    // },
    // MuiListItemText: {
    //   styleOverrides: {
    //     root: {
    //       background: 'rgba(0, 0, 0, .5)',
    //       borderRadius: '5px',
    //       padding: '5px 10px',
    //       width: 'fit-content',
    //       flex: 'inherit',
    //       wordBreak: 'break-all'
    //     }
    //   }
    // },
    // MuiCardContent: {
    //   styleOverrides: {
    //     root: {
    //       '&:last-child': {
    //         paddingBottom: '0px',
    //         paddingLeft: '0px',
    //         paddingRight: '0px',
    //         paddingTop: '0px'
    //       }
    //     }
    //   }
    // },
    // MuiPaper: {
    //   styleOverrides: {
    //     root: {
    //       backgroundColor: 'rgba(0,0,0,0.8)'
    //     }
    //   }
    // },
    // MuiInputBase: {
    //   styleOverrides: {
    //     input: {
    //       color: '#FFFFFF'
    //     }
    //   }
    // },
    // MuiFormLabel: {
    //   styleOverrides: {
    //     root: {
    //       color: '#FFFFFF'
    //     }
    //   }
    // },
    MuiButton: {
      styleOverrides: {
        root: {
          width: '220px',
          margin: '10px auto',
          cursor: 'pointer',
          fontSize: 16
        },
        label: {
          textTransform: 'capitalize'
        },
        outlined: {
          background: 'transparent'
        },
        outlinedPrimary: {
          '&:hover': {
            boxShadow: '0 0 10px #5151FF'
          }
        },
        outlinedSecondary: {
          '&:hover': {
            boxShadow: '0 0 10px #FFFFFF'
          }
        }
      }
    }
    // MuiSvgIcon: {
    //   styleOverrides: {
    //     colorPrimary: {
    //       color: '#A8A8FF'
    //     }
    //   }
    // },
    // MuiFab: {
    //   styleOverrides: {
    //     root: {
    //       height: '3em',
    //       width: 'fit-content',
    //       padding: '10px',
    //       margin: '0px 5px',
    //       display: 'flex',
    //       alignItems: 'center',
    //       textTransform: 'capitalize',
    //       text: {
    //         color: '#FFFFFF'
    //       }
    //     },
    //     primary: {
    //       backgroundColor: 'rgba(0,0,0,0.8)',
    //       borderRadius: '8px'
    //     }
    //   }
    // },
    // MuiFormGroup: {
    //   styleOverrides: {
    //     root: {
    //       display: 'flex',
    //       flexWrap: 'wrap',
    //       flexDirection: 'row'
    //     }
    //   }
    // },
    // MuiBadge: {
    //   styleOverrides: {
    //     // anchorOriginTopLeftRectangle: {
    //     //   left: '6px'
    //     // },
    //     dot: {
    //       height: '12px',
    //       width: '12px',
    //       borderRadius: '50%'
    //     },
    //     colorPrimary: {
    //       backgroundColor: '#7AFF64'
    //     }
    //   }
    // }
  }
})

export { theme }
export type Theme = typeof theme

export function useTheme() {
  return styledUseTheme() as Theme
}
