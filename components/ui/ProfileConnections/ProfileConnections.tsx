
import React from 'react'
import { createStyles, Theme, makeStyles } from '@material-ui/core/styles'
import Grid from '@material-ui/core/Grid'
import Divider from '@material-ui/core/Divider'
import Typography from '@material-ui/core/Typography'
import { connect } from 'react-redux'
import { selectAuthState } from '../../../redux/auth/selector'
import SingleConnection from './SingleConnection'
import { User } from '../../../interfaces/User'

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      width: '100%',
      backgroundColor: theme.palette.background.paper,
      padding: '10px'
    },
    section1: {
      padding: theme.spacing(3)
    }
  })
)

interface Props {
  auth: any,
  classes: any,
}

const mapStateToProps = (state: any) => {
  return {
    auth: selectAuthState(state)
  }
}

const mapDispatchToProps = () => ({
})

class ProfileConnections extends React.Component<Props> {
  render() {
    const { classes } = this.props
    const user = this.props.auth.get('user') as User

    if (!user) {
      // window.location.href = '/'
      return <div/>
    }

    return (
      <div className={classes.root}>
        <div className={classes.section1}>
          <Grid container alignItems="center">
            <Grid item xs>
              <Typography variant="h4">
                Connections
              </Typography>
            </Grid>
          </Grid>
        </div>

        <Divider variant="middle" />
        <SingleConnection connectionType="email"></SingleConnection>

        <Divider variant="middle" />
        <SingleConnection connectionType="sms"></SingleConnection>
        <Divider variant="middle" />
        <SingleConnection connectionType="password"></SingleConnection>
        <Divider variant="middle" />
        <SingleConnection connectionType="facebook"></SingleConnection>
        <Divider variant="middle" />
        <SingleConnection connectionType="github"></SingleConnection>
        <Divider variant="middle" />
        <SingleConnection connectionType="google"></SingleConnection>
      </div>
    )
  }
}

const ProfileConnectionsWrapper = (props: any) => {
  const classes = useStyles()

  return (
    <ProfileConnections {...props} classes={classes}/>
  )
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ProfileConnectionsWrapper)
