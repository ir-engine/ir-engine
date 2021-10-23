import { makeStyles, createStyles, Theme } from '@material-ui/core/styles'

export const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      flexGrow: 1,
      width: '100%',
      backgroundColor: theme.palette.background.paper
    }
  })
)

export const useStyle = makeStyles({
  paper: {
    width: '50rem',
    opacity: '0.5'
  }
})
