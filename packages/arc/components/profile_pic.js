import React from "react";
import Router from "next/router";

export default function ProfilePic({
  src,
  username,
  size,
  border,
  href,
  ...props
}) {
  return (
    <span {...props} onClick={() => Router.push("/[pid]", `/${username}`)}>
      <img
        alt={`${username}'s profile pic`}
        data-testid="user-avatar"
        draggable="false"
        src={src}
        style={{
          width: size,
          height: size,
          borderRadius: size,
          border: border && "2px solid white",
          cursor: "pointer",
        }}
      ></img>
    </span>
  );
}
