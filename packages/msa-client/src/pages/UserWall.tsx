import { useWeb3React } from "@web3-react/core";
import React from "react";
import { Toaster } from "react-hot-toast";
import { useParams } from "react-router-dom";
import { useRecoilValue } from "recoil";
import Spinner from "../components/Spinner";
import { EmptyWallMessage, WallPosts } from "../components/wall";
import { SetUsernameIfNone } from "../components/wall/SetUsername";
import UserInfo from "../components/wall/UserInfo";
import { WritePostIfUsername } from "../components/wall/WritePost";
import { isConnected } from "../eth/connectors";
import { useInternetComputer } from "../ic/context";
import { PrincipalByEthQuery } from "../store/profile";

const Loading = () => {
  return (
    <div className="pt-5 text-center">
      <Spinner />
    </div>
  );
};

export default function Wall() {
  const ic = useInternetComputer();
  const { connector, account } = useWeb3React();

  const userEthAccount = (useParams() as any).urlEthAccount as string;
  const userPrincipal = useRecoilValue(PrincipalByEthQuery(userEthAccount));

  const [loadPause, setLoadPause] = React.useState(true);

  React.useEffect(() => {
    const t = setTimeout(() => {
      setLoadPause(false);
    }, 1000);
    return () => {
      clearTimeout(t);
    };
  }, []);

  const isMyPage = () =>
    account?.toLowerCase() === userEthAccount.toLowerCase();

  return (
    <>
      <Toaster position="bottom-right" reverseOrder={true} />{" "}
      <div className="w-full leading-normal text-white">
        <div className="pt-40 pb-20 bg-right-top bg-no-repeat bg-contain sm:pb-32">
          {!loadPause && (
            <div className="text-xl wall-container">
              {/* SET USERNAME */}
              {isMyPage() && <SetUsernameIfNone />}

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
                  Dfinity
                  to write on the wall!
                </div>
              )}

              {/* USERINFO */}
              {userPrincipal && <UserInfo principal={userPrincipal} />}

              {/* WRITE A POST */}
              {isMyPage() && <WritePostIfUsername />}

              {/* THE WALL! */}
              {userPrincipal && (
                <React.Suspense fallback={<Loading />}>
                  <WallPosts
                    userId={userPrincipal}
                    key={userPrincipal.toString()}
                  />
                </React.Suspense>
              )}

              {/* EMPTY WALL MESSAGE */}
              {userPrincipal && (
                <React.Suspense fallback={null}>
                  <EmptyWallMessage
                    userId={userPrincipal}
                    key={userPrincipal.toString()}
                  />
                </React.Suspense>
              )}
            </div>
          )}
          {/* LOADER */}
          {loadPause && <Loading />}
        </div>
      </div>
    </>
  );
}
