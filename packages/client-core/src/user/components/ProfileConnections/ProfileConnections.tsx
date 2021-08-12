import React from 'react'
import Grid from '@material-ui/core/Grid'
import Divider from '@material-ui/core/Divider'
import Typography from '@material-ui/core/Typography'
import { connect } from 'react-redux'
import SingleConnection from './SingleConnection'
import { User } from '@xrengine/common/src/interfaces/User'
import styles from './ProfileConnections.module.scss'
import { selectAuthState } from '../../reducers/auth/selector'
import { useTranslation } from 'react-i18next'

interface Props {
  auth: any
  classes: any
}

const mapStateToProps = (state: any): any => {
  return {
    auth: selectAuthState(state)
  }
}

const mapDispatchToProps = (): any => ({})

const ProfileConnections = (props: Props): any => {
  const { classes } = props
  const { t } = useTranslation()
  const user = props.auth.get('user') as User

  if (!user) {
    // window.location.href = '/'
    return <div />
  }

  return (
    <div className={styles.root}>
      <div className={styles.section1}>
        <Grid container alignItems="center">
          <Grid item xs>
            <Typography variant="h4">{t('user:profile.connections.title')}</Typography>
          </Grid>
        </Grid>
      </div>

      <Divider variant="middle" />
      <SingleConnection connectionType="email" />
      <Divider variant="middle" />
      <SingleConnection connectionType="sms" />
      <Divider variant="middle" />
      <SingleConnection connectionType="password" />
      <Divider variant="middle" />
      <SingleConnection connectionType="facebook" />
      <Divider variant="middle" />
      <SingleConnection connectionType="github" />
      <Divider variant="middle" />
      <SingleConnection connectionType="google" />
      <Divider variant="middle" />
      <SingleConnection connectionType="linkedin" />
    </div>
  )
}

const ProfileConnectionsWrapper = (props: any): any => <ProfileConnections {...props} />

export default connect(mapStateToProps, mapDispatchToProps)(ProfileConnectionsWrapper)
