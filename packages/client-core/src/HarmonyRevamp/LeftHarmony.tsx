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
import * as React from 'react'
import { useHarmonyStyles } from './style'

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

const LeftHarmony: React.FunctionComponent = () => {
  const classes = useHarmonyStyles()
  const [state, setState] = React.useState('Received')
  const [show, setShow] = React.useState(false)
  const [create, setCreate] = React.useState(false)
  const [chat, setChat] = React.useState('friends')
  const [type, setType] = React.useState('email')
  const [anchorEl, setAnchorEl] = React.useState(null)
  const [value, setValue] = React.useState(0)

  const handleChange = (event, newValue) => {
    setValue(newValue)
  }

  const handleClickOpen = () => {
    setShow(true)
  }

  const handleCreate = () => {
    setCreate(true)
  }

  const handleCloseCreate = () => {
    setCreate(false)
  }

  const handleClickClose = () => {
    setShow(false)
  }

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const open = Boolean(anchorEl)
  const id = open ? 'simple-popover' : undefined

  return (
    <>
      <div className={`${classes.dFlex} ${classes.flexColumn} ${classes.justifyContentBetween} ${classes.h100}`}>
        <div>
          <div className={`${classes.dFlex} ${classes.justifyContentBetween}`}>
            <h4>Chats</h4>
            <div className={`${classes.dFlex} ${classes.alignCenter}`}>
              <IconButton color="primary" component="span" onClick={handleClickOpen}>
                <Badge color="secondary" variant="dot">
                  <Notifications className={classes.primaryText} />
                </Badge>
              </IconButton>
              <IconButton component="span">
                <Search className={classes.primaryText} />
              </IconButton>
              <IconButton component="span" onClick={handleCreate}>
                <Add className={classes.secondaryText} />
              </IconButton>
            </div>
          </div>
          <div className={`${classes.dFlex} ${classes.flexWrap} ${classes.alignCenter} ${classes.my2}`}>
            <a
              href="#"
              onClick={() => setChat('party')}
              className={`${chat === 'party' ? classes.bgPrimary : classes.border} ${classes.roundedCircle} ${
                classes.mx2
              }`}
            >
              <span>Party</span>
            </a>
            <a
              href="#"
              onClick={() => setChat('friends')}
              className={`${chat === 'friends' ? classes.bgPrimary : classes.border} ${classes.roundedCircle} ${
                classes.mx2
              }`}
            >
              <span>Friends</span>
            </a>
            <a
              href="#"
              onClick={() => setChat('group')}
              className={`${chat === 'group' ? classes.bgPrimary : classes.border} ${classes.roundedCircle} ${
                classes.mx2
              }`}
            >
              <span>Group</span>
            </a>
            <a
              href="#"
              onClick={() => setChat('layer')}
              className={`${chat === 'layer' ? classes.bgPrimary : classes.border} ${classes.roundedCircle} ${
                classes.mx2
              }`}
            >
              <span>Layer</span>
            </a>
            <a
              href="#"
              onClick={() => setChat('instance')}
              className={`${chat === 'instance' ? classes.bgPrimary : classes.border} ${classes.roundedCircle} ${
                classes.mx2
              }`}
            >
              <span>Instance</span>
            </a>
          </div>
          {chat !== 'group' ? (
            <div className={`${classes.dFlex} ${classes.justifyContentBetween} ${classes.my2}`}>
              <div className={`${classes.dFlex} ${classes.mx2}`}>
                <Avatar src="./Avatar.png" />
                {/* <img src={Avatar} alt="" width="44" height="44" /> */}
                <div className={classes.mx2}>
                  <h4 className={classes.fontBig}>Dwark Matths</h4>
                  <small className={classes.textMuted}>You:</small>
                  <small className={classes.textMuted}>UX Consulting</small>
                </div>
              </div>
              <span>12m</span>
            </div>
          ) : (
            <>
              <div className={classes.center}>
                <a href="#" className={`${classes.my2} ${classes.btn}`}>
                  CREATE GROUP
                </a>
              </div>
              <div className={`${classes.dFlex} ${classes.justifyContentBetween} ${classes.my2}`}>
                <div>
                  <div className={classes.mx2}>
                    <h4 className={classes.fontBig}>Dwark Matths</h4>
                    <small className={classes.textMuted}>You:</small>
                    <small className={classes.textMuted}>UX Consulting</small>
                  </div>
                </div>
                <div>
                  <a href="#" className={classes.border0} onClick={handleClick}>
                    <MoreHoriz />
                  </a>
                  <Popover
                    id={id}
                    open={open}
                    anchorEl={anchorEl}
                    onClose={handleClose}
                    anchorOrigin={{
                      vertical: 'bottom',
                      horizontal: 'right'
                    }}
                    transformOrigin={{
                      vertical: 'center',
                      horizontal: 'left'
                    }}
                  >
                    <div className={classes.bgDark}>
                      <MenuList sx={{ width: 210, maxWidth: '100%', borderRadius: 10 }}>
                        <MenuItem className={classes.my2}>
                          <ListItemIcon>
                            <Forum fontSize="small" className={classes.info} />
                          </ListItemIcon>
                          <ListItemText>CHAT</ListItemText>
                        </MenuItem>
                        <MenuItem className={classes.my2}>
                          <ListItemIcon>
                            <Edit fontSize="small" className={classes.muted} />
                          </ListItemIcon>
                          <ListItemText>EDIT</ListItemText>
                        </MenuItem>
                        <MenuItem className={classes.my2}>
                          <ListItemIcon>
                            <GroupAdd fontSize="small" className={classes.success} />
                          </ListItemIcon>
                          <ListItemText>INVITE</ListItemText>
                        </MenuItem>
                        <MenuItem className={classes.my2}>
                          <ListItemIcon>
                            <Delete fontSize="small" className={classes.danger} />
                          </ListItemIcon>
                          <ListItemText>DELETE</ListItemText>
                        </MenuItem>
                      </MenuList>
                      <div className={classes.center}>
                        <a href="#" className={`${classes.my2} ${classes.btn}`}>
                          CREATE GROUP
                        </a>
                      </div>
                    </div>
                  </Popover>
                </div>
              </div>
            </>
          )}
        </div>
        <div>
          <div className={`${classes.dFlex} ${classes.box} ${classes.mx2}`}>
            <Avatar src="./Avatar.png" />
            <div className={classes.mx2}>
              <h4 className={classes.fontBig}>Dwark Matths</h4>
              <small className={classes.textMuted}>You:</small>
              <small className={classes.textMuted}>UX Consulting</small>
            </div>
          </div>
        </div>
      </div>
      <Dialog
        fullWidth={true}
        maxWidth={'sm'}
        open={show}
        onClose={handleClickClose}
        // className={classes.bgModal}
      >
        <div className={`${classes.dFlex} ${classes.justifyContentBetween} ${classes.alignCenter} ${classes.bgModal}`}>
          <button
            className={`${classes.btns} ${state === 'Received' && classes.borderBottom}`}
            onClick={() => setState('Received')}
          >
            <b className={`${state === 'Received' && classes.info}`}>RECEIVED</b>
          </button>
          <button
            className={`${classes.btns} ${state === 'Sent' && classes.borderBottom}`}
            onClick={() => setState('Sent')}
          >
            <b className={`${state === 'Sent' && classes.info}`}>SENT</b>
          </button>
        </div>
        <div className={`${classes.bgModal} ${classes.p4}`}>
          {state === 'Received' ? (
            <div className={`${classes.dFlex} ${classes.justifyContentBetween} ${classes.alignCenter} ${classes.my2}`}>
              <div className={`${classes.dFlex} ${classes.alignCenter} ${classes.mx2}`}>
                <Avatar src="./Avatar.png" />
                {/* <img src={Avatar} alt="" width="44" height="44" /> */}
                <div className={classes.mx2}>
                  <h4 className={classes.fontBig}>Dwark Matths</h4>
                  <small className={classes.textMuted}>12 Aug 2021</small>
                </div>
              </div>
              <div className={`${classes.dFlex} ${classes.alignCenter}`}>
                <button className={`${classes.smallBtn} ${classes.lightDanger}`}>
                  <Close fontSize="small" style={{ color: '#DD3333' }} />
                </button>
                <button className={`${classes.smallBtn} ${classes.lightSuccess}`}>
                  <Check fontSize="small" style={{ color: '#57C290' }} />
                </button>
              </div>
            </div>
          ) : (
            <div className={`${classes.dFlex} ${classes.justifyContentBetween} ${classes.alignCenter} ${classes.my2}`}>
              <div className={`${classes.dFlex} ${classes.alignCenter} ${classes.mx2}`}>
                <Avatar src="./Avatar.png" />
                <div className={classes.mx2}>
                  <h4 className={classes.fontBig}>Dwark Matths</h4>
                  <small className={classes.textMuted}>12 Aug 2021</small>
                </div>
              </div>
              <button className={`${classes.my2} ${classes.btn}`}>
                <span className={classes.danger}>Uninvite</span>
              </button>
            </div>
          )}
        </div>
      </Dialog>
      <Dialog fullWidth={true} maxWidth={'md'} open={create} onClose={handleCloseCreate}>
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
      </Dialog>
    </>
  )
}

export default LeftHarmony
