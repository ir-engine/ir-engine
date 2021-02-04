import React from "react";
import ActivityIcon from "./icons/activity_icon";
import CommentIcon from "./icons/comment_icon";
import DmIcon from "./icons/dm_icon";
import SaveIcon from "./icons/save_icon";
import Clickable from "./clickable";

export default function FeedItemButtons({ ...props }) {
  return (
    <div {...props}>
      <Clickable className="feed-item-buttons m-2">
        <ActivityIcon height={24} width={24} size={24} />
      </Clickable>
      <Clickable className="feed-item-buttons m-2">
        <CommentIcon height={24} width={24} />
      </Clickable>
      <Clickable className="feed-item-buttons m-2">
        <DmIcon height={24} width={24} />
      </Clickable>
      <Clickable className="feed-item-buttons m-2 ml-auto">
        <SaveIcon height={24} width={24} />
      </Clickable>
    </div>
  );
}
