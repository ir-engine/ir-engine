import { createStyles, makeStyles, Theme } from '@material-ui/core/styles'

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    paperDialog: {
      background: 'rgb(58, 65, 73) !important',
      color: '#f1f1f1'
    },
    flex: {
      display: 'flex',
      justifyContent: 'center',
      alignContent: 'center'
    },
    input: {
      marginLeft: theme.spacing(1),
      color: '#f1f1f1'
    }
  })
)

const useStyle = makeStyles({
  spanDange: {
    color: '#FF8C00'
  },
  spanNone: {
    color: '#808080'
  },
  spanWhite: {
    color: '#f1f1f1'
  }
})

export { useStyle, useStyles }
