import React, { KeyboardEvent, MouseEvent, useRef, useState, useEffect } from 'react';
import Button from '@material-ui/core/Button';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import Grow from '@material-ui/core/Grow';
import Paper from '@material-ui/core/Paper';
import Popper from '@material-ui/core/Popper';
import MenuItem from '@material-ui/core/MenuItem';
import MenuList from '@material-ui/core/MenuList';
import ProfileModal from './index';
import Router from 'next/router';

import Avatar from '@material-ui/core/Avatar';
import SupervisedUserCircleIcon from '@material-ui/icons/SupervisedUserCircle';

interface Props {
  avatarUrl: any;
  logoutUser: any;
  auth: any;
}

const MenuListComposition = (props: Props): any => {
  const { avatarUrl, logoutUser, auth } = props;
  const [open, setOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const anchorRef = useRef<HTMLButtonElement>(null);

  const handleToggle = (): any => {
    setOpen((prevOpen) => !prevOpen);
  };
  const handleModal = (): any => {
    setModalOpen(true);
    setOpen(false);
  };
  const handleClose = (event: MouseEvent<EventTarget>): any => {
    if (
      anchorRef.current &&
      anchorRef.current.contains(event.target as HTMLElement)
    ) {
      return;
    }

    setOpen(false);
  };
  const handleLogout = (): any => {
    logoutUser();
    setOpen(false);
  };

  const handleListKeyDown = (event: KeyboardEvent): any => {
    if (event.key === 'Tab') {
      event.preventDefault();
      setOpen(false);
    }
  };

  // const handleContacts = () => {
  //   Router.push('/friends/friends')
  // }
  const handleAdminConsole = (): any => {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    Router.push('/admin');
  };
  const modalClose = (): any => {
    setModalOpen(false);
  };
  const prevOpen = useRef(open);
  useEffect(() => {
    if (prevOpen.current && !open) {
      anchorRef.current.focus();
    }

    prevOpen.current = open;
  }, [open]);

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
            <Avatar alt="User Avatar Icon" src={avatarUrl} />
          ) : (
            <SupervisedUserCircleIcon style={{ fontSize: 45, color: 'white' }} />
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
                    {/* <MenuItem onClick={handleContacts}>Contacts</MenuItem> */}
                    {auth.get('user').userRole === 'admin' && <MenuItem onClick={handleAdminConsole}>Admin Console</MenuItem> }
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
        avatarUrl={avatarUrl}
        auth={auth}
      />
    </div>
  );
};

export default MenuListComposition;
