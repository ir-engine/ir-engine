import React, { KeyboardEvent, MouseEvent, useRef, useState, useEffect } from 'react'
import Button from '@material-ui/core/Button'
import ClickAwayListener from '@material-ui/core/ClickAwayListener'
import Grow from '@material-ui/core/Grow'
import Paper from '@material-ui/core/Paper'
import Popper from '@material-ui/core/Popper'
import MenuItem from '@material-ui/core/MenuItem'
import MenuList from '@material-ui/core/MenuList'
import ProfileModal from './index'
import { useHistory } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import Avatar from '@material-ui/core/Avatar'
import SupervisedUserCircleIcon from '@material-ui/icons/SupervisedUserCircle'
import { useAuthState } from '../../state/AuthService'
interface Props {
  avatarUrl: any
  logoutUser: any
  auth: any
}

const MenuListComposition = (props: Props): any => {
  const history = useHistory()
  const { avatarUrl, logoutUser, auth } = props
  const [open, setOpen] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const anchorRef = useRef<HTMLButtonElement>(null)
  const { t } = useTranslation()
  const user = useAuthState().user
  const handleToggle = (): any => {
    setOpen((prevOpen) => !prevOpen)
  }
  const handleModal = (): any => {
    setModalOpen(true)
    setOpen(false)
  }
  const handleClose = (event: MouseEvent<EventTarget>): any => {
    if (anchorRef.current && anchorRef.current.contains(event.target as HTMLElement)) {
      return
    }

    setOpen(false)
  }
  const handleLogout = (): any => {
    logoutUser()
    setOpen(false)
  }

  const handleListKeyDown = (event: KeyboardEvent): any => {
    if (event.key === 'Tab') {
      event.preventDefault()
      setOpen(false)
    }
  }

  // const handleContacts = () => {
  //   history.push('/friends/friends')
  // }
  const handleAdminConsole = (): any => {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    history.push('/admin')
  }
  const modalClose = (): any => {
    setModalOpen(false)
  }
  const prevOpen = useRef(open)
  useEffect(() => {
    if (prevOpen.current && !open) {
      anchorRef.current.focus()
    }

    prevOpen.current = open
  }, [open])

  return (
    <div>
      <div>
        <Button
          ref={anchorRef}
          aria-controls={open ? 'menu-list-grow' : undefined}
          aria-haspopup="true"
          onClick={handleToggle}
        >
          {avatarUrl ? (
            <Avatar alt={t('user:profile.profileDropdown.avatar')} src={avatarUrl} />
          ) : (
            <SupervisedUserCircleIcon style={{ fontSize: 45, color: 'white' }} />
          )}
        </Button>
        <Popper open={open} anchorEl={anchorRef.current} role={undefined} transition disablePortal>
          {({ TransitionProps, placement }) => (
            <Grow
              {...TransitionProps}
              style={{
                transformOrigin: placement === 'bottom' ? 'center top' : 'center bottom'
              }}
            >
              <Paper>
                <ClickAwayListener onClickAway={handleClose}>
                  <MenuList autoFocusItem={open} id="menu-list-grow" onKeyDown={handleListKeyDown}>
                    <MenuItem onClick={handleModal}>{t('user:profile.profileDropdown.profile')}</MenuItem>
                    {/* <MenuItem onClick={handleContacts}>Contacts</MenuItem> */}
                    {user.userRole.value === 'admin' && (
                      <MenuItem onClick={handleAdminConsole}>{t('user:profile.profileDropdown.adminConsole')}</MenuItem>
                    )}
                    <MenuItem onClick={handleLogout}>{t('user:profile.profileDropdown.logout')}</MenuItem>
                  </MenuList>
                </ClickAwayListener>
              </Paper>
            </Grow>
          )}
        </Popper>
      </div>
      <ProfileModal open={modalOpen} handleClose={modalClose} avatarUrl={avatarUrl} auth={auth} />
    </div>
  )
}

export default MenuListComposition
