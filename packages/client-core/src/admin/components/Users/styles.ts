import { createStyles, makeStyles, Theme } from '@material-ui/core/styles'

export const useUserStyles = makeStyles((theme: Theme) =>
  createStyles({
    large: {
      width: theme.spacing(14),
      height: theme.spacing(14),
      [theme.breakpoints.down('sm')]: {
        width: '80px',
        height: '80px'
      }
    },
    pad: {
      padding: '20px'
    },
    centering: {
      justifyContent: 'center'
    },
    paperHeight: {
      height: '20vh',
      background: '#111',
      color: '#f1f1f1',
      backgroundColor: '#343b41',
      [theme.breakpoints.down('xs')]: {
        height: '15vh'
      }
    },
    mt20: {
      marginTop: '20%'
    },
    mt10: {
      marginTop: '10%'
    },
    mt5: {
      marginTop: '5%'
    },
    mb10: {
      marginBottom: '10%'
    },
    mb20px: {
      marginBottom: '20px'
    },
    searchRoot: {
      padding: '2px 20px',
      display: 'flex',
      alignItems: 'center',
      width: '100%',
      background: '#343b41'
    },
    input: {
      marginLeft: theme.spacing(1),
      flex: 1,
      color: '#f1f1f1'
    },
    iconButton: {
      padding: 10,
      color: '#f1f1f1'
    },
    divider: {
      height: 28,
      margin: 4
    },
    marginBottm: {
      marginBottom: '15px'
    },
    textLink: {
      marginLeft: '5px',
      textDecoration: 'none',
      color: '#ff9966'
    },
    marginTp: {
      marginTop: '20%'
    },
    marginTop: {
      marginTop: '7%'
    },
    texAlign: {
      textAlign: 'center'
    },
    tableCellHeader: {
      background: '#343b41 !important',
      color: '#f1f1f1 !important',
      borderBottom: '2px solid #23282c !important'
    },
    tableCellBody: {
      borderBottom: '1px solid #23282c !important',
      color: '#f1f1f1 !important'
    },
    tableFooter: {
      background: '#343b41 !important',
      color: '#f1f1f1 !important'
    },
    createBtn: {
      height: '50px',
      margin: 'auto 5px',
      width: '100%',
      background: 'rgb(58, 65, 73)',
      color: '#f1f1f1 !important'
    },
    rootTable: {
      flexGrow: 1,
      width: '100%',
      backgroundColor: '#43484F',
      color: '#f1f1f1'
    },
    marginBottom: {
      marginBottom: '10px'
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
      alignItems: 'center #343b41',
      marginTop: '10px',
      marginBottom: '15px',
      background: '#343b41',
      color: '#f1f1f1 !important'
    },
    select: {
      color: '#f1f1f1 !important'
    },
    selector: {
      width: '100%'
    },
    scopeContainer: {
      height: '200px',
      width: '460px',
      overflowY: 'scroll',
      [theme.breakpoints.down('sm')]: {
        width: '100%'
      }
    },
    headingFont: {
      width: '100%',
      [theme.breakpoints.down('sm')]: {
        fontSize: '1.6rem'
      },
      [theme.breakpoints.between(100, 395)]: {
        fontSize: '1.4rem'
      }
    },
    typoFont: {
      [theme.breakpoints.down('sm')]: {
        fontSize: '1.3rem'
      }
    },
    typoFontTitle: {
      [theme.breakpoints.down('xs')]: {
        fontSize: '1.3rem'
      }
    }
  })
)

export const useUserStyle = makeStyles((theme: Theme) =>
  createStyles({
    paper: {
      width: '40%',
      backgroundColor: '#43484F',
      color: '#f1f1f1',
      overflow: 'hidden'
    },
    paperDialog: {
      background: 'rgb(58, 65, 73) !important',
      color: '#f1f1f1'
    },
    root: {
      width: '100%'
    },
    container: {
      maxHeight: '80vh'
    },
    actionStyle: {
      textDecoration: 'none',
      color: '#000',
      marginRight: '10px'
    },
    saveBtn: {
      marginLeft: 'auto',
      background: '#43484F !important',
      color: '#fff !important',
      width: '150px',
      marginRight: '25px',
      boxShadow:
        '0px 3px 1px -2px rgb(0 0 0 / 20%), 0px 2px 2px 0px rgb(0 0 0 / 14%), 0px 1px 5px 0px rgb(0 0 0 / 12%) !important',
      [theme.breakpoints.down('sm')]: {
        width: '120px'
      },
      [theme.breakpoints.between(100, 335)]: {
        width: '80px'
      }
    },
    spanDange: {
      color: '#FF8C00'
    },
    spanNone: {
      color: '#808080'
    },
    spanWhite: {
      color: '#f1f1f1'
    },
    list: {
      width: 250
    },
    fullList: {
      width: 'auto'
    },
    selectPaper: {
      background: '#343b41',
      color: '#f1f1f1'
    }
  })
)
