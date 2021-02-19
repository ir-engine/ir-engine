import React from "react";
import Router from "next/router";

import { LoginUserHook } from "../GlobalHook";
import { ProfilePic } from "../ProfilePic";

import styles from './Header.module.scss';
import Avatar from "@material-ui/core/Avatar";

const AppHeader = ({user, logo}: any) => {
  const { data, setLoginUser } = LoginUserHook();

  return (
    <nav className={styles.headerContainer}>
        {/* <SearchBar /> */}
          <img onClick={()=>Router.push('/')} src={logo} className="header-logo" alt="ARC" />
          {/* <Clickable href="/">{home}</Clickable> */}
          {/* <Clickable href="/messages">{messages}</Clickable>
          <Clickable href="/explore">{explore}</Clickable>
          <Clickable href="/activity">{activity}</Clickable> */}
          {user && (
            <Avatar src={'https://picsum.photos/40/40'} />
          )}
    </nav>
  );
}

export default AppHeader;