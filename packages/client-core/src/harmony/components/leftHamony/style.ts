import { makeStyles, createStyles, Theme } from '@material-ui/core/styles'

export const useUserStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      width: '100%',
      // maxWidth: '36ch',
      backgroundColor: '#43484F'
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
    searchRoot: {
      padding: '2px 20px',
      display: 'flex',
      alignItems: 'center',
      width: '100%',
      background: '#343b41'
    },
    inline: {
      display: 'inline'
    },
    select: {
      color: '#f1f1f1 !important'
    },
    paperRoot: {
      flexGrow: 1
      // maxWidth: 500
    },
    formControl: {
      // margin: theme.spacing(1),
      minWidth: 120
    },
    selectEmpty: {
      marginTop: theme.spacing(2)
    },
    input: {
      marginLeft: theme.spacing(1),
      flex: 1,
      color: '#f1f1f1'
    },
    iconButton: {
      padding: 10,
      color: '#f1f1f1'
    }
  })
)

export const useStyle = makeStyles({
  selectPaper: {
    background: '#343b41',
    color: '#f1f1f1 !important'
  }
})
