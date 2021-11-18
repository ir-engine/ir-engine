import { Add, Notifications, Search } from '@material-ui/icons'
import { Settings } from '@mui/icons-material'
import { Badge, IconButton, List, Dialog, Avatar, Switch } from '@mui/material'
import queryString from 'querystring'
import { useHistory } from 'react-router-dom'
import { ChatService } from '@xrengine/client-core/src/social/services/ChatService'
import { useFriendState } from '@xrengine/client-core/src/social/services/FriendService'
import { useGroupState } from '@xrengine/client-core/src/social/services/GroupService'
import { usePartyState } from '@xrengine/client-core/src/social/services/PartyService'
import { GroupService } from '@xrengine/client-core/src/social/services/GroupService'
import { FriendService } from '@xrengine/client-core/src/social/services/FriendService'
import { useAuthState } from '@xrengine/client-core/src/user/services/AuthService'
import * as React from 'react'
import InviteHarmony from '../InviteHarmony'
import { useHarmonyStyles } from '../style'
import InviteModel from '../InviteModel'
import GroupMembers from '../Group/GroupMember'
import CreateGroup from './CreateGroup'
import { PartyService } from '@xrengine/client-core/src/social/services/PartyService'
import ModeContext from '../context/modeContext'
import Party from '../party'
import FriendList from './FriendList'

interface Props {
  setShowChat: any
}

