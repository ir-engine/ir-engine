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
import ReceivedInvite from './ReceivedInvite'
import Button from '@material-ui/core/Button'
// import Search from '../Search'
import Search from './searchInvites'
import styles from '../Admin.module.scss'
import InviteModel from './InviteModel'
import { fetchUsersAsAdmin } from '../../reducers/admin/user/service'
import { useAuthState } from '../../../user/reducers/auth/AuthState'
import { selectAdminState } from '../../reducers/admin/selector'
import { ConfirmProvider } from 'material-ui-confirm'
import Grid from '@material-ui/core/Grid'
import { selectAdminUserState } from '../../reducers/admin/user/selector'
import { inviteStyles } from './styles'

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
    backgroundColor: '#43484F !important'
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
  fetchUsersAsAdmin?: any
  adminUserState?: any
}

const mapStateToProps = (state: any): any => {
  return {
    receivedInvites: selectInviteState(state),
    sentInvites: selectInviteState(state),
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
    fetchUsersAsAdmin,
    sentInvites,
    receivedInvites,
    retrieveSentInvites,
    retrieveReceivedInvites,
    adminUserState
  } = props
  const classes = inviteStyles()
  const [refetch, setRefetch] = React.useState(false)
  const [value, setValue] = React.useState(0)
  const [inviteModelOpen, setInviteModelOpen] = React.useState(false)
  const invites = sentInvites.get('sentInvites').get('invites')
  const adminUsers = adminUserState.get('users').get('users')
  const user = useAuthState().user

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
    if (user?.id.value != null && (adminUserState.get('users').get('updateNeeded') === true || refetch === true)) {
      fetchUsersAsAdmin()
    }
    setRefetch(false)
  }, [useAuthState(), adminUserState, refetch])

  useEffect(() => {
    if (sentInvites.get('sentUpdateNeeded') === true) {
      retrieveSentInvites()
    }
  }, [sentInvites])

  useEffect(() => {
    if (receivedInvites.get('sentUpdateNeeded') === true) {
      retrieveReceivedInvites()
    }
  }, [receivedInvites])

  return (
    <div>
      <ConfirmProvider>
        <Grid container spacing={3} className={classes.marginBottom}>
          <Grid item xs={9}>
            <Search />
          </Grid>
          <Grid item xs={3}>
            <Button variant="contained" className={classes.createBtn} type="submit" onClick={openModelInvite}>
              Send Invite
            </Button>
          </Grid>
        </Grid>
        <div className={classes.root}>
          <AppBar position="static" style={{ backgroundColor: '#343b41', color: '#f1f1f1' }}>
            <Tabs
              value={value}
              onChange={handleChange}
              aria-label="simple tabs example"
              classes={{ indicator: classes.indicator }}
            >
              <Tab label="Received Invite" {...a11yProps(0)} />
              <Tab label="Sent Invite" {...a11yProps(1)} />
            </Tabs>
          </AppBar>
          <TabPanel value={value} index={0}>
            <ReceivedInvite invites={[]} />
          </TabPanel>
          <TabPanel value={value} index={1}>
            <SentInvite invites={invites} />
          </TabPanel>
        </div>
      </ConfirmProvider>
      <InviteModel open={inviteModelOpen} handleClose={closeModelInvite} users={adminUsers} />
    </div>
  )
}

export default connect(mapStateToProps, mapDispatchToProps)(InvitesConsole)
