import Spinner from "../Spinner";
import { isConnected } from "../../eth/connectors";
import { Profile } from "../../ic/canisters_generated/profile/profile.did";
import { useInternetComputer } from "../../ic/context";
import { ProfileByPrincipal } from "../../store/profile";
import { WallRefreshTimestamp } from "../../store/wall";
import { useWeb3React } from "@web3-react/core";
import React from "react";
import { useRecoilValue, useSetRecoilState } from "recoil";

export function WritePost() {
  const { actors } = useInternetComputer();

  const [post, setPost] = React.useState("");
  const [success, setSuccess] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [finished, setFinished] = React.useState(false);

  const setWallRefreshTimestamp = useSetRecoilState(WallRefreshTimestamp);

  const handlePostChange = (event: React.FormEvent<HTMLInputElement>) => {
    if (event.currentTarget.value.length > 255) return;
    setPost(event.currentTarget.value);
  };

  const resetForm = () => {
    setPost("");
    setSuccess(false);
    setLoading(false);
    setFinished(false);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (finished) return;
    if (post.length === 0) return;
    setLoading(true);
    actors.wall
      .write(post)
      .then(() => {
        setWallRefreshTimestamp(Date.now());
        setSuccess(true);
      })
      .catch((error: any) => {
        console.error(error);
        setSuccess(false);
      })
      .finally(() => {
        resetForm();
      });
  };

  return (
    <div className="mb-10">
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row">
        <input
          type="text"
          autoComplete="off"
          className="flex-grow p-4 mr-4 text-xl placeholder-green-400 bg-green-900 border-t-0 border-l-0 border-r-0 border-green-400 sm:mb-0 sm:w-auto disabled:opacity-50 focus:ring-0 focus:border-green-400 px-0.5 focus:text-green-100"
          placeholder="Write on the wall"
          disabled={loading}
          onChange={handlePostChange}
          value={post}
        />
        <button
          className="p-4 px-8 text-xl font-semibold text-green-900 uppercase bg-green-400 rounded-lg hover:bg-yellow-200 disabled:opacity-50"
          type="submit"
          disabled={loading}
        >
          {loading ? (
            <>
              <Spinner />
              Writing
            </>
          ) : finished ? (
            success ? (
              "👍👍👍"
            ) : (
              <span className="text-red-500">🤖 Error</span>
            )
          ) : (
            "Save"
          )}
        </button>
      </form>
    </div>
  );
}

export function WritePostIfUsername() {
  const { connector, error } = useWeb3React();
  const { principal } = useInternetComputer();

  const WritePostIfUsernameInner = () => {
    const profile = useRecoilValue(
      ProfileByPrincipal({ principal })
    ) as Profile;
    if (profile?.name.length > 0) return <WritePost />;
    return null;
  };

  if (isConnected(connector) && !error && principal)
    return (
      <React.Suspense fallback={null}>
        <WritePostIfUsernameInner />
      </React.Suspense>
    );
  return null;
}
