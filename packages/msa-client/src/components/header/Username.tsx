import { isConnected } from "../../eth/connectors";
import { Profile } from "../../ic/canisters_generated/profile/profile.did";
import { useInternetComputer } from "../../ic/context";
import { ProfileByPrincipal } from "../../store/profile";
import { useWeb3React } from "@web3-react/core";
import React from "react";
import { Link } from "react-router-dom";
import { useRecoilValue } from "recoil";

export default function Username() {
  const { connector, error } = useWeb3React();
  const { principal } = useInternetComputer();

  const UsernameInner = () => {
    const profileResult = useRecoilValue(
      ProfileByPrincipal({ principal })
    ) as Profile;
    if (profileResult?.name.length > 0)
      return (
        <Link to={profileResult.address}>
          <div className="inline-block px-3 py-2 mr-4 text-base font-semibold text-white uppercase bg-green-700 rounded-lg">
            User
            {profileResult.name}
          </div>
        </Link>
      );
    return null;
  };

  if (isConnected(connector) && !error && principal)
    return (
      <React.Suspense fallback={null}>
        <UsernameInner />
      </React.Suspense>
    );

  return null;
}
