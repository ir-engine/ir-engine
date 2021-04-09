import React from "react";
import { ProfilePic} from "./ProfilePic";

import styles from './Stories.module.scss';

export const StoryItem =({data}: any) => {
  return (
    <div
      className={styles.storyItem}
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
};
