import React from "react";
import Router from "next/router";

export default function UsernameText({ username, ...props }) {
  return (
    <a
      className="text-14-bold mr-1 cursor-pointer"
      onClick={() => Router.push("/[pid]", `/${username}`)}
      {...props}
    >
      {username || "username"}
    </a>
  );
}
