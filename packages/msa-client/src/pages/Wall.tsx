import { useWeb3React } from "@web3-react/core";
import React from "react";
import { Toaster } from "react-hot-toast";
import Spinner from "../components/Spinner";
import { EmptyWallMessage, WallPosts } from "../components/wall";
import { SetUsernameIfNone } from "../components/wall/SetUsername";
import { WritePostIfUsername } from "../components/wall/WritePost";
import { isConnected } from "../eth/connectors";
import { useInternetComputer } from "../ic/context";

const Loading = () => {
  return (
    <div className="pt-5 text-center">
      <Spinner />
    </div>
  );
};

export default function Wall() {
  const ic = useInternetComputer();
  const { connector } = useWeb3React();

  const [loadPause, setLoadPause] = React.useState(true);

  React.useEffect(() => {
    const t = setTimeout(() => {
      setLoadPause(false);
    }, 1000);
    return () => {
      clearTimeout(t);
    };
  }, []);

  return (
    <>
      <Toaster position="bottom-right" reverseOrder={true} />{" "}
      <div className="w-full leading-normal text-white">
        <div className="pt-40 pb-20 bg-right-top bg-no-repeat bg-contain sm:pb-32">
          {!loadPause && (
            <div className="text-xl wall-container">
              {/* SET USERNAME */}
              <SetUsernameIfNone />

              {/* CONNECT METAMASK */}
              {connector && ic.principal && !isConnected(connector) && (
                <div className="mb-10 text-3xl text-center">
                  Connect
                  Metamask
                  and login to
                  Dfinity
                  to write on the wall!
                </div>
              )}

              {/* LOGIN TO DFINITY */}
              {connector && !ic.principal && isConnected(connector) && (
                <div className="mb-10 text-3xl text-center">
                  Login to
                  Dfinity to write on the wall!
                </div>
              )}

              {/* WRITE A POST */}
              <WritePostIfUsername />

              {/* THE WALL! */}
              <React.Suspense fallback={<Loading />}>
                <WallPosts />
              </React.Suspense>

              {/* EMPTY WALL MESSAGE */}
              <React.Suspense fallback={null}>
                <EmptyWallMessage />
              </React.Suspense>
            </div>
          )}
          {/* LOADER */}
          {loadPause && <Loading />}
        </div>
      </div>
    </>
  );
}
