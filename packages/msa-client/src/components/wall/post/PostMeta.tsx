import { Post } from "../../../ic/canisters_generated/wall/wall.did";
import { ProfileByPrincipal } from "../../../store/profile";
import { Principal } from "@dfinity/principal";
import { Jazzicon } from "@ukstv/jazzicon-react";
import formatDistance from "date-fns/formatDistance";
import React from "react";
import { Link } from "react-router-dom";
import { useRecoilValue } from "recoil";

interface Props {
  data: Post;
}

export const PostMeta = ({ data }: Props) => {
  const PostMetaInner = ({ data }: Props) => {
    const profile = useRecoilValue(
      ProfileByPrincipal({ principal: Principal.fromText(data.user_id) })
    );

    if (profile) {
      const timestamp = parseInt(data.timestamp.toString().substr(0, 13));
      const fromNow = formatDistance(timestamp, Date.now());

      return (
        <div className="text-sm text-green-500">
          User
          <Link to={profile.address.toLowerCase()}>{profile.name}</Link>
          <div className="inline-block mr-1">, {fromNow} ago</div>
          <Link to={profile.address.toLowerCase()}>
            <div
              style={{ width: "12px", height: "12px" }}
              className="inline-block ml-3 mr-1"
            >
              <Jazzicon address={profile.address} />
            </div>
            {profile.address.substring(0, 6)}...
            {profile.address.substring(profile.address.length - 4)} {" "}
          </Link>
        </div>
      );
    }

    return null;
  };

  return (
    <React.Suspense fallback={null}>
      <PostMetaInner data={data} />
    </React.Suspense>
  );
};

export default PostMeta;
