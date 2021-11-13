import { makeStyles, Theme, createStyles } from '@material-ui/core/styles'

export const useHarmonyStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      width: '100%',
      overflow: 'hidden',
      height: '100vh',
      backgroundColor: '#161819'
    },
    bgPrimary: {
      backgroundColor: '#935CFF',
      padding: '7px 18px'
    },
    rightGrid: {
      backgroundColor: '#181A1C',
      padding: '50px 0px'
    },
    leftGrid: {
      backgroundColor: '#181A1C',
      padding: '50px 0px'
    },
    dFlex: {
      display: 'flex'
    },
    justifyContentBetween: {
      justifyContent: 'space-between'
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
    mx2: {
      margin: '7px 10px'
    },
    p5: {
      padding: '20px'
    },
    my2: {
      margin: '15px 0px'
    },
    roundedCircle: {
      borderRadius: 80,
      textDecoration: 'none'
    },
    border: {
      border: '1px dashed #FFF',
      padding: '7px 18px'
    },
    fontBig: {
      fontSize: 15,
      marginBottom: '5px'
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
      borderRadius: '2px'
    },
    box: {
      backgroundColor: '#232424',
      padding: '13px 16px',
      borderRadius: '5px'
    },
    center: {
      display: 'flex',
      justifyContent: 'center'
    },
    btn: {
      textDecoration: 'none',
      color: '#935CFF',
      backgroundColor: '#232424',
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
    flexGrow: {
      flexGrow: 1,
      backgroundColor: '#232424',
      margin: '0px 8px',
      padding: '8px 10px',
      borderRadius: '30px'
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
    p2: {
      backgroundColor: '#1B1C1D',
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
    btns: {
      backgroundColor: 'transparent',
      color: '#fff',
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
      border: 0
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
    }
  })
)
