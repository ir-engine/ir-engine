import React, { useContext } from 'react'
import { useFriendState } from '@xrengine/client-core/src/social/services/FriendService'
import { useHarmonyStyles } from '../style'
import { Delete, Forum, MoreHoriz } from '@mui/icons-material'
import { ChatService } from '@xrengine/client-core/src/social/services/ChatService'
import {
  MenuList,
  MenuItem,
  ListItemAvatar,
  ListItemIcon,
  ListItemText,
  Popover,
  Avatar,
  ListItem,
  Divider
} from '@mui/material'
import ModeContext from '../context/modeContext'
import { useHistory } from 'react-router-dom'
import queryString from 'querystring'

interface Props {
  setShowChat: any
  setFriendDeletePending: any
  showUnfriendConfirm: any
}

const FriendList = (props: Props) => {
  const { setShowChat, setFriendDeletePending, showUnfriendConfirm } = props
  const classes = useHarmonyStyles()
  const { darkMode } = useContext(ModeContext)

  const [anchorEl, setAnchorEl] = React.useState(null)
  const history = useHistory()
  const persed = queryString.parse(location.search)

  //friend state
  const friendState = useFriendState()
  const friendSubState = friendState.friends
  const friends = friendSubState.friends.value

  const setActiveChat = (channelType, target): void => {
    history.push({
      pathname: '/harmony',
      search: `?channel=${channelType}&&id=${target.id}`
    })
    ChatService.updateMessageScrollInit(true)
    ChatService.updateChatTarget(channelType, target)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget)
  }

  const open = Boolean(anchorEl)
  const id = open ? 'simple-popover' : undefined

  return (
    <div>
      {friends &&
        friends.length > 0 &&
        [...friends]
          .sort((a, b) => a.name - b.name)
          .map((friend, index) => {
            return (
              <div key={friend.id}>
                <ListItem
                  classes={{ selected: darkMode ? classes.selected : classes.selectedLigth }}
                  className={`${classes.cpointer} ${darkMode ? classes.bgActive : classes.bgActiveLight}`}
                  selected={persed.id === friend.id}
                  button
                >
                  <ListItemAvatar>
                    <Avatar src={friend.avatarUrl} />
                  </ListItemAvatar>
                  <div className={`${classes.dFlex} ${classes.alignCenter} ${classes.my2} ${classes.flexGrow2}`}>
                    <div
                      onClick={() => {
                        setActiveChat('user', friend), setShowChat(true)
                      }}
                      className={`${classes.mx2} ${classes.flexGrow2}`}
                    >
                      <h4 className={`${classes.fontBig} ${darkMode ? classes.white : classes.textBlack}`}>
                        {friend.name}
                      </h4>
                      <small className={classes.textMuted}>Hello Buddy</small>
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
                            <MenuItem
                              className={classes.my2}
                              onClick={() => {
                                setActiveChat('user', friend), setShowChat(true), handleClose()
                              }}
                            >
                              <ListItemIcon>
                                <Forum fontSize="small" className={classes.info} />
                              </ListItemIcon>
                              <ListItemText>CHAT</ListItemText>
                            </MenuItem>
                            <MenuItem
                              className={classes.my2}
                              onClick={() => {
                                showUnfriendConfirm(), handleClose(), setFriendDeletePending(friend)
                              }}
                            >
                              <ListItemIcon>
                                <Delete fontSize="small" className={classes.danger} />
                              </ListItemIcon>
                              <ListItemText>UNFRIEND</ListItemText>
                            </MenuItem>
                          </MenuList>
                        </div>
                      </Popover>
                    </div>
                  </div>
                </ListItem>
                {index < friends.length - 1 && <Divider />}
              </div>
            )
          })}
    </div>
  )
}

export default FriendList
