import React from 'react';
import AppBar from '@material-ui/core/AppBar';
import styles from './UserMenu.module.scss';
import { IconButton, Menu } from '@material-ui/core';
import { MenuItem } from 'react-contextmenu';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import { setAppRestartOnBoardingStep } from '../../../redux/app/actions';
import store from '../../../redux/store';

interface Props {
    login?: boolean;
}

export const UserMenu = (props: Props): any => {
  const { login } = props;
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleTutorialClick = () =>{
    setAnchorEl(null);
    store.dispatch(setAppRestartOnBoardingStep());
  }
  return (
    <AppBar className={styles.appbar}>
      <IconButton
        aria-label="more"
        aria-controls="long-menu"
        aria-haspopup="true"
        onClick={handleClick}
      >
        <MoreVertIcon />
      </IconButton>
      <Menu
        id="simple-menu"
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        <MenuItem onClick={handleClose}>Change Name</MenuItem>
        <MenuItem onClick={handleClose}>Change avatar</MenuItem>
        <MenuItem onClick={handleClose}>Share with a friend</MenuItem>
        <MenuItem onClick={handleTutorialClick}>Tutorial</MenuItem>
      </Menu>
    </AppBar>
  );
};

export default UserMenu;
