import { makeStyles, Theme, createStyles } from '@material-ui/core/styles'

export const useHarmonyStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      width: '100%',
      overflow: 'hidden',
      height: '100vh',
      backgroundColor: '#2E2B45'
    },
    darkBg: {
      backgroundColor: '#261F34'
    },
    bgPrimary: {
      backgroundColor: '#935CFF',
      padding: '7px 18px'
    },
    GridDark: {
      backgroundColor: '#181A1C',
      paddingTop: '50px'
    },
    bgLight: {
      backgroundColor: '#EBEDEF'
    },
    GridLight: {
      backgroundColor: '#E3E5E8',
      padding: '50px 0px'
    },
    dFlex: {
      display: 'flex'
    },
    justifyContentBetween: {
      justifyContent: 'space-between'
    },
    justifyCenter: {
      justifyContent: 'center'
    },
    alignCenter: {
      alignItems: 'center'
    },
    primaryText: {
      color: '#352D45'
    },
    secondaryText: {
      color: '#7A4BD8'
    },
    flexWrap: {
      flexWrap: 'wrap'
    },
    cpointer: {
      cursor: 'pointer'
    },
    mx2: {
      margin: '7px 10px'
    },
    mx0: {
      margin: '0px 10px'
    },
    p5: {
      padding: '20px'
    },
    my2: {
      margin: '15px 0px'
    },
    my1: {
      margin: '0 !important'
    },
    roundedCircle: {
      borderRadius: 80,
      textDecoration: 'none'
    },
    textBlack: {
      color: '#000'
    },
    border: {
      border: '1px dashed #FFF',
      padding: '7px 18px'
    },
    borderLight: {
      border: '1px dashed #787589',
      padding: '7px 18px',
      color: '#787589'
    },
    fontBig: {
      fontSize: '15px',
      marginBottom: '5px',
      color: '#000'
    },
    textMuted: {
      fontSize: 12,
      paddingTop: '10px',
      color: '#83769C'
    },
    flexColumn: {
      flexDirection: 'column'
    },
    formControls: {
      width: '100%',
      backgroundColor: 'transparent',
      border: '1px solid #FFF',
      padding: '12px',
      marginTop: 15,
      borderRadius: '5px',
      color: '#ccc'
    },
    formControlsLight: {
      width: '100%',
      backgroundColor: 'transparent',
      border: '1px solid #787589',
      padding: '12px',
      marginTop: 15,
      borderRadius: '5px',
      color: '#ccc'
    },
    formControls: {
      width: '100%',
      backgroundColor: 'transparent',
      border: '1px solid #FFF',
      padding: '12px',
      marginTop: 15,
      borderRadius: '2px',
      color: '#ccc'
    },
    box: {
      padding: '13px 16px',
      borderRadius: '5px'
    },
    center: {
      display: 'flex',
      justifyContent: 'center'
    },
    btnDark: {
      backgroundColor: '#232424'
    },
    textBlack: {
      color: '#3F3960'
    },
    btn: {
      textDecoration: 'none',
      color: '#935CFF',
      borderRadius: '30px',
      border: 0,
      padding: '12px 24px',
      fontSize: 14,
      fontWeight: 'bold'
    },
    border0: {
      backgroundColor: 'transparent',
      color: '#FFF',
      textDecoration: 'none'
    },
    borderNone: {
      border: 0
    },
    bgDark: {
      backgroundColor: '#3A3D40',
      color: '#FFF',
      padding: '15px 0px'
    },
    bgWhite: {
      backgroundColor: '#FFF',
      color: '#3A3D40',
      padding: '15px 0px'
    },
    bgDarkLight: {
      backgroundColor: '#3A3D40;',
      color: '#FFF',
      width: '8rem'
    },
    white: {
      color: '#FFF'
    },
    info: {
      color: '#935CFF'
    },
    success: {
      color: '#57C290'
    },
    danger: {
      color: '#DD3333'
    },
    muted: {
      color: '#A8A9AB'
    },
    h100: {
      height: '89vh'
    },
    h1002: {
      height: '98%'
    },
    flexGrow2: {
      flexGrow: 1
    },
    hAuto: {
      height: '94vh'
    },
    borderRadius: {
      borderRadius: '30px'
    },
    flexGrow: {
      flexGrow: 1,
      margin: '0px 8px',
      padding: '8px 10px'
    },
    formControl: {
      width: '100%',
      backgroundColor: 'transparent',
      border: 'none',
      marginLeft: '15px'
    },
    selfStart: {
      alignSelf: 'flex-start',
      margin: '10px'
    },
    selfEnd: {
      alignSelf: 'flex-end',
      margin: '10px'
    },
    bgBlack: {
      backgroundColor: '#232424',
      padding: '5px 10px',
      borderRadius: '30px'
    },
    bgInfo: {
      backgroundColor: '#935CFF',
      padding: '5px 10px',
      borderRadius: '30px'
    },
    bgDarkLight1: {
      backgroundColor: '#1B1C1D'
    },
    bgDarkLight: {
      backgroundColor: '#27243A'
    },
    p2: {
      padding: '28px 17px'
    },
    p4: {
      backgroundColor: '#1B1C1D',
      padding: '28px 24px'
    },
    bgModal: {
      backgroundColor: '#15171B',
      color: '#fff'
    },
    bgModalLight: {
      backgroundColor: '#FFF',
      color: '#15171B'
    },
    bigBox: {
      backgroundColor: '#5B598B',
      width: '100%',
      height: '100%',
      borderRadius: '5px'
    },
    bigFont: {
      fontSize: '28px'
    },
    btns: {
      backgroundColor: 'transparent',
      border: 'none',
      flexGrow: 0.5,
      padding: '28px 17px'
    },
    borderBottom: {
      borderBottomColor: 'rgba(55, 55, 55, 0.8)',
      borderBottomWidth: 1,
      borderBottomStyle: 'solid'
    },
    smallBtn: {
      backgroundColor: '#transparent',
      margin: '0px 10px',
      border: 0,
      cursor: 'pointer'
    },
    lightDanger: {
      backgroundColor: '#3C3230',
      width: '30px',
      height: '30px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: '50%'
    },
    lightSuccess: {
      backgroundColor: '#303C31',
      width: '30px',
      height: '30px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: '50%'
    },
    btnCursor: {
      cursor: 'pointer'
    },
    inPad: {
      padding: '10px 0 0 5px'
    },
    px2: {
      padding: '0px 14px',
      borderRadius: '6px'
    },
    scroll: {
      height: '90%',
      overflowY: 'scroll',
      '&::-webkit-scrollbar': {
        width: '5px'
      },
      '&::-webkit-scrollbar-thumb': {
        background: '#555 !important',
        borderRadius: '10px'
      },
      '&::-webkit-scrollbar-thumb:hover': {
        background: '#f1f1f1'
      }
    },
    btnCursor: {
      cursor: 'pointer'
    },
    spanNone: {
      color: '#808080'
    },
    spanDange: {
      color: '#FF8C00'
    },
    paperDialog: {
      background: 'rgb(58, 65, 73) !important',
      color: '#f1f1f1'
    },
    fontSizeSmall: {
      fontSize: '1rem'
    },
    whiteBg: {
      backgroundColor: '#FFF'
    },
    textArea: {
      width: '20rem',
      margin: '1rem 2rem 1rem 0'
    }
  })
)
