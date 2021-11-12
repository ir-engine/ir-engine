import { Add, Delete, Edit, Forum, GroupAdd, Inbox, MoreHoriz, Notifications, Search } from '@material-ui/icons'
import {
  Badge,
  IconButton,
  MenuList,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Popover,
  Typography,
  Avatar
} from '@mui/material'
import * as React from 'react'
import { useHarmonyStyles } from './style'

const LeftHarmony: React.FunctionComponent = () => {
  const classes = useHarmonyStyles()
  const [chat, setChat] = React.useState('friends')
  const [anchorEl, setAnchorEl] = React.useState(null)

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const open = Boolean(anchorEl)
  const id = open ? 'simple-popover' : undefined

  return (
    <div className={`${classes.dFlex} ${classes.flexColumn} ${classes.justifyContentBetween}`}>
      <div>
        <div className={`${classes.dFlex} ${classes.justifyContentBetween}`}>
          <h4>Chats</h4>
          <div className={`${classes.dFlex} ${classes.alignCenter}`}>
            <IconButton color="primary" component="span">
              <Badge color="secondary" variant="dot">
                <Notifications className={classes.primaryText} />
              </Badge>
            </IconButton>
            <IconButton component="span">
              <Search className={classes.primaryText} />
            </IconButton>
            <IconButton component="span">
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
  )
}

export default LeftHarmony
