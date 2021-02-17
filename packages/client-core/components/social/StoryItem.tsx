import React from "react";
import { ProfilePic} from "./ProfilePic";
import { UsernameText } from "./UsernameText";
import Router from "next/router";

import styles from './styles/Stories.module.scss';

export function StoryItem({
  data
}: any) {
  return (
    <div
      className={styles.storyItem}
      onClick={() => Router.push("/[pid]", `/${data?.username || "username"}`)}
    >
      <div className="story-photo-container">
        <ProfilePic
          src={data?.image || "https://picsum.photos/seed/picsum/200/200"}
          username={data?.username}
          size={56}
          border
        ></ProfilePic>
      </div>
      <UsernameText
        username={data?.username || "username"}
        className="story-username text-black text-12-light mt-1"
      />
    </div>
  );
}
