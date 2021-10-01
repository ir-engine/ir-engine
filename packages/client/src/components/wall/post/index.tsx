import { Post as PostInterface } from "../../../ic/canisters_generated/wall/wall.did";
import { memo } from "react";
import PostMeta from "./PostMeta";

interface Props {
  data: PostInterface;
}

export const Post = memo(({ data }: Props) => {
  return (
    <div className="mb-5 text-center">
      <div className="p-5 mb-2 overflow-hidden text-white bg-green-800 rounded-lg">
          {data.text}
      </div>
      <PostMeta data={data} />
    </div>
  );
});

export default Post;
