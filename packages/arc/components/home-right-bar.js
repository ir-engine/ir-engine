import React from "react";
import ProfilePic from "./profile_pic";
import RightBarSuggestions from "./right-bar-suggestions";
import UsernameText from "./username-text";
import LoginUserHook from "../hooks/global_hook";

export default function HomeRightBar({ data }) {
  const loginUserData = LoginUserHook().data;

  return (
    <div className="suggestions hidden lg:flex lg:flex-col">
      {data && (
        <>
          <div className="right-bar-user-info flex items-center">
            <ProfilePic
              src={loginUserData.image}
              size={56}
              username={loginUserData.username}
            />
            <div className="user-info-texts ml-5 flex flex-col">
              <UsernameText
                style={{ paddingBottom: 2, paddingTop: 2 }}
                username={loginUserData.username}
              />
              <span className="text-12-light">
                {loginUserData.name || "Name Surname"}
              </span>
            </div>
          </div>
          <RightBarSuggestions data={data} />
        </>
      )}
    </div>
  );
}
