import React, { useEffect } from 'react'
import { sendInvite, retrieveSentInvites, retrieveReceivedInvites } from '../../../social/reducers/invite/service'
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles'
import { selectInviteState } from '../../../social/reducers/invite/selector'
import { bindActionCreators, Dispatch } from 'redux'
import { connect } from 'react-redux'
import AppBar from '@material-ui/core/AppBar'
import Tabs from '@material-ui/core/Tabs'
import Tab from '@material-ui/core/Tab'
import Box from '@material-ui/core/Box'
import SentInvite from './SentInvite'
import RecievedInvite from './RecievedInvite'
import Button from '@material-ui/core/Button'
import Search from '../Search'
import styles from '../Admin.module.scss'
import InviteModel from './InviteModel'
import { fetchUsersAsAdmin } from '../../reducers/admin/user/service'
import { selectAuthState } from '../../../user/reducers/auth/selector'
import { selectAdminState } from '../../reducers/admin/selector'
import { ConfirmProvider } from 'material-ui-confirm'
import Grid from '@material-ui/core/Grid'
import { selectAdminUserState } from '../../reducers/admin/user/selector'

interface TabPanelProps {
  children?: React.ReactNode
  index: any
  value: any
}

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box p={3}>{children}</Box>}
    </div>
  )
}
const a11yProps = (index: any) => {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`
  }
}

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    flexGrow: 1,
    backgroundColor: theme.palette.background.paper
  },
  marginBottom: {
    marginBottom: '10px'
  }
}))

interface Props {
  receivedInvites?: any
  retrieveReceivedInvites?: any
  retrieveSentInvites?: any
  sendInvite?: any
  sentInvites?: any
  adminState?: any
  fetchUsersAsAdmin?: any
  authState?: any
  adminUserState?: any
}

const mapStateToProps = (state: any): any => {
  return {
    receivedInvites: selectInviteState(state),
    sentInvites: selectInviteState(state),
    adminState: selectAdminState(state),
    authState: selectAuthState(state),
    adminUserState: selectAdminUserState(state)
  }
}

const mapDispatchToProps = (dispatch: Dispatch): any => ({
  fetchUsersAsAdmin: bindActionCreators(fetchUsersAsAdmin, dispatch),
  sendInvite: bindActionCreators(sendInvite, dispatch),
  retrieveSentInvites: bindActionCreators(retrieveSentInvites, dispatch),
  retrieveReceivedInvites: bindActionCreators(retrieveReceivedInvites, dispatch)
})

const InvitesConsole = (props: Props) => {
  const {
    adminState,
    authState,
    fetchUsersAsAdmin,
    sentInvites,
    retrieveSentInvites,
    retrieveReceivedInvites,
    adminUserState
  } = props
  const classes = useStyles()
  const [refetch, setRefetch] = React.useState(false)
  const [value, setValue] = React.useState(0)
  const [inviteModelOpen, setInviteModelOpen] = React.useState(false)
  const invites = sentInvites.get('sentInvites').get('invites')
  const adminUsers = adminUserState.get('users').get('users')
  const user = authState.get('user')

  const handleChange = (event: React.ChangeEvent<{}>, newValue: number) => {
    setValue(newValue)
  }
  const openModelInvite = () => {
    setInviteModelOpen(true)
  }
  const closeModelInvite = () => {
    setInviteModelOpen(false)
  }

  const fetchTick = () => {
    setTimeout(() => {
      setRefetch(true)
      fetchTick()
    }, 5000)
  }

  useEffect(() => {
    fetchTick()
  }, [])

  useEffect(() => {
    if (user?.id != null && (adminUserState.get('users').get('updateNeeded') === true || refetch === true)) {
      fetchUsersAsAdmin()
    }
    setRefetch(false)
  }, [authState, adminUserState, refetch])

  useEffect(() => {
    const fetchData = async () => {
      await retrieveSentInvites(0, 100)
    }
    fetchData()
  }, [retrieveSentInvites])

  useEffect(() => {
    if (sentInvites.get('sentUpdateNeeded') === true) {
      retrieveSentInvites(0, 100)
    }
  }, [sentInvites])

  return (
    <div>
      <ConfirmProvider>
        <Grid container spacing={3} className={classes.marginBottom}>
          <Grid item xs={9}>
            <Search typeName="invites" />
          </Grid>
          <Grid item xs={3}>
            <Button
              className={styles.createLocation}
              type="submit"
              variant="contained"
              color="primary"
              onClick={openModelInvite}
            >
              Sent Invite
            </Button>
          </Grid>
        </Grid>
        <div className={classes.root}>
          <AppBar position="static" style={{ backgroundColor: '#fff', color: '#000' }}>
            <Tabs value={value} onChange={handleChange} aria-label="simple tabs example">
              <Tab label="Recieved Invite" {...a11yProps(0)} />
              <Tab label="Sent Invite" {...a11yProps(1)} />
            </Tabs>
          </AppBar>
          <TabPanel value={value} index={0}>
            <RecievedInvite invites={[]} />
          </TabPanel>
          <TabPanel value={value} index={1}>
            <SentInvite invites={invites} />
          </TabPanel>
        </div>
        <InviteModel open={inviteModelOpen} handleClose={closeModelInvite} users={adminUsers} />
      </ConfirmProvider>
    </div>
  )
}

export default connect(mapStateToProps, mapDispatchToProps)(InvitesConsole)
