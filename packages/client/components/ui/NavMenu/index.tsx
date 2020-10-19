import React from 'react';
import NavUserWidget from '../NavUserWidget';
import AppBar from '@material-ui/core/AppBar';
import './style.module.scss';

export const NavMenu = (): any => {
  return (
    <AppBar className="appbar">
      <NavUserWidget />
    </AppBar>
  );
};

export default NavMenu;
