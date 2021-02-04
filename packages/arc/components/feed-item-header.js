import React from "react";
import ProfilePic from "./profile_pic";
import MoreSettings from "./icons/more_icon";
import UsernameText from "./username-text";

export default function FeedItemHeader({ moreClickEvent, username, image }) {
  return (
    <div className="feed-item-header pl-4 pr-4 bg-white flex items-center">
      <ProfilePic src={image} size={32} username={username} />
      <UsernameText
        className="feed-item-header-text text-14-bold mr-1 ml-4 cursor-pointer"
        username={username || "username"}
      />
      <button className="ml-auto flex">
        <MoreSettings onClick={moreClickEvent} />
      </button>
    </div>
  );
}
