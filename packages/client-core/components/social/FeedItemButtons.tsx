import React from "react";
import { ActivityIcon } from "./icons/ActivityIcon";
import { CommentIcon } from "./icons/CommentIcon";
import { DMIcon } from "./icons/DMIcon";
import { SaveIcon } from "./icons/SaveIcon";
import { Clickable } from "./Clickable";

export function FeedItemButtons({ ...props }) {
  return (
    <div {...props}>
      <Clickable className="FeedItemButtons m-2">
        <ActivityIcon height={24} width={24} size={24} />
      </Clickable>
      <Clickable className="FeedItemButtons m-2">
        <CommentIcon height={24} width={24} />
      </Clickable>
      <Clickable className="FeedItemButtons m-2">
        <DMIcon height={24} width={24} />
      </Clickable>
      <Clickable className="FeedItemButtons m-2 ml-auto">
        <SaveIcon height={24} width={24} />
      </Clickable>
    </div>
  );
}
