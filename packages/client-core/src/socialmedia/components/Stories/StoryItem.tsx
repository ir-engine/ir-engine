import React from "react";
import { ProfilePic} from "./ProfilePic";
// import Router from "next/router";

import styles from './Stories.module.scss';

export const StoryItem =({data}: any) => {
  return (
    <div
      className={styles.storyItem}
      // onClick={() => Router.push("/[pid]", `/${data?.username || "username"}`)}
    >
      <div className="story-photo-container">
        <ProfilePic
          src={data?.image || "https://picsum.photos/seed/picsum/200/200"}
          username={data?.username}
          size={56}
          border
         />
      </div>
    </div>
  );
}
