import React, { useEffect } from 'react'
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles'
import { bindActionCreators, Dispatch } from 'redux'
import { useDispatch } from '@xrengine/client-core/src/store'
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
import { UserService } from '../../state/UserService'
import { useAuthState } from '../../../user/state/AuthState'
import { ConfirmProvider } from 'material-ui-confirm'
import Grid from '@material-ui/core/Grid'
import { useUserState } from '../../state/UserState'
import { inviteStyles } from './styles'
import { useInviteState } from '../../../social/state/InviteState'
import { InviteService } from '../../../social/state/InviteService'

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

interface Props {}

const InvitesConsole = (props: Props) => {
  const classes = inviteStyles()
  const [refetch, setRefetch] = React.useState(false)
  const [value, setValue] = React.useState(0)
  const [inviteModelOpen, setInviteModelOpen] = React.useState(false)

  const inviteState = useInviteState()

  const invites = inviteState.sentInvites.invites
  const adminUserState = useUserState()
  const adminUsers = adminUserState.users.users
  const user = useAuthState().user
  const dispatch = useDispatch()
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
    if (user?.id.value != null && (adminUserState.users.updateNeeded.value === true || refetch === true)) {
      UserService.fetchUsersAsAdmin()
    }
    setRefetch(false)
  }, [useAuthState(), adminUserState.users.updateNeeded.value, refetch])

  useEffect(() => {
    if (inviteState.sentUpdateNeeded.value === true) {
      InviteService.retrieveSentInvites()
    }
  }, [inviteState.sentUpdateNeeded.value])

  useEffect(() => {
    if (inviteState.sentUpdateNeeded.value === true) {
      InviteService.retrieveReceivedInvites()
    }
  }, [inviteState.sentUpdateNeeded.value])

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
            <SentInvite invites={invites.value} />
          </TabPanel>
        </div>
      </ConfirmProvider>
      <InviteModel open={inviteModelOpen} handleClose={closeModelInvite} users={adminUsers.value} />
    </div>
  )
}

export default InvitesConsole
