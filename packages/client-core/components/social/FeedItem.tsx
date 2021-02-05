import React from "react";
import { Box } from "./Box";
import { FeedItemHeader} from "./FeedItemHeader";
import { FeedItemButtons} from "./FeedItemButtons";
import { FeedItemComment} from "./FeedItemComment";
import { AddComment} from "./AddComment";
import { FeedItemPhotos} from "./FeedItemPhotos";
import Router from "next/router";
import { ModalStateHook } from "./ModalHook";

export function FeedItem({ data }) {
  const { hideModal, setModal } = ModalStateHook();

  const moreClickEvent = () => {
    setModal(true, data);
  };
  return (
    <Box className="feed-item-container flex flex-col">
      <FeedItemHeader
        image={data.user.image}
        username={data.user.username}
        data={data}
        moreClickEvent={moreClickEvent}
      />
      <FeedItemPhotos photos={data.photos} />
      <FeedItemButtons className="FeedItemButtons-container w-full h-10 pl-2 pr-2 mt-2 flex items-center" />
      <a href="#" className="feed-item-text text-14-bold mr-1 ml-4">
        {data?.likeCount || "0"} likes
      </a>
      <FeedItemComment
        data={{ username: data.user.username, description: data.description }}
      />
      <a
        className="overflow-hidden mx-4 text-14-light cursor-pointer"
        style={{ color: "#9a9a9a", display: "flex" }}
        onClick={() =>
          Router.push("/post/[pid]", `/post/${data?.pid || "post-test"}`)
        }
      >
        View all {data?.commentCount || "0"} comment
      </a>
      {data.popularComments.map((item: any) => {
        return (
          <FeedItemComment
            key={item.username}
            data={{ username: item.username, description: item.description }}
          />
        );
      })}
      <a
        className="feed-item-date-text cursor-pointer uppercase"
        onClick={() =>
          Router.push("/post/[pid]", `/post/${data?.pid || "post-test"}`)
        }
      >
        {data.time}
      </a>
      <AddComment />
    </Box>
  );
}
