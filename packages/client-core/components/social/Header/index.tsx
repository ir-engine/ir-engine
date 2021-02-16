import React from "react";
import Router from "next/router";
import { LoginUserHook } from "../GlobalHook";
// import { ActivityIcon } from "../icons/ActivityIcon";
// import { ActivityIconActive } from "../icons/ActivityIcon_active";
// import { DMIcon } from "../icons/DMIcon";
// import { DMIconActive } from "../icons/DMIcon_active";
// import { ExploreIcon } from "../icons/ExploreIcon";
// import { ExploreIconActive } from "../icons/ExploreIcon_active";
// import { HomeIcon } from "../icons/HomeIcon";
// import { HomeIconActive } from "../icons/HomeIcon_active";
import { ProfilePic } from "../ProfilePic";

import styles from './Header.module.scss';

export function Header({user, logo}: any) {
  // const router = useRouter();

  // set icons
  // const home =
  //   router.pathname === "/" ? (
  //     <HomeIconActive className="header-icon" />
  //   ) : (
  //     <HomeIcon className="header-icon" />
  //   );
  // const messages =
  //   router.pathname === "/messages" ? (
  //     <DMIconActive className="header-icon" />
  //   ) : (
  //     <DMIcon className="header-icon" />
  //   );
  // const explore =
  //   router.pathname === "/explore" ? (
  //     <ExploreIconActive className="header-icon" />
  //   ) : (
  //     <ExploreIcon className="header-icon" />
  //   );
  // const activity =
  //   router.pathname === "/activity" ? (
  //     <ActivityIconActive className="header-icon" />
  //   ) : (
  //     <ActivityIcon className="header-icon" />
  //   );

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
            <ProfilePic              
              src={data?.image ?? null}
              username={data?.username  ?? null}
              style={{
                padding: data?.username === user ? "2px" : "3px",
                marginLeft: "-2px",
              }}
              size={22}
            />
          )}
    </nav>
  );
}
