import React, { useContext } from 'react'
import { Add, Close, Delete, Edit, Forum, GroupAdd, Inbox, MoreHoriz, Notifications, Search } from '@material-ui/icons'
import { AddCircleOutline, Check } from '@mui/icons-material'
import { InviteService } from '@xrengine/client-core/src/social/services/InviteService'
import {
  Badge,
  IconButton,
  MenuList,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Popover,
  Dialog,
  Typography,
  Avatar,
  Box,
  Tabs,
  Tab
} from '@mui/material'
import Friends from './Friends'
import Group from './Group'
import Party from './Party'
import { useHarmonyStyles } from '../style'
import ModeContext from '../context/modeContext'

function TabPanel(props) {
  const { children, value, index, ...other } = props

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`vertical-tabpanel-${index}`}
      aria-labelledby={`vertical-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  )
}

function a11yProps(index) {
  return {
    id: `vertical-tab-${index}`,
    'aria-controls': `vertical-tabpanel-${index}`
  }
}

interface Props {
  invite: string
  handleCloseModal: any
}

const Index = (props: Props) => {
  const { invite, handleCloseModal } = props
  const { darkMode } = useContext(ModeContext)
  const classes = useHarmonyStyles()
  const [value, setValue] = React.useState(invite === 'Group' ? 2 : invite === 'Party' ? 1 : 0)

  const handleChange = (event, newValue) => {
    setValue(newValue)
  }

  return (
    <div>
      <div className={darkMode ? classes.bgModal : classes.bgModalLight} style={{ height: '60vh' }}>
        <div className={`${classes.dFlex} ${classes.alignCenter} ${classes.p5}`}>
          <AddCircleOutline />
          &nbsp;&nbsp;&nbsp;&nbsp;
          <h1>Send Invite</h1>
        </div>
        <Box sx={{ flexGrow: 1, display: 'flex', height: 224, marginTop: 5 }}>
          <Tabs
            orientation="vertical"
            variant="scrollable"
            value={value}
            onChange={handleChange}
            aria-label="Vertical tabs example"
            sx={{ borderRight: 1, borderColor: 'divider' }}
          >
            <Tab label="FRIENDS" {...a11yProps(0)} />
            <Tab label="PARTY" {...a11yProps(1)} />
            <Tab label="GROUP" {...a11yProps(2)} />
          </Tabs>
          <TabPanel value={value} index={0}>
            <Friends handleCloseModal={handleCloseModal} />
          </TabPanel>
          <TabPanel value={value} index={1}>
            <Party handleCloseModal={handleCloseModal} />
          </TabPanel>
          <TabPanel value={value} index={2}>
            <Group handleCloseModal={handleCloseModal} />
          </TabPanel>
        </Box>
      </div>
    </div>
  )
}

export default Index
