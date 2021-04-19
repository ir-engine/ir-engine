import React from "react";
import Avatar from "@material-ui/core/Avatar";

// @ts-ignore
import styles from './Stories.module.scss';

export const StoryItem =({data}: any) => {
  const size = 56;
  return (
    <div
      className={styles.storyItem}
    >
      <div className="story-photo-container">
        <Avatar
          alt={`${data?.username}'s profile pic`}
          data-testid="user-avatar"
          draggable="false"
          src={data?.image}
          style={{
            width: size,
            height: size,
            borderRadius: size,
            border: "2px solid white",
            cursor: "pointer",
          }}
        />      
      </div>
    </div>
  );
};
