import { makeStyles, Theme, createStyles } from '@material-ui/core/styles'

export const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    marginBottom: {
      marginBottom: '10px'
    },
    createBtn: {
      height: '50px',
      margin: 'auto 5px',
      width: '100%',
      background: 'rgb(58, 65, 73)',
      color: '#f1f1f1 !important'
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
    paper: {
      width: '60%',
      backgroundColor: '#43484F ',
      color: '#f1f1f1',
      '&::-webkit-scrollbar': {
        display: 'none'
      }
    },
    space: {
      padding: '1.2rem'
    },
    texAlign: {
      textAlign: 'center'
    },
    select: {
      color: '#f1f1f1 !important'
    },
    selectPaper: {
      background: '#343b41',
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
    createInput: {
      padding: '2px 4px',
      display: 'flex',
      alignItems: 'center',
      marginTop: '3px',
      marginBottom: '15px',
      background: '#343b41',
      border: '1px solid #23282c',
      color: '#f1f1f1 !important'
    },
    saveBtn: {
      marginLeft: 'auto',
      background: '#43484F !important',
      color: '#fff !important',
      width: '150px',
      boxShadow:
        '0px 3px 1px -2px rgb(0 0 0 / 20%), 0px 2px 2px 0px rgb(0 0 0 / 14%), 0px 1px 5px 0px rgb(0 0 0 / 12%) !important'
    },
    marginTp: {
      marginTop: '20%'
    },
    marginTop: {
      marginTop: '10%'
    },
    actionStyle: {
      textDecoration: 'none',
      color: '#000',
      marginRight: '10px'
    },
    spanWhite: {
      color: '#f1f1f1'
    },
    spanDange: {
      color: '#FF8C00'
    },
    spanNone: {
      color: '#808080'
    },
    tableCellHeader: {
      background: '#343b41 !important',
      color: '#f1f1f1 !important',
      borderBottom: '2px solid #23282c !important'
    },
    tableCellBody: {
      background: '#343b41 !important',
      borderBottom: '1px solid #23282c !important',
      color: '#f1f1f1 !important'
    },
    tableFooter: {
      background: '#343b41 !important',
      color: '#f1f1f1 !important'
    },
    paperHeight: {
      height: '20vh',
      background: '#111',
      color: '#f1f1f1',
      backgroundColor: '#343b41'
    },
    center: {
      margin: '4rem auto 0 auto',
      textAlign: 'center'
    },
    typo:{
      textTransform: 'capitalize'
    },
    margin:{
      marginTop: '6%'
    },
    mb40px: {
      marginBottom: '40px'
    },
    mb10: {
      marginBottom: '8%'
    },
    flex:{
      display: 'flex',
      alignContent: 'center',
      justifyContent: 'center'
    },
    alert: {
      background: '#343b41',
      color: '#f1f1f1'
    }
    
  })
)

export const useStyle = makeStyles({
  root: {
    width: '100%'
  },
  container: {
    maxHeight: '80vh'
  }
})
