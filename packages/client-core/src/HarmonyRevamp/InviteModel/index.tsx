import React from 'react'
import { Add, Close, Delete, Edit, Forum, GroupAdd, Inbox, MoreHoriz, Notifications, Search } from '@material-ui/icons'
import { AddCircleOutline, Check } from '@mui/icons-material'
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

const Index = () => {
  const classes = useHarmonyStyles()
  const [show, setShow] = React.useState(false)
  const [type, setType] = React.useState('email')
  const [anchorEl, setAnchorEl] = React.useState(null)
  const [value, setValue] = React.useState(0)

  const handleChange = (event, newValue) => {
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
            <div className={`${classes.dFlex} ${classes.flexWrap} ${classes.alignCenter} ${classes.mx2}`}>
              <a
                href="#"
                onClick={() => setType('email')}
                className={`${type === 'email' ? classes.bgPrimary : classes.border} ${classes.roundedCircle} ${
                  classes.mx2
                }`}
              >
                <span>Email</span>
              </a>
              <a
                href="#"
                onClick={() => setType('phone')}
                className={`${type === 'phone' ? classes.bgPrimary : classes.border} ${classes.roundedCircle} ${
                  classes.mx2
                }`}
              >
                <span>Phone</span>
              </a>
              <a
                href="#"
                onClick={() => setType('code')}
                className={`${type === 'code' ? classes.bgPrimary : classes.border} ${classes.roundedCircle} ${
                  classes.mx2
                }`}
              >
                <span>Invite Code</span>
              </a>
            </div>
            <div className={classes.p5}>
              <form>
                {type === 'email' ? (
                  <div className="form-group">
                    <label htmlFor="" className={classes.mx2}>
                      <p>Email:</p>
                    </label>
                    <input type="text" className={classes.formControls} placeholder="Your@domain.com" />
                  </div>
                ) : type === 'phone' ? (
                  <div className="form-group">
                    <label htmlFor="">
                      <p>Phone:</p>
                    </label>
                    <input type="text" className={classes.formControls} placeholder="078XXXXXXX" />
                  </div>
                ) : (
                  <div className="form-group">
                    <label htmlFor="">
                      <p>Code:</p>
                    </label>
                    <input type="text" className={classes.formControls} placeholder="XXXXXX" />
                  </div>
                )}
                <div className={`${classes.dFlex} ${classes.my2}`} style={{ width: '100%' }}>
                  <button
                    className={`${classes.selfEnd} ${classes.roundedCircle} ${classes.borderNone} ${classes.mx2} ${classes.bgPrimary}`}
                  >
                    Send
                  </button>
                </div>
              </form>
            </div>
          </TabPanel>
          <TabPanel value={value} index={1}>
            <div className={`${classes.dFlex} ${classes.flexWrap} ${classes.alignCenter} ${classes.mx2}`}>
              <a
                href="#"
                onClick={() => setType('email')}
                className={`${type === 'email' ? classes.bgPrimary : classes.border} ${classes.roundedCircle} ${
                  classes.mx2
                }`}
              >
                <span>Email</span>
              </a>
              <a
                href="#"
                onClick={() => setType('phone')}
                className={`${type === 'phone' ? classes.bgPrimary : classes.border} ${classes.roundedCircle} ${
                  classes.mx2
                }`}
              >
                <span>Phone</span>
              </a>
              <a
                href="#"
                onClick={() => setType('code')}
                className={`${type === 'code' ? classes.bgPrimary : classes.border} ${classes.roundedCircle} ${
                  classes.mx2
                }`}
              >
                <span>Invite Code</span>
              </a>
              <a
                href="#"
                onClick={() => setType('friends')}
                className={`${type === 'friends' ? classes.bgPrimary : classes.border} ${classes.roundedCircle} ${
                  classes.mx2
                }`}
              >
                <span>Friends</span>
              </a>
            </div>
            <div className={classes.p5}>
              <form>
                {type === 'email' ? (
                  <div className="form-group">
                    <label htmlFor="" className={classes.mx2}>
                      <p>Email:</p>
                    </label>
                    <input type="text" className={classes.formControls} placeholder="Your@domain.com" />
                  </div>
                ) : type === 'phone' ? (
                  <div className="form-group">
                    <label htmlFor="">
                      <p>Phone:</p>
                    </label>
                    <input type="text" className={classes.formControls} placeholder="078XXXXXXX" />
                  </div>
                ) : (
                  <div className="form-group">
                    <label htmlFor="">
                      <p>Code:</p>
                    </label>
                    <input type="text" className={classes.formControls} placeholder="XXXXXX" />
                  </div>
                )}
                <div className={`${classes.dFlex} ${classes.my2}`} style={{ width: '100%' }}>
                  <button
                    className={`${classes.selfEnd} ${classes.roundedCircle} ${classes.borderNone} ${classes.mx2} ${classes.bgPrimary}`}
                  >
                    Send
                  </button>
                </div>
              </form>
            </div>
          </TabPanel>
          <TabPanel value={value} index={2}>
            <div className={`${classes.dFlex} ${classes.flexWrap} ${classes.alignCenter} ${classes.mx2}`}>
              <a
                href="#"
                onClick={() => setType('email')}
                className={`${type === 'email' ? classes.bgPrimary : classes.border} ${classes.roundedCircle} ${
                  classes.mx2
                }`}
              >
                <span>Email</span>
              </a>
              <a
                href="#"
                onClick={() => setType('phone')}
                className={`${type === 'phone' ? classes.bgPrimary : classes.border} ${classes.roundedCircle} ${
                  classes.mx2
                }`}
              >
                <span>Phone</span>
              </a>
              <a
                href="#"
                onClick={() => setType('code')}
                className={`${type === 'code' ? classes.bgPrimary : classes.border} ${classes.roundedCircle} ${
                  classes.mx2
                }`}
              >
                <span>Invite Code</span>
              </a>
              <a
                href="#"
                onClick={() => setType('friends')}
                className={`${type === 'friends' ? classes.bgPrimary : classes.border} ${classes.roundedCircle} ${
                  classes.mx2
                }`}
              >
                <span>Friends</span>
              </a>
            </div>
            <div className={classes.p5}>
              <form>
                {type === 'email' ? (
                  <div className="form-group">
                    <label htmlFor="" className={classes.mx2}>
                      <p>Email:</p>
                    </label>
                    <input type="text" className={classes.formControls} placeholder="Your@domain.com" />
                  </div>
                ) : type === 'phone' ? (
                  <div className="form-group">
                    <label htmlFor="">
                      <p>Phone:</p>
                    </label>
                    <input type="text" className={classes.formControls} placeholder="078XXXXXXX" />
                  </div>
                ) : (
                  <div className="form-group">
                    <label htmlFor="">
                      <p>Code:</p>
                    </label>
                    <input type="text" className={classes.formControls} placeholder="XXXXXX" />
                  </div>
                )}
                <div className={`${classes.dFlex} ${classes.my2}`} style={{ width: '100%' }}>
                  <button
                    className={`${classes.selfEnd} ${classes.roundedCircle} ${classes.borderNone} ${classes.mx2} ${classes.bgPrimary}`}
                  >
                    Send
                  </button>
                </div>
              </form>
            </div>
          </TabPanel>
        </Box>
      </div>
    </div>
  )
}

export default Index
