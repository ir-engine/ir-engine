import React from 'react';
import NavUserWidget from '../NavUserWidget';
import AppBar from '@material-ui/core/AppBar';
import Router from 'next/router';
import './style.scss';

export const NavMenu = (): any => {
  const homeNav = (): void => {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    Router.push('/');
  };
  return (
    <AppBar className="appbar">
      <NavUserWidget />
    </AppBar>
  );
};

export default NavMenu;
