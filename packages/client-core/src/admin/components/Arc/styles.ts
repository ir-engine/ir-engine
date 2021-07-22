import { createStyles, makeStyles, Theme } from '@material-ui/core/styles'

export const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    large: {
      width: theme.spacing(14),
      height: theme.spacing(14),
      marginTop: '20%'
    },
    paperHeight: {
      height: '20vh',
      background: '#111',
      color: '#f1f1f1',
      backgroundColor: '#343b41'
    },
    createBtn: {
      height: '50px',
      margin: 'auto 5px',
      width: '100%',
      background: 'rgb(58, 65, 73)',
      color: '#f1f1f1 !important',
      fontSize: '0.8rem'
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
    iconButton: {
      padding: 10,
      color: '#f1f1f1'
    },
    marginBottom: {
      marginBottom: '10px'
    },
    rootTable: {
      flexGrow: 1,
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(12rem, 1fr))',
      gridGap: '1rem 20px',
      width: '100%',
      backgroundColor: '#43484F',
      padding: '2rem'
    },
    marginTp: {
      marginTop: '20%'
    },
    texAlign: {
      textAlign: 'center'
    },
    root: {
      width: '100%'
    },
    container: {
      maxHeight: '80vh'
    },
    rootCard: {
      maxWidth: 345,
      background: '#343b41',
      color: '#f1f1f1'
    },
    media: {
      height: 140
    },
    spanDange: {
      color: '#FF8C00'
    },
    typo: {
      textTransform: 'capitalize'
    },
    mt20: {
      marginTop: '20%'
    },
    center: {
      margin: '4rem auto 0 auto',
      textAlign: 'center'
    },
    cardHolder: {
      background: '#f1f1f1',
      display: 'flex',
      justifyContent: 'space-between'
    },
    space: {
      padding: '1.2rem'
    },
    Card: {
      display: 'inline-block',
      maxWidth: '49%',
      overflow: 'hidden'
    },
    mt10: {
      marginTop: '10%'
    },
    position: {
      marginTop: '1.7rem'
    },
    saveBtn: {
      marginLeft: 'auto',
      background: '#43484F !important',
      // color: '#fff !important',
      width: '150px',
      boxShadow:
        '0px 3px 1px -2px rgb(0 0 0 / 20%), 0px 2px 2px 0px rgb(0 0 0 / 14%), 0px 1px 5px 0px rgb(0 0 0 / 12%) !important'
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
    select: {
      color: '#f1f1f1 !important'
    },
    uploadContainer: {
      display: 'flex',
      flexDirection: 'column',
      padding: '1.5rem 0',
      marginBottom: '3.8rem'
    },
    uploadItem: {
      width: '100%',
      display: 'flex',
      justifyContent: 'space-between',
      marginBottom: '1.5rem'
    },
    spaceLen: {
      width: '100%',
      padding: '.2rem'
    },
    upload: {
      display: 'flex',
      flexDirection: 'column',
      width: '49%'
    },
    button: {
      background: '#343b41'
    },
    btn: {
      background: '#343b41',
      width: '100%'
    }
  })
)

export const useStyle = makeStyles({
  paper: {
    maxWidth: '80%',
    backgroundColor: '#43484F',
    color: '#f1f1f1'
  },
  paperDialog: {
    background: 'rgb(58, 65, 73) !important',
    color: '#f1f1f1'
  },
  saveBtn: {
    marginLeft: 'auto',
    background: '#43484F !important',
    color: '#fff !important',
    width: '150px',
    marginRight: '25px',
    boxShadow:
      '0px 3px 1px -2px rgb(0 0 0 / 20%), 0px 2px 2px 0px rgb(0 0 0 / 14%), 0px 1px 5px 0px rgb(0 0 0 / 12%) !important'
  },
  selectPaper: {
    background: '#343b41',
    color: '#f1f1f1'
  }
})
