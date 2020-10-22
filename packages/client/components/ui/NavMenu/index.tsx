import React from 'react';
import NavUserWidget from '../NavUserWidget';
import AppBar from '@material-ui/core/AppBar';
import styles from './NavMenu.module.scss';

export const NavMenu = (): any => {
  return (
    <AppBar className={styles.appbar}>
      <NavUserWidget />
    </AppBar>
  );
};

export default NavMenu;
