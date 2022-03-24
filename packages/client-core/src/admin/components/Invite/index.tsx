import { ConfirmProvider } from 'material-ui-confirm'
import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import AppBar from '@mui/material/AppBar'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid'
import { Theme } from '@mui/material/styles'
import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
import makeStyles from '@mui/styles/makeStyles'

import { InviteService, useInviteState } from '../../../social/services/InviteService'
import { useAuthState } from '../../../user/services/AuthService'
import Search from '../../common/Search'
import { UserService, useUserState } from '../../services/UserService'
import styles from '../../styles/admin.module.scss'
import InviteModal from './InviteModal'
import ReceivedInvite from './ReceivedInvite'
import SentInvite from './SentInvite'
import { inviteStyles } from './styles'

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
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
const a11yProps = (index: number) => {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`
  }
}

const InvitesConsole = () => {
  const classes = inviteStyles()
  const [refetch, setRefetch] = React.useState(false)
  const [value, setValue] = React.useState(0)
  const [inviteModalOpen, setInviteModalOpen] = React.useState(false)
  const [search, setSearch] = React.useState('')

  const inviteState = useInviteState()

  const invites = inviteState.sentInvites.invites
  const adminUserState = useUserState()
  const adminUsers = adminUserState.users
  const user = useAuthState().user
  const { t } = useTranslation()

  const handleChange = (event: React.ChangeEvent<{}>, newValue: number) => {
    setValue(newValue)
  }

  const openModalInvite = () => {
    setInviteModalOpen(true)
  }

  const closeModalInvite = () => {
    setInviteModalOpen(false)
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
    if (user?.id.value != null && (adminUserState.updateNeeded.value === true || refetch)) {
      UserService.fetchUsersAsAdmin()
    }
    setRefetch(false)
  }, [useAuthState(), adminUserState.updateNeeded.value, refetch])

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

  const handleSearchChange = (e: any) => {
    setSearch(e.target.value)
  }

  return (
    <div>
      <ConfirmProvider>
        <Grid container spacing={3} className={styles.mb10px}>
          <Grid item xs={9}>
            <Search text="invite" handleChange={handleSearchChange} />
          </Grid>
          <Grid item xs={3}>
            <Button variant="contained" className={classes.createBtn} type="submit" onClick={openModalInvite}>
              {t('admin:components.invite.sendInvite')}
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
              <Tab label={t('admin:components.invite.receivedInvite')} {...a11yProps(0)} />
              <Tab label={t('admin:components.invite.sendInvite')} {...a11yProps(1)} />
            </Tabs>
          </AppBar>
          <>
            <TabPanel value={value} index={0}>
              <ReceivedInvite invites={[]} />
            </TabPanel>
            <TabPanel value={value} index={1}>
              <SentInvite invites={invites.value} />
            </TabPanel>
          </>
        </div>
      </ConfirmProvider>
      <InviteModal open={inviteModalOpen} handleClose={closeModalInvite} users={adminUsers.value} />
    </div>
  )
}

export default InvitesConsole
