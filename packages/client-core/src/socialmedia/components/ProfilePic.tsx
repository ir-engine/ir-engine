import React from "react";
import { useHistory } from "react-router-dom";
import AccountCircleIcon from '@material-ui/icons/AccountCircle';

export function ProfilePic({
  src,
  username,
  size,
  border,
  href,
  ...props
}: any) {
  const history = useHistory();
  return (
    <span {...props} onClick={() => history.push(`/${username}`)}>
      {src ? <img
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
       /> :
      <AccountCircleIcon fontSize="large"/>}      
    </span>
  );
}
