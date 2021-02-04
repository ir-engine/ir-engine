import React, { useLayoutEffect } from "react";
import { useRouter } from "next/router";

import SearchBar from "./search_bar";
import HomeIcon from "./icons/home_icon";
import DmIcon from "./icons/dm_icon";
import ExploreIcon from "./icons/explore_icon";
import ActivityIcon from "./icons/activity_icon";
import HomeIconActive from "./icons/home_icon_active";
import DmIconActive from "./icons/dm_icon_active";
import ExploreIconActive from "./icons/explore_icon_active";
import ActivityIconActive from "./icons/activity_icon_active";
import ProfilePic from "./profile_pic";
import Clickable from "./clickable";

import LoginUserHook from "../hooks/global_hook";

export default function Header({ user }) {
  const router = useRouter();

  // set icons
  const home =
    router.pathname === "/" ? (
      <HomeIconActive className="header-icon" />
    ) : (
      <HomeIcon className="header-icon" />
    );
  const messages =
    router.pathname === "/messages" ? (
      <DmIconActive className="header-icon" />
    ) : (
      <DmIcon className="header-icon" />
    );
  const explore =
    router.pathname === "/explore" ? (
      <ExploreIconActive className="header-icon" />
    ) : (
      <ExploreIcon className="header-icon" />
    );
  const activity =
    router.pathname === "/activity" ? (
      <ActivityIconActive className="header-icon" />
    ) : (
      <ActivityIcon className="header-icon" />
    );

  const { data, setLoginUser } = LoginUserHook();
  const loginUserData = data;

  return (
    <nav className="navigation fixed z-20 top-0">
      <div className="header-container">
        <Clickable href="/">
          <img src="../static/images/logo.png" className="header-logo" />
        </Clickable>
        <SearchBar />
        <div className="header-icons flex ml-auto items-center">
          <Clickable href="/">{home}</Clickable>
          <Clickable href="/messages">{messages}</Clickable>
          <Clickable href="/explore">{explore}</Clickable>
          <Clickable href="/activity">{activity}</Clickable>
          {user && (
            <ProfilePic
              className={
                loginUserData.username === user
                  ? "header-profile-pic-border"
                  : ""
              }
              src={loginUserData?.image}
              username={loginUserData?.username}
              style={{
                padding: loginUserData.username === user ? "2px" : "3px",
                marginLeft: "-2px",
              }}
              size={22}
            />
          )}
        </div>
      </div>
    </nav>
  );
}
