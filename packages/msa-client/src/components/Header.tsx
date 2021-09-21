import EthAccount from "./header/EthAccount";
import ICLogin from "./header/ICLogin";
import ICPrincipal from "./header/ICPrincipal";
import UserName from "./header/Username";
import { injected } from "../eth/connectors";
import { useEagerConnect, useInactiveListener } from "../eth/hooks";
import { useWeb3React } from "@web3-react/core";
import { InjectedConnector } from "@web3-react/injected-connector";
import React from "react";
import { Link } from "react-router-dom";

export default function Header() {
  const {
    error: ethError,
    connector: ethConnector,
    activate: ethActivate,
  } = useWeb3React();

  // Attempt to activate pre-existing connection
  const triedEager = useEagerConnect();

  // Marks which ethConnector is being activated
  const [activatingConnector, setActivatingConnector] = React.useState<
    InjectedConnector | undefined
  >(undefined);

  const activating = injected === activatingConnector;
  const connected = injected === ethConnector;
  const connectDisabled = !triedEager || activating || connected || !!ethError;

  // Listen to and react to network events
  useInactiveListener(!triedEager || !!activatingConnector);

  // handle logic to recognize the ethConnector currently being activated
  React.useEffect(() => {
    if (activatingConnector && activatingConnector === ethConnector) {
      setActivatingConnector(undefined);
    }
  }, [activatingConnector, ethConnector]);

  let ethButtonClass =
    "inline-block px-3 py-2 text-base font-semibold uppercase rounded-lg focus:outline-none " +
    (ethError
      ? "bg-red-700 hover:bg-red-700 text-white"
      : "bg-gradient-to-r from-green-400 to-blue-500 hover:from-green-500 hover:to-blue-600 text-green-900");

  return (
    <nav>
      <div className="px-2 py-4 mx-auto max-w-7xl sm:px-6 lg:px-8 sm:py-6 lg:py-8">
        <div className="relative flex items-center justify-between">
          <div className="flex items-center justify-center flex-1 sm:items-stretch sm:justify-start">
            <div className="hidden sm:block sm:ml-6 sm:w-full ">
              <div className="flex items-center justify-end h-full">
                <div>
                  <UserName />
                  {triedEager && (!connected || (connected && !!ethError)) && (
                    <button
                      className={ethButtonClass}
                      disabled={connectDisabled || !!ethError || activating}
                      key={"Injected"}
                      onClick={() => {
                        setActivatingConnector(injected);
                        ethActivate(injected, (error) => {
                          if (error.name === "UnsupportedChainIdError")
                            alert("Please connect to Ethereum mainnet");
                          setActivatingConnector(undefined);
                        });
                      }}
                    >
                      {!ethError && activating && <div>Initializing …</div>}
                      {!ethError && !activating && (
                        <div>
                          Metamask
                          Connect to wallet
                        </div>
                      )}
                      {ethError &&
                        ethError.name === "UnsupportedChainIdError" && (
                          <div>Wrong network</div>
                        )}
                      {ethError &&
                        ethError.name !== "UnsupportedChainIdError" && (
                          <div>Unable to connect</div>
                        )}
                    </button>
                  )}
                  <EthAccount />
                  <ICLogin />
                  <ICPrincipal />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
