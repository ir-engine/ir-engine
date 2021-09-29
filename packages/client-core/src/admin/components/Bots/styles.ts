import { makeStyles, Theme, createStyles } from '@material-ui/core/styles'

const useStylesForBots = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      width: '100%',
      background: '#15171B',
      color: '#fff'
    },
    rootRigt: {
      width: '100%',
      background: '#15171B',
      color: '#fff',
      marginTop: '15px'
    },
    rootLeft: {
      width: '100%',
      background: '#43484F',
      color: '#fff'
    },
    heading: {
      fontSize: theme.typography.pxToRem(15),
      flexBasis: '33.33%',
      flexShrink: 0
    },
    secondaryHeading: {
      fontSize: theme.typography.pxToRem(15),
      color: '#C0C0C0'
    },
    thirdHeadding: {
      color: '#COCOCO',
      marginTop: '15px'
    },
    summary: {
      background: '#3a4149',
      borderBottom: '1px solid #23282c',
      color: '#f1f1f1',
      borderRadius: '0px'
    },
    details: {
      background: '#43484F',
      color: '#fff'
    },
    bullet: {
      display: 'inline-block',
      margin: '0 2px',
      transform: 'scale(0.8)'
    },
    title: {
      fontSize: 20
    },
    pos: {
      marginBottom: 12
    },
    header: {
      height: '50px',
      background: '#343b41',
      color: '#fff',
      borderBottom: '1px solid #23282c',
      borderRadius: '0px',
      paddingTop: '8px',
      paddingLeft: '20px'
    },
    alterContainer: {
      background: '#343b41',
      border: '1px solid #23282c',
      borderRadius: '5px',
      width: '100%',
      marginTop: '10px'
    },
    createAlterContainer: {
      background: '#343b41',
      //border: "1px solid #23282c",
      borderRadius: '5px',
      width: '100%',
      marginTop: '10px'
    },
    InputRoot: {
      padding: '2px 2px',
      display: 'flex',
      alignItems: 'center',
      width: '100%',
      marginTop: '10px',
      marginBottom: '30px',
      background: '#343b41',
      border: '1px solid #23282c',
      color: '#f1f1f1'
    },
    createInput: {
      padding: '2px 4px',
      display: 'flex',
      alignItems: 'center',
      //width: "45vw",
      marginTop: '10px',
      marginBottom: '15px',
      background: '#343b41',
      border: '1px solid #23282c',
      color: '#f1f1f1 !important'
    },
    redBorder: {
      border: '1px solid red',
      padding: '2px 4px',
      display: 'flex',
      alignItems: 'center',
      //width: "45vw",
      marginTop: '10px',
      marginBottom: '15px',
      background: '#343b41',
      color: '#f1f1f1 !important'
    },
    input: {
      marginLeft: theme.spacing(1),
      flex: 1,
      color: '#f1f1f1'
    },
    iconButton: {
      padding: 10,
      color: '#fff'
    },
    divider: {
      height: 28,
      margin: 4,
      background: '#fff'
    },
    displayCommand: {
      marginTop: '30px',
      background: '#3a4149',
      paddingLeft: '10px',
      paddingRight: '10px'
    },
    formControl: {
      margin: theme.spacing(1),
      minWidth: 120
    },
    select: {
      color: '#f1f1f1 !important'
    },
    saveBtn: {
      margin: '5px 5px 5px auto',
      background: '#43484F !important',
      color: '#fff !important',
      width: '150px',
      boxShadow:
        '0px 3px 1px -2px rgb(0 0 0 / 20%), 0px 2px 2px 0px rgb(0 0 0 / 14%), 0px 1px 5px 0px rgb(0 0 0 / 12%) !important',
      [theme.breakpoints.down('xs')]: {
        width: '80px',
        fontSize: '0.7rem'
      }
    },
    smFont: {
      fontSize: '20px',
      marginLeft: '10px',
      [theme.breakpoints.down('xs')]: {
        fontSize: '15px'
      }
    }
  })
)

const useStyle = makeStyles({
  autPaper: {
    background: '#43484F'
  },
  dialoPaper: {
    background: 'rgb(58, 65, 73) !important',
    width: '100%',
    color: '#f1f1f1',
    padding: '40px 10px 40px 10px'
  },
  selectPaper: {
    background: '#343b41',
    color: '#f1f1f1'
  }
})

export { useStylesForBots, useStyle }
