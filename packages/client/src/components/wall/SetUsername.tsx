import Spinner from "../Spinner";
import { isConnected } from "../../eth/connectors";
import { Profile } from "../../ic/canisters_generated/profile/profile.did";
import { useInternetComputer } from "../../ic/context";
import { ProfileByPrincipal } from "../../store/profile";
import { useWeb3React } from "@web3-react/core";
import React from "react";
import { useRecoilValue, useSetRecoilState } from "recoil";

export function SetUsername() {
  const { actors, principal } = useInternetComputer();
  const setProfileByPrincipal = useSetRecoilState(
    ProfileByPrincipal({ principal })
  );
  const [name, setName] = React.useState("");
  const [success, setSuccess] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [finished, setFinished] = React.useState(false);

  const handleNameChange = (event: React.FormEvent<HTMLInputElement>) => {
    if (event.currentTarget.value.length > 25) return;
    setName(event.currentTarget.value);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (finished) return;
    if (name.length === 0) return;
    setLoading(true);
    actors.profile
      .setName(name)
      .then((profile: Profile) => {
        setSuccess(true);
        setProfileByPrincipal(profile);
      })
      .catch((error: any) => {
        console.log(error);
        setSuccess(false);
      })
      .finally(() => {
        setLoading(false);
        setFinished(true);
      });
  };

  return (
    <div className="p-5 mb-10 bg-green-700 rounded-lg">
      <div className="mb-1">Set a username before writing on the wall.</div>
      <div>
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row">
          <input
            type="text"
            autoComplete="off"
            className="flex-grow p-4 mr-4 text-xl placeholder-green-400 bg-green-700 border-t-0 border-l-0 border-r-0 border-green-400 sm:mb-0 sm:w-auto disabled:opacity-50 focus:ring-0 focus:border-green-400 px-0.5 focus:text-white"
            placeholder="Username"
            onChange={handleNameChange}
            value={name}
            disabled={loading}
          />
          <button
            className="p-4 px-8 text-xl font-semibold text-green-900 uppercase bg-green-400 rounded-lg hover:bg-yellow-200 disabled:opacity-50"
            type="submit"
            disabled={loading}
          >
            {loading ? (
              <>
                <Spinner />
                Saving
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
    </div>
  );
}

export function SetUsernameIfNone() {
  const { connector, error } = useWeb3React();
  const { principal } = useInternetComputer();

  const SetUsernameIfNoneInner = () => {
    const profile = useRecoilValue(
      ProfileByPrincipal({ principal })
    ) as Profile;
    if (profile?.name.length === 0) return <SetUsername />;
    return null;
  };

  if (isConnected(connector) && !error && principal)
    return (
      <React.Suspense fallback={null}>
        <SetUsernameIfNoneInner />
      </React.Suspense>
    );
  return null;
}
