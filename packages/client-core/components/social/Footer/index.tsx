import React from "react";
import Router from "next/router";

import { LoginUserHook } from "../GlobalHook";
import { ProfilePic } from "../ProfilePic";
import AddCircleIcon from '@material-ui/icons/AddCircle';
import HomeIcon from '@material-ui/icons/Home';

import styles from './Footer.module.scss';

const AppFooter = ({user}: any) => {
  const { data, setLoginUser } = LoginUserHook();

  return (
    <nav className={styles.footerContainer}>
        <HomeIcon onClick={()=>Router.push('/')} fontSize="large" className={styles.footerItem}/>
        <AddCircleIcon onClick={()=>Router.push('/videorecord')} style={{fontSize: '5em'}} className={styles.footerItem}/>
        {user && (
          <ProfilePic
            className={styles.footerItem}
            src={data?.image ?? null}
            username={data?.username  ?? null}              
            fontSize="large"
          />
        )}
    </nav>
  );
}

export default AppFooter;

