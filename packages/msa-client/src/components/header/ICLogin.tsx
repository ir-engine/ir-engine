import { isConnected } from "../../eth/connectors";
import { createActors } from "../../ic/actor";
import { useInternetComputer } from "../../ic/context";
import {
  generateEd25519KeyIdentity,
  generateLoginMessage,
  saveIdentity as icSaveIdentity,
} from "../../ic/identity";
import { useWeb3React } from "@web3-react/core";
import { utils } from "ethers";
import toast from "react-hot-toast";
import React from "react";

export default function ICLogin() {
  const {
    error: ethError,
    account: ethAccount,
    connector: ethConnector,
    library: ethLibrary,
  } = useWeb3React();

  const { identity: icIdentity, setIdentity: icSetIdentity } =
    useInternetComputer();

  let buttonClass =
    "inline-block px-3 py-2 text-base font-semibold text-green-200 uppercase rounded-lg focus:outline-none " +
    (ethError
      ? "bg-red-700 hover:bg-red-500 text-white"
      : "bg-gradient-to-r from-green-400 to-blue-500 hover:from-green-500 hover:to-blue-600 text-green-900");

  const loginToInternetComputer = async () => {
    // 1. Generate a login message to sign
    // 🔐 Currently doesn't let the user set a personal secret/pasword
    // for added security.
    const loginMessage = generateLoginMessage(ethAccount!, "MUCH SECRET!");

    // 2. Sign the message using Metamask
    const signature: any = await ethLibrary
      .getSigner()
      .signMessage(loginMessage);

    // 3. Generate Ed25519KeyIdentity based on signature
    const identity = generateEd25519KeyIdentity(signature);
    toast.success("Internet Computer Identity generated", { duration: 4000 });

    // 4. Use the new identity when communicating with IC
    icSetIdentity(identity);

    // 5. Save login key to local storage to be reused next time user visits.
    // 🔐 Comment out to increase security and force user to sign login message
    // on each visit.
    icSaveIdentity(ethAccount!, identity);

    // 6. Create actors to interact with IC
    const actors = createActors(identity);

    if (!actors) {
      toast.error("Unable to interact with Dfinity", { duration: 4000 });
    } else {
      // 7. Link current eth address to identity. The login message hash and
      // signature is sent to IC where the address is recovered.
      const loginMessageHash = utils.hashMessage(loginMessage);
      actors.profile.linkAddress(loginMessageHash, signature);
      toast.success("Linked eth address to Identity", { duration: 4000 });
    }
  };

  return (
    <>
      {isConnected(ethConnector) && !ethError && !icIdentity && (
        <button className={buttonClass} onClick={loginToInternetComputer}>
          Login to Dfinity
        </button>
      )}
    </>
  );
}
