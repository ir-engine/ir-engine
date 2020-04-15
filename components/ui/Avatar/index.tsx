import React from 'react'
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles'
import Avatar from '@material-ui/core/Avatar'
import { deepPurple } from '@material-ui/core/colors'
import Typography from '@material-ui/core/Typography'

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      display: 'flex',
      '& > *': {
        margin: theme.spacing(1)
      }
    },

    purple: {
      color: theme.palette.getContrastText(deepPurple[500]),
      backgroundColor: deepPurple[500]
    }
  })
)

export default function LetterAvatars() {
  const classes = useStyles()

  return (
    <React.Fragment>
      <Typography variant="body1" color="inherit">
        Shaw
      </Typography>
      <div className={classes.root}>
        <Avatar className={classes.purple}>S</Avatar>
      </div>
    </React.Fragment>
  )
}
