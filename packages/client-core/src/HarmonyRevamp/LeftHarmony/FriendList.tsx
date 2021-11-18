import React from 'react'
import { useFriendState } from '@xrengine/client-core/src/social/services/FriendService'
import { useHarmonyStyles } from '../style'
import { Delete, Forum, GroupAdd, MoreHoriz } from '@material-ui/icons'
import { InviteService } from '@xrengine/client-core/src/social/services/InviteService'
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

interface Props {
  setShowChat: any
}

const FriendList = (props: Props) => {
  const { setShowChat } = props
  const classes = useHarmonyStyles()

  const [anchorEl, setAnchorEl] = React.useState(null)
  const [invite, setInvite] = React.useState('')
  const [create, setCreate] = React.useState(false)

  //friend state
  const friendState = useFriendState()
  const friendSubState = friendState.friends
  const friends = friendSubState.friends.value

  const setActiveChat = (channelType, target): void => {
    ChatService.updateMessageScrollInit(true)
    ChatService.updateChatTarget(channelType, target)
  }

  const openInvite = (targetObjectType?: string, targetObjectId?: string): void => {
    InviteService.updateInviteTarget(targetObjectType, targetObjectId)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget)
  }

  const handleCreate = () => {
    setCreate(true)
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
                <ListItem className={classes.cpointer}>
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
                      <h4 className={classes.fontBig}>{friend.name}</h4>
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
                                openInvite('user', friend.id), handleClose(), setInvite('Friends'), handleCreate()
                              }}
                            >
                              <ListItemIcon>
                                <GroupAdd fontSize="small" className={classes.success} />
                              </ListItemIcon>
                              <ListItemText>INVITE</ListItemText>
                            </MenuItem>
                            <MenuItem className={classes.my2}>
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
