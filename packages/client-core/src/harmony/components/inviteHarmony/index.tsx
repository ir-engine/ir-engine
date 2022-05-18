import React, { useState } from 'react'
import SwipeableDrawer from '@mui/material/SwipeableDrawer'
import { useStyle, useStyles, CreateInput } from './style'
import AppBar from '@mui/material/AppBar'
import Box from '@mui/material/Box'
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos'
import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
import ReceivedInvites from './ReceivedInvites'
import SentInvites from './SentInvites'
import AddIcon from '@mui/icons-material/Add'
import IconButton from '@mui/material/IconButton'
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward'
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward'
import SupervisedUserCircleIcon from '@mui/icons-material/SupervisedUserCircle'
import GroupIcon from '@mui/icons-material/Group'
import GroupWorkIcon from '@mui/icons-material/GroupWork'
import FriendTab from './FriendTab'
import GroupTab from './GroupTab'
import PartyTab from './PartyTab'
import { useMediaQuery } from 'react-responsive'
import FormControl from '@mui/material/FormControl'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'

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

const InviteHarmony = ({ open, handleClose }) => {
  const classes = useStyles()
  const classex = useStyle()
  const [value, setValue] = useState(0)
  const [otherValue, setOtherValue] = useState(0)
  const [createMode, setCreateMode] = useState(false)
  const [type, setType] = useState('Friends')

  const isTabletOrMobile = useMediaQuery({ query: '(max-width: 768px)' })

  const handleChange = (event: React.ChangeEvent<{}>, newValue: number) => {
    setValue(newValue)
  }
  const handleChangeOther = (event: React.ChangeEvent<{}>, newValue: number) => {
    setOtherValue(newValue)
  }

  const handleChangeType = (event) => {
    setType(event.target.value)
  }

  console.log(type)
  return (
    <SwipeableDrawer
      anchor="right"
      open={open}
      onClose={() => handleClose(false)}
      onOpen={() => handleClose(true)}
      classes={{ paper: classex.paper }}
    >
      <div className={classex.root}>
        {!createMode && (
          <div>
            <AppBar position="static" style={{ backgroundColor: '#1f252d', color: '#f1f1f1' }}>
              <Tabs
                value={value}
                onChange={handleChange}
                aria-label="simple tabs example"
                classes={{ indicator: classes.indicator }}
              >
                <Tab
                  label="Received Invite"
                  {...a11yProps(0)}
                  icon={<ArrowDownwardIcon />}
                  classes={{ root: classes.root }}
                />
                <Tab
                  label="Sent Invite"
                  {...a11yProps(1)}
                  icon={<ArrowUpwardIcon />}
                  classes={{ root: classes.root }}
                />
              </Tabs>
            </AppBar>

            <TabPanel value={value} index={0}>
              <ReceivedInvites />
            </TabPanel>
            <TabPanel value={value} index={1}>
              <SentInvites />
            </TabPanel>
          </div>
        )}
        {createMode && (
          <div>
            {isTabletOrMobile ? (
              <div style={{ margin: '3rem auto', width: '90%' }}>
                <CreateInput>
                  <FormControl fullWidth>
                    <Select
                      labelId="demo-controlled-open-select-label"
                      id="demo-controlled-open-select"
                      value={type}
                      fullWidth
                      // displayEmpty
                      onChange={handleChangeType}
                      className={classes.select}
                      name="instance"
                      defaultValue={'Friends'}
                      MenuProps={{ classes: { paper: classex.selectPaper } }}
                    >
                      {['Friends', 'Groups', 'Party'].map((el) => (
                        <MenuItem value={el} key={el} style={{ background: '#343b41' }}>
                          {el}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </CreateInput>
                {type === 'Friends' && <FriendTab />}
                {type === 'Groups' && <GroupTab />}
                {type === 'Party' && <PartyTab />}
              </div>
            ) : (
              <div>
                <AppBar position="static" style={{ backgroundColor: '#1f252d', color: '#f1f1f1' }}>
                  <Tabs
                    value={otherValue}
                    onChange={handleChangeOther}
                    aria-label="simple tabs example"
                    classes={{ indicator: classes.indicator }}
                  >
                    <Tab
                      label="Friends"
                      {...a11yProps(0)}
                      icon={<SupervisedUserCircleIcon />}
                      classes={{ root: classes.root }}
                    />
                    <Tab label="Groups" {...a11yProps(1)} icon={<GroupIcon />} classes={{ root: classes.root }} />
                    <Tab label="Party" {...a11yProps(2)} icon={<GroupWorkIcon />} classes={{ root: classes.root }} />
                  </Tabs>
                </AppBar>
                <TabPanel value={otherValue} index={0}>
                  <FriendTab />
                </TabPanel>
                <TabPanel value={otherValue} index={1}>
                  <GroupTab />
                </TabPanel>
                <TabPanel value={otherValue} index={2}>
                  <PartyTab />
                </TabPanel>
              </div>
            )}
          </div>
        )}
      </div>
      <IconButton onClick={() => setCreateMode((prevState) => !prevState)} className={classes.createInviteBtn}>
        {createMode ? <ArrowBackIosIcon className={classes.whiteIcon} /> : <AddIcon className={classes.whiteIcon} />}
      </IconButton>
    </SwipeableDrawer>
  )
}

export default InviteHarmony
