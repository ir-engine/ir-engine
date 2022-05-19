import { ConfirmProvider } from 'material-ui-confirm'
import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import AppBar from '@mui/material/AppBar'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'

import { InviteService, useInviteState } from '../../../social/services/InviteService'
import { useAuthState } from '../../../user/services/AuthService'
import Search from '../../common/Search'
import { UserService, useUserState } from '../../services/UserService'
import styles from '../../styles/admin.module.scss'
import ReceivedInvite from './ReceivedInvite'
import SentInvite from './SentInvite'

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
      {value === index && (
        <Box p={3} className={styles.tabpanelRoot}>
          {children}
        </Box>
      )}
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
  const [refetch, setRefetch] = React.useState(false)
  const [value, setValue] = React.useState(0)
  const [search, setSearch] = React.useState('')

  const inviteState = useInviteState()

  const adminUserState = useUserState()
  const user = useAuthState().user
  const { t } = useTranslation()

  const handleChange = (event: React.ChangeEvent<{}>, newValue: number) => {
    setValue(newValue)
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
        <Grid container spacing={1} className={styles.mb10px}>
          <Grid item xs={12}>
            <Search text="invite" handleChange={handleSearchChange} />
          </Grid>
        </Grid>
        <div className={styles.rootTableWithSearch}>
          <AppBar position="static" className={styles.inviteTabAppbar}>
            <Tabs
              value={value}
              onChange={handleChange}
              aria-label="simple tabs example"
              classes={{ root: styles.tabsRoot, indicator: styles.indicator }}
            >
              <Tab label={t('admin:components.invite.receivedInvite')} {...a11yProps(0)} />
              <Tab label={t('admin:components.invite.sendInvite')} {...a11yProps(1)} />
            </Tabs>
          </AppBar>
          <TabPanel value={value} index={0}>
            <ReceivedInvite search={search} />
          </TabPanel>
          <TabPanel value={value} index={1}>
            <SentInvite search={search} />
          </TabPanel>
        </div>
      </ConfirmProvider>
    </div>
  )
}

export default InvitesConsole
