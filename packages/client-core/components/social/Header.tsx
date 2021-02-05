import { useRouter } from "next/router";
import React from "react";
import { Clickable } from "./Clickable";
import { LoginUserHook } from "./GlobalHook";
import { ActivityIcon } from "./icons/ActivityIcon";
import { ActivityIconActive } from "./icons/ActivityIcon_active";
import { DMIcon } from "./icons/DMIcon";
import { DMIconActive } from "./icons/DMIcon_active";
import { ExploreIcon } from "./icons/ExploreIcon";
import { ExploreIconActive } from "./icons/ExploreIcon_active";
import { HomeIcon } from "./icons/HomeIcon";
import { HomeIconActive } from "./icons/HomeIcon_active";
import { ProfilePic } from "./ProfilePic";

export function Header({
  user
}: any) {
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
      <DMIconActive className="header-icon" />
    ) : (
      <DMIcon className="header-icon" />
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

  return (
    <nav className="navigation fixed z-20 top-0">
      <div className="header-container">
        <Clickable href="/">
          <img src="../static/images/logo.png" className="header-logo" />
        </Clickable>
        {/* <SearchBar /> */}
        <div className="header-icons flex ml-auto items-center">
          <Clickable href="/">{home}</Clickable>
          <Clickable href="/messages">{messages}</Clickable>
          <Clickable href="/explore">{explore}</Clickable>
          <Clickable href="/activity">{activity}</Clickable>
          {user && (
            <ProfilePic
              className={
                data?.username === user
                  ? "header-profile-pic-border"
                  : ""
              }
              src={data?.image ?? null}
              username={data?.username  ?? null}
              style={{
                padding: data?.username === user ? "2px" : "3px",
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
