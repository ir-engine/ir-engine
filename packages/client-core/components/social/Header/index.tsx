import React from "react";
import Router from "next/router";

import styles from './Header.module.scss';
import Avatar from "@material-ui/core/Avatar";

const AppHeader = ({user, logo}: any) => {

  return (
    <nav className={styles.headerContainer}>
          <img onClick={()=>Router.push('/')} src={logo} className="header-logo" alt="ARC" />          
          {user && (
            <Avatar onClick={()=>Router.push({ pathname: '/creator', query:{ me: 'me'}})} src={'https://picsum.photos/40/40'} />
          )}
    </nav>
  );
}

export default AppHeader;