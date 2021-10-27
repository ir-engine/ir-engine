import { createTheme } from '@mui/material/styles';
import { red } from '@mui/material/colors'

const lightTheme = createTheme({
  palette: {
    primary: {
      main: '#5151FF'
    },
    secondary: {
      main: '#FFFFFF'
    },
    error: {
      main: red.A400
    },
    background: {
      default: '#000000'
    },
    text: {
      primary: '#FFFFFF'
      // secondary: '#FFD600',
    }
  },
  typography: {
    fontFamily: ['SFProText-Regular', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'].join(','),
    fontSize: 14,
    button: {
      color: '#FFFFFF'
    }
  },
  components: {
    MuiTypography: {
      styleOverrides: {
        body1: {
          fontFamily: ['SFProText-Regular', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'].join(',')
        },
        h1: {
          fontSize: 28,
          fontWeight: 'bold',
          margin: '15px 0px',
          display: 'flex',
          alignItems: 'center',
          color: '#000000',
          '&.MuiTypography-colorSecondary': {
            color: '#FFFFFF'
          }
        },
        h2: {
          fontSize: 16,
          margin: '5px 0px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          color: '#000000',
          '&.MuiTypography-colorSecondary': {
            color: '#FFFFFF'
          }
        },
        h3: {
          fontSize: 14,
          margin: '5px 0px',
          fontWeight: 'bold',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          color: '#000000',
          '&.MuiTypography-colorSecondary': {
            color: '#FFFFFF'
          }
        },
        h4: {
          fontSize: 14,
          margin: '5px 0px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          '&.MuiTypography-colorSecondary': {
            color: '#8A8A8E'
          }
        },
        h5: {
          fontSize: 18,
          fontWeight: 'bold',
          margin: '5px 0px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          color: '#000000',
          '&.MuiTypography-colorSecondary': {
            color: '#FFFFFF'
          }
        },
        h6: {
          fontSize: 14,
          fontFamily: 'SFProText-Regular'
        },
        alignRight: {
          textAlign: 'right',
          justifyContent: 'flex-end',
          alignItems: 'right'
        },
        alignLeft: {
          textAlign: 'left',
          justifyContent: 'flex-start',
          alignItems: 'left'
        },
        alignCenter: {
          textAlign: 'center',
          justifyContent: 'center',
          alignItems: 'center'
        }
      }
    },
    MuiContainer: {
      styleOverrides: {
        root: {
          flex: 'none'
        }
      }
    },
    MuiDialog: {
      styleOverrides: {
        paperWidthSm: {
          maxWidth: '40%',
          width: '40%',
          margin: '0 auto',
          fontSize: 16,
          textAlign: 'center',
          backgroundColor: '#FFFFFF',
          '@media (max-width: 768px)': {
            maxWidth: '90%',
            width: '90%'
          }
        }
      }
    },
    MuiDialogTitle: {
      styleOverrides: {
        root: {
          display: 'flex',
          flexDirection: 'row-reverse',
          alignItems: 'center'
        }
      }
    },
    MuiDialogContent: {
      styleOverrides: {
        root: {
          textAlign: 'justify',
          padding: ' 0 24px 24px 24px'
        }
      }
    },
    MuiButtonBase: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(0, 0, 0,0.9)',
          color: '#000000',
          fontSize: 16,
          textAlign: 'center',
          margin: '0 10px'
        }
      }
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          color: '#000000',
          '&:hover': {
            backgroundColor: 'transparent'
          }
        },
        colorPrimary: {
          backgroundColor: '#5151FF',
          color: '#FFFFFF',
          '&:hover': {
            backgroundColor: '#5151FF'
          }
        },
        colorSecondary: {
          backgroundColor: 'transparent',
          color: '#8E8E93'
        }
      }
    },
    MuiSlider: {
      styleOverrides: {
        root: {
          color: '#484848'
        },
        thumb: {
          height: '24px',
          width: '24px',
          marginTop: '-10px',
          boxSizing: 'border-box'
        },
        thumbColorPrimary: {
          background: 'rgba(0, 0, 0, 0.8)',
          border: '2px solid #A8A8FF'
        }
      }
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          height: '34px',
          backgroundColor: '#FFFFFF',
          borderRadius: '8px',
          '@media (max-width: 768px)': {
            height: '16px',
            borderRadius: '10px'
          }
        },
        bar: {
          borderRadius: 'inherit'
        }
      }
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          padding: '5px',
          borderRadius: '8px'
        }
      }
    },
    MuiSnackbar: {
      styleOverrides: {
        root: {
          maxWidth: '80%',
          minWidth: '40%',
          width: 'auto',
          left: '30%',
          right: '30%',
          userSelect: 'none',
          borderRadius: '8px',
          fontSize: 16,
          backgroundColor: 'rgba(0,0,0,0.9)',
          boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.2)',
          padding: '20px',
          boxSizing: 'border-box',
          '@media (max-width: 768px)': {
            maxWidth: '90%',
            width: '90%',
            left: '5%',
            right: '5%'
          },
          MuiSvgIcon: {
            root: {
              height: '7em',
              width: 'auto',
              color: '#000000'
            }
          }
        },
        anchorOriginTopCenter: {
          top: '10%'
        },
        anchorOriginBottomCenter: {
          bottom: '60px',
          left: '50%',
          transform: 'translate(-50%, 20px)'
        },
        anchorOriginTopLeft: {
          left: '0px',
          top: '24px',
          width: '52%',
          maxWidth: '80%',
          '@media (max-width: 768px)': {
            width: '90%'
          },
          '@media (min-width: 600px)': {
            left: '0px'
          }
        }
      }
    },
    MuiSnackbarContent: {
      styleOverrides: {
        root: {
          color: '#FFFFFF',
          backgroundColor: 'rgba(0, 0, 0, 0.9)',
          minWidth: '0px',
          '@media (min-width: 600px)': {
            minWidth: '0px'
          }
        }
      }
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          padding: '20px',
          backgroundColor: 'rgba(0,0,0,0.85)'
        },

        paperAnchorRight: {
          width: '25%',
          '@media (max-width: 1280px)': {
            width: '33%'
          },
          '@media (max-width: 1024px)': {
            width: '40%'
          },
          '@media (orientation: portrait)': {
            width: '100vw'
          }
        }
      }
    },
    MuiCard: {
      styleOverrides: {
        root: {
          overflow: 'visible'
        }
      }
    },
    MuiCardMedia: {
      styleOverrides: {
        media: {
          '&:hover': {
            backgroundColor: '#A8A8FF'
          }
        }
      }
    },
    MuiList: {
      styleOverrides: {
        root: {
          background: 'rgba(206,206,206,0.1)',
          color: '#FFFFFF'
        }
      }
    },
    MuiListItem: {
      styleOverrides: {
        root: {
          padding: '0px',
          paddingTop: '0px',
          margin: '2px 0'
        }
      }
    },
    MuiListItemText: {
      styleOverrides: {
        root: {
          background: 'rgba(0, 0, 0, .5)',
          borderRadius: '5px',
          padding: '5px 10px',
          width: 'fit-content',
          flex: 'inherit',
          wordBreak: 'break-all'
        }
      }
    },
    MuiCardContent: {
      styleOverrides: {
        root: {
          margin: '5px 0',
          padding: '5px 20px',
          '&:last-child': {
            paddingBottom: '0px'
          }
        }
      }
    },
    MuiCardHeader: {
      styleOverrides: {
        root: {
          padding: '0 15px 5px 15px'
        },
        avatar: {
          borderRadius: '50%',
          overflow: 'hidden',
          height: '40px',
          width: '40px'
        }
      }
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: 'transparent',
          color: '#000000'
        }
      }
    },
    MuiInputBase: {
      styleOverrides: {
        input: {
          color: '#000000'
        }
      }
    },
    MuiFormLabel: {
      styleOverrides: {
        root: {
          color: '#000000'
        }
      }
    },
    MuiButton: {
      styleOverrides: {
        root: {
          width: '220px',
          margin: '10px auto',
          cursor: 'pointer',
          fontSize: 16,
          borderRadius: '10px',
          textTransform: 'none'
        },
        // label: {
        //   textTransform: 'capitalize',
        // },
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
        },
        containedSecondary: {
          backgroundColor: '#FFFFFF',
          '&:hover': {
            backgroundColor: '#FFFFFF'
          }
        },
        containedPrimary: {
          backgroundColor: '#000000'
        },
        text: {
          background: 'transparent',
          color: '#000000'
        }
      }
    },
    MuiSvgIcon: {
      styleOverrides: {
        colorPrimary: {
          color: '#A8A8FF'
        }
      }
    },
    MuiFab: {
      styleOverrides: {
        root: {
          height: '3em',
          width: 'fit-content',
          padding: '10px',
          margin: '0px 5px',
          display: 'flex',
          alignItems: 'center',
          textTransform: 'capitalize',
          backgroundColor: '#F4F4F5',
          color: '#8E8E93'
        },
        primary: {
          backgroundColor: 'rgba(0,0,0,0.8)',
          borderRadius: '8px'
        }
      }
    },
    MuiFormGroup: {
      styleOverrides: {
        root: {
          display: 'flex',
          flexWrap: 'wrap',
          flexDirection: 'row'
        }
      }
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          color: '#000000',
          margin: '10px 0'
        },
        adornedEnd: {
          paddingRight: '0px'
        }
      }
    },
    MuiBadge: {
      styleOverrides: {
        anchorOriginTopLeftRectangle: {
          left: '6px'
        },
        dot: {
          height: '12px',
          width: '12px',
          borderRadius: '50%'
        },
        colorPrimary: {
          backgroundColor: '#7AFF64'
        }
      }
    }
  }
})

// export default darkTheme;
export default lightTheme
