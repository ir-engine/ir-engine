import { makeStyles, createStyles, Theme } from '@material-ui/core/styles'

export const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    rightRoot: {
      backgroundColor: '#1f252d',
      height: '100vh'
    },
    title: {
      display: 'flex',
      alignItems: 'center',
      padding: '5px',
      backgroundColor: '#12191D'
    },
    root: {
      padding: '2px 4px',
      display: 'flex',
      alignItems: 'center',
      width: '75vw'
    },
    input: {
      marginLeft: theme.spacing(1),
      flex: 1
    },
    iconButton: {
      padding: 10
    },
    divider: {
      height: 28,
      margin: 4
    },
    listText: {
      flexGrow: 1,
      backgroundColor: 'transparent'
    },
    messageContainer: {
      padding: '10px 0',
      overflowY: 'auto',
      height: '85vh'
    },
    whiteIcon: {
      color: '#f1f1f1'
    },
    listBtn: {
      backgroundColor: '#1f252d',
      color: '#fff',
      '&:hover': {
        background: 'rgba(0,0,0,0.9)'
      }
    }
  })
)

export const useStyle = makeStyles({})
