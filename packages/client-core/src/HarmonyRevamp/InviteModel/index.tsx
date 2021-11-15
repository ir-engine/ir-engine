import React from 'react'
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

const Index = ({ invite }) => {
  const classes = useHarmonyStyles()
  const [value, setValue] = React.useState(invite === 'Group' ? 2 : 0)

  const handleChange = (event, newValue) => {
    // hack
    InviteService.updateInviteTarget('group', 'd5206d80-4499-11ec-bf97-7105055dd807')
    setValue(newValue)
  }

  return (
    <div>
      <div className={classes.bgModal} style={{ height: '60vh' }}>
        <div className={`${classes.dFlex} ${classes.alignCenter} ${classes.p5}`}>
          <AddCircleOutline />
          &nbsp;&nbsp;&nbsp;&nbsp;
          <h1>CREATE</h1>
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
            <Friends />
          </TabPanel>
          <TabPanel value={value} index={1}>
            <Party />
          </TabPanel>
          <TabPanel value={value} index={2}>
            <Group />
          </TabPanel>
        </Box>
      </div>
    </div>
  )
}

export default Index
