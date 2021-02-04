import React, { useState } from "react";
import UsernameText from "./username-text";

export default function FeedItemComment({ data }) {
  const [showMore, setShowMore] = useState(data?.description.length < 80);

  return (
    <div className="overflow-hidden mx-4 text-14-light inherit">
      <UsernameText username={data.username} />
      <span className={!showMore ? "feed-item-text-description " : "inherit"}>
        {data?.description ||
          "lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum"}
      </span>
      {!showMore && (
        <span style={{ color: "#9a9a9a" }} onClick={() => setShowMore(true)}>
          {" "}
          more
        </span>
      )}
    </div>
  );
}