const LeftHarmony = (props: Props) => {
  const { setShowChat } = props

  const classes = useHarmonyStyles()
  const { darkMode, setDarkMode } = React.useContext(ModeContext)
  const [checked, setChecked] = React.useState(true)

  const persed = queryString.parse(location.search)
  const history = useHistory()
  const [show, setShow] = React.useState(false)
  const [create, setCreate] = React.useState(false)
  const [chat, setChat] = React.useState(persed['?channel'] ? persed['?channel'] : 'party')
  const [invite, setInvite] = React.useState('')
  const [anchorEl, setAnchorEl] = React.useState(null)
  const [showNot, setShowNot] = React.useState(false)
  const [tabIndex, setTabIndex] = React.useState(0)
  const [openDrawer, setOpen] = React.useState(false)

  React.useEffect(() => {
    if (!persed['?channel']) {
      history.push({
        pathname: '/harmony',
        search: '?channel=party'
      })
    }
  })

  const channelTypeChangeHandler = (type: string) => {
    setChat(type)
    history.push({
      pathname: '/harmony',
      search: `?channel=${type}`
    })
  }

  // Current User
  const selfUser = useAuthState().user.value

  //friend state
  const friendState = useFriendState()
  const friendSubState = friendState.friends

  //group state
  const groupState = useGroupState()
  const groupSubState = groupState.groups

  //party state
  const party = usePartyState().party?.value

  const handleChange = (event) => {
    setDarkMode(!darkMode)
    setChecked(event.target.checked)
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

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget)
  }

  const createNewParty = (): void => {
    PartyService.createParty()
  }

  const handleCloseDrawer = () => {
    setOpen(false)
  }

  const nextFriendsPage = (): void => {
    if (friendSubState.skip.value + friendSubState.limit.value < friendSubState.total.value) {
      FriendService.getFriends('', friendSubState.skip.value + friendSubState.limit.value)
    }
  }

  const nextGroupsPage = (): void => {
    if (groupSubState.skip.value + groupSubState.limit.value < groupSubState.total.value) {
      GroupService.getGroups(groupSubState.skip.value + groupSubState.limit.value)
    }
  }

  const onListScroll = (e): void => {
    if (e.target.scrollHeight - e.target.scrollTop === e.target.clientHeight) {
      if (tabIndex === 0) {
        nextFriendsPage()
      } else if (tabIndex === 1) {
        nextGroupsPage()
      }
    }
  }

  const setActiveChat = (channelType, target): void => {
    ChatService.updateMessageScrollInit(true)
    ChatService.updateChatTarget(channelType, target)
  }

  return (
    <>
      <div className={`${classes.dFlex} ${classes.flexColumn} ${classes.justifyContentBetween} ${classes.h100}`}>
        <div>
          <div className={`${classes.dFlex} ${classes.justifyContentBetween}`}>
            <h4 className={darkMode ? classes.white : classes.textBlack}>Chats</h4>
            <div className={`${classes.dFlex} ${classes.alignCenter}`}>
              <IconButton color="primary" component="span" onClick={handleClickOpen}>
                <Badge color="secondary" variant={showNot ? 'dot' : ''}>
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
              onClick={() => {
                channelTypeChangeHandler('party')
                setShowChat(false)
                setActiveChat('party', null)
              }}
              className={`${chat === 'party' ? classes.bgPrimary : darkMode ? classes.border : classes.borderLight} ${
                classes.roundedCircle
              } ${classes.mx2}`}
            >
              <span>Party</span>
            </a>
            <a
              href="#"
              onClick={() => {
                channelTypeChangeHandler('friends')
                setShowChat(false)
                setActiveChat('friends', null)
              }}
              className={`${chat === 'friends' ? classes.bgPrimary : darkMode ? classes.border : classes.borderLight} ${
                classes.roundedCircle
              } ${classes.mx2}`}
            >
              <span>Friends</span>
            </a>
            <a
              href="#"
              onClick={() => {
                channelTypeChangeHandler('group')
                setShowChat(false)
                setActiveChat('group', null)
              }}
              className={`${chat === 'group' ? classes.bgPrimary : darkMode ? classes.border : classes.borderLight} ${
                classes.roundedCircle
              } ${classes.mx2}`}
            >
              <span>Group</span>
            </a>
            <a
              href="#"
              onClick={() => {
                channelTypeChangeHandler('layer')
                setShowChat(false)
                setActiveChat('layer', null)
              }}
              className={`${chat === 'layer' ? classes.bgPrimary : darkMode ? classes.border : classes.borderLight} ${
                classes.roundedCircle
              } ${classes.mx2}`}
            >
              <span>Layer</span>
            </a>
            <a
              href="#"
              onClick={() => {
                channelTypeChangeHandler('instance')
                setShowChat(false)
                setActiveChat('instance', null)
              }}
              className={`${
                chat === 'instance' ? classes.bgPrimary : darkMode ? classes.border : classes.borderLight
              } ${classes.roundedCircle} ${classes.mx2}`}
            >
              <span>Instance</span>
            </a>
          </div>
          {chat !== 'friends' ? (
            ''
          ) : (
            <>
              <div className={classes.center}>
                <a
                  href="#"
                  className={`${classes.my2} ${classes.btn} ${darkMode ? classes.btnDark : classes.whiteBg}`}
                  onClick={handleCreate}
                >
                  INVITE FRIENDS
                </a>
              </div>
              <List onScroll={(e) => onListScroll(e)}>
                <FriendList setShowChat={setShowChat} />
              </List>
            </>
          )}

          {chat !== 'party' ? (
            ''
          ) : (
            <>
              <div className={classes.center}>
                <a
                  href="#"
                  className={`${classes.my2} ${classes.btn} ${darkMode ? classes.btnDark : classes.whiteBg}`}
                  onClick={() => createNewParty()}
                >
                  <b>CREATE PARTY</b>
                </a>
              </div>
              {party && party.length > 0 && (
                <Party
                  party={party}
                  setActiveChat={setActiveChat}
                  setShowChat={setShowChat}
                  handleClick={handleClick}
                />
              )}
            </>
          )}
          {chat !== 'group' ? (
            ''
          ) : (
            <>
              <CreateGroup setShowChat={setShowChat} />
            </>
          )}
        </div>
        <div
          className={`${classes.dFlex} ${classes.justifyContentBetween} ${
            darkMode ? classes.darkBg : classes.whiteBg
          } ${classes.mx2}`}
        >
          <div className={`${classes.dFlex} ${classes.box}`}>
            <Avatar src={selfUser.avatarUrl} />
            <div className={classes.mx2}>
              <h4 className={`${classes.fontBig} ${darkMode && classes.white}`}>{selfUser.name}</h4>
              <small className={`${classes.textMuted} ${darkMode && classes.white}`}>You're: </small>
              <small className={`${classes.textMuted} ${darkMode && classes.white}`}>{selfUser.userRole}</small>
            </div>
          </div>
          <div className={`${classes.dFlex} ${classes.alignCenter}`}>
            <Switch checked={checked} onChange={handleChange} inputProps={{ 'aria-label': 'controlled' }} />
            <IconButton aria-label="upload picture" component="span">
              <Settings className={darkMode && classes.white} />
            </IconButton>
          </div>
        </div>
      </div>
      <Dialog
        fullWidth={true}
        maxWidth={'md'}
        open={create}
        onClose={() => {
          handleCloseCreate(), setInvite('')
        }}
      >
        <InviteModel invite={invite} />
      </Dialog>
      <InviteHarmony setShowNot={setShowNot} show={show} setShow={setShow} />
      <GroupMembers openDrawer={openDrawer} handleCloseDrawer={handleCloseDrawer} />
      {/* <CreateGroup openCreateDrawer={openCreateDrawer} handleCloseCreateDrawer={handleCloseCreateDrawer} /> */}
    </>
  )
}

export default LeftHarmony
