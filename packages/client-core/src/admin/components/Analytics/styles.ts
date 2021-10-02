import { createStyles, makeStyles, Theme } from '@material-ui/core/styles'

export const useStyle = makeStyles((theme: Theme) =>
  createStyles({
    paper: {
      height: '380',
      width: '100%',
      [theme.breakpoints.down('sm')]: {
        height: '200'
      }
    }
  })
)
