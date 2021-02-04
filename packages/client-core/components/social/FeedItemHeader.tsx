import React from "react";
import ProfilePic from "./ProfilePic";
import MoreSettings from "./icons/MoreIcon";
import UsernameText from "./UsernameText";

export default function FeedItemHeader({
  moreClickEvent,
  username,
  image
}: any) {
  return (
    <div className="FeedItemHeader pl-4 pr-4 bg-white flex items-center">
      <ProfilePic src={image} size={32} username={username} />
      <UsernameText
        className="FeedItemHeader-text text-14-bold mr-1 ml-4 cursor-pointer"
        username={username || "username"}
      />
      <button className="ml-auto flex">
        <MoreSettings onClick={moreClickEvent} />
      </button>
    </div>
  );
}
