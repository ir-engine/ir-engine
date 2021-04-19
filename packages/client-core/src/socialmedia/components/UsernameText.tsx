import React from "react";
import { useHistory } from "react-router-dom";

export function UsernameText({
  username,
  ...props
}: any) {
  const history = useHistory();
  return (
    <a
      className="text-14-bold mr-1 cursor-pointer"
      onClick={() => history.push(`/${username}`)}
      {...props}
    >
      {username || "username"}
    </a>
  );
}
