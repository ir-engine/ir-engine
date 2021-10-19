import Spinner from "../Spinner";
import { Post as PostInterface } from "../../ic/canisters_generated/wall/wall.did";
import { WallPageQuery, WallRefreshTimestamp } from "../../store/wall";
import { Principal } from "@dfinity/principal";
import React from "react";
import { useBottomScrollListener } from "react-bottom-scroll-listener";
import { useRecoilValue, useRecoilValueLoadable } from "recoil";
import Post from "./post";

interface Props {
  userId?: Principal;
}

const Loading = () => {
  return (
    <div className="pt-5 text-center">
      <Spinner />
    </div>
  );
};

export const WallPosts = ({ userId }: Props) => {
  const [hasMorePosts, setHasMorePosts] = React.useState(true);

  const [pageNumber, setPageNumber] = React.useState(1);
  const nextPage = () => {
    hasMorePosts && setPageNumber((n) => n + 1);
  };
  useBottomScrollListener(nextPage, { debounce: 2000 });

  const [wall, setWall] = React.useState<Array<PostInterface>>([]);
  const wallRefreshTimestamp = useRecoilValue(WallRefreshTimestamp);
  React.useEffect(() => {
    setWall([]);
    setPageNumber(1);
    setHasMorePosts(true);
  }, [wallRefreshTimestamp]);

  const wallLoadable = useRecoilValueLoadable(
    WallPageQuery({ pageNumber, userId, wallRefreshTimestamp })
  );

  React.useEffect(() => {
    if (wallLoadable.state === "hasValue") {
      const wl = wallLoadable.contents as Array<PostInterface>;
      if (wl.length > 0) {
        setWall((w) => [...w, ...wl]);
      } else {
        setHasMorePosts(false);
      }
    }
  }, [wallLoadable]);

  return (
    <>
      {wall.map((post) => (
        <Post key={post.id.toString()} data={post} />
      ))}
      {wallLoadable.state === "loading" && <Loading />}
    </>
  );
};

export const EmptyWallMessage = ({ userId }: Props) => {
  const wallRefreshTimestamp = useRecoilValue(WallRefreshTimestamp);

  const wall = useRecoilValue(
    WallPageQuery({ pageNumber: 1, userId, wallRefreshTimestamp })
  ) as Array<PostInterface>;
  if (wall && wall.length === 0)
    return (
      <div className="p-5 mb-4 text-center bg-green-800 rounded-lg">
        The wall is empty, start filling it!
      </div>
    );
  return null;
};
