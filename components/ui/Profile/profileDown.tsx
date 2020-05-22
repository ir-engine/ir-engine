import React from 'react'
import Button from '@material-ui/core/Button'
import ClickAwayListener from '@material-ui/core/ClickAwayListener'
import Grow from '@material-ui/core/Grow'
import Paper from '@material-ui/core/Paper'
import Popper from '@material-ui/core/Popper'
import MenuItem from '@material-ui/core/MenuItem'
import MenuList from '@material-ui/core/MenuList'
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles'
import ProfileModal from './index'
import Router from 'next/router'

import Avatar from '@material-ui/core/Avatar'

interface XProps {
  avatar: any,
  avatarLetter: string
  logoutUser: any,
  auth: any
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      display: 'flex'
    },
    paper: {
      marginRight: theme.spacing(2)
    }
  })
)

const MenuListComposition: React.FC<XProps> = (props: XProps) => {
  const classes = useStyles()
  const [open, setOpen] = React.useState(false)
  const [modalOpen, setModalOpen] = React.useState(false)
  const anchorRef = React.useRef<HTMLButtonElement>(null)

  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen)
  }
  const handleModal = () => {
    setModalOpen(true)
    setOpen(false)
  }
  const handleClose = (event: React.MouseEvent<EventTarget>) => {
    if (
      anchorRef.current &&
      anchorRef.current.contains(event.target as HTMLElement)
    ) {
      return
    }

    setOpen(false)
  }
  const handleLogout = () => {
    props.logoutUser()
    setOpen(false)
  }

  const handleListKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Tab') {
      event.preventDefault()
      setOpen(false)
    }
  }

  const handleContacts = () => {
    Router.push('/friends/friends')
  }
  const handleAdminConsole = () => {
    Router.push('/admin')
  }
  const modalClose = () => {
    setModalOpen(false)
  }
  const prevOpen = React.useRef(open)
  React.useEffect(() => {
    if (prevOpen.current === true && open === false) {
      anchorRef.current!.focus()
    }

    prevOpen.current = open
  }, [open])

  return (
    <div className={classes.root}>
      <div>
        <Button
          ref={anchorRef}
          aria-controls={open ? 'menu-list-grow' : undefined}
          aria-haspopup="true"
          onClick={handleToggle}
        >
          {props.avatar ? (
            <Avatar alt="User Avatar Icon" src={props.avatar} />
          ) : (
            <Avatar alt="User Avatar">X</Avatar>
          )}
        </Button>
        <Popper
          open={open}
          anchorEl={anchorRef.current}
          role={undefined}
          transition
          disablePortal
        >
          {({ TransitionProps, placement }) => (
            <Grow
              {...TransitionProps}
              style={{
                transformOrigin:
                  placement === 'bottom' ? 'center top' : 'center bottom'
              }}
            >
              <Paper>
                <ClickAwayListener onClickAway={handleClose}>
                  <MenuList
                    autoFocusItem={open}
                    id="menu-list-grow"
                    onKeyDown={handleListKeyDown}
                  >
                    <MenuItem onClick={handleModal}>Profile</MenuItem>
                    <MenuItem onClick={handleContacts}>Contacts</MenuItem>
                    {props.auth.get('user').userRole === 'admin' && <MenuItem onClick={handleAdminConsole}>Admin Console</MenuItem> }
                    <MenuItem onClick={handleLogout}>Logout</MenuItem>
                  </MenuList>
                </ClickAwayListener>
              </Paper>
            </Grow>
          )}
        </Popper>
      </div>
      <ProfileModal
        open={modalOpen}
        handleClose={modalClose}
        avatar={props.avatar}
      />
    </div>
  )
}

export default MenuListComposition
