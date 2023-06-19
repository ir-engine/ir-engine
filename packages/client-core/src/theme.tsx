/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/EtherealEngine/etherealengine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Ethereal Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Ethereal Engine team.

All portions of the code written by the Ethereal Engine team are Copyright © 2021-2023 
Ethereal Engine. All Rights Reserved.
*/

import { useTheme as styledUseTheme } from 'styled-components'

import { createTheme } from '@mui/material/styles'

const theme = createTheme({
  palette: {
    primary: {
      main: 'rgba(128, 128, 128, 50%)'
    },
    secondary: {
      main: 'rgba(128, 128, 128, 50%)'
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
    MuiMenuItem: {
      styleOverrides: {
        root: {
          '&:hover': {
            backgroundColor: 'var(--dropdownMenuHoverBackground)'
          },
          '&.Mui-selected': {
            backgroundColor: 'var(--dropdownMenuSelectedBackground)',
            '&:hover': {
              backgroundColor: 'var(--dropdownMenuSelectedBackground)'
            }
          }
        }
      }
    },
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
    MuiListItem: {
      styleOverrides: {
        root: {
          '&:hover': {
            backgroundColor: 'var(--dropdownMenuHoverBackground)'
          },
          '&.Mui-selected': {
            backgroundColor: 'var(--dropdownMenuSelectedBackground)',
            '&:hover': {
              backgroundColor: 'var(--dropdownMenuSelectedBackground)'
            }
          }
        }
      }
    },
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
          fontSize: 16,
          color: 'var(--textColor)'
        },
        //@ts-ignore
        label: {
          textTransform: 'capitalize'
        },
        outlined: {
          backgroundColor: 'transparent',
          borderColor: 'var(--buttonOutlined)',
          '&:hover': {
            backgroundColor: 'transparent',
            borderColor: 'var(--buttonOutlined)'
          }
        },
        contained: {
          backgroundColor: 'var(--buttonFilled)',

          '&:hover': {
            opacity: 0.8,
            backgroundColor: 'var(--buttonFilled)'
          }
        },
        outlinedPrimary: {
          '&:hover': {
            boxShadow: '0 0 10px var(--buttonOutlined)'
          }
        },
        outlinedSecondary: {
          '&:hover': {
            boxShadow: '0 0 10px var(--buttonOutlined)'
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
