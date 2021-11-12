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
      backgroundColor: '#181A1C'
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
      flexDirection: 'column',
      height: '92vh'
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
      padding: '12px 24px',
      fontSize: 14,
      fontWeight: 'bold'
    },
    border0: {
      backgroundColor: 'transparent',
      color: '#FFF',
      textDecoration: 'none'
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
      height: '96vh'
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
    }
  })
)
