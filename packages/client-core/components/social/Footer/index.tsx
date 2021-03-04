import React from "react";
import Router from "next/router";

import AddCircleIcon from '@material-ui/icons/AddCircle';
import HomeIcon from '@material-ui/icons/Home';

import styles from './Footer.module.scss';
import Avatar from "@material-ui/core/Avatar";

const AppFooter = ({user}: any) => {
  return (
    <nav className={styles.footerContainer}>
        <HomeIcon onClick={()=>Router.push('/')} fontSize="large" className={styles.footerItem}/>
        <AddCircleIcon onClick={()=>Router.push('/newfeed')} style={{fontSize: '5em'}} className={styles.footerItem}/>
        {/* <AddCircleIcon onClick={()=>Router.push('/videorecord')} style={{fontSize: '5em'}} className={styles.footerItem}/> */}
        {user && (
          <Avatar onClick={()=>Router.push({ pathname: '/creator', query:{ me: 'me'}})} src={'https://picsum.photos/40/40'} />
        )}
    </nav>
  );
}

export default AppFooter;

