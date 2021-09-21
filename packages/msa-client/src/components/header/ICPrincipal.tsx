import { useWeb3React } from "@web3-react/core";
import { isConnected } from "../../eth/connectors";
import { useInternetComputer } from "../../ic/context";

export default function ICPrincipal() {
  const { connector, error } = useWeb3React();
  const { principal } = useInternetComputer();

  if (isConnected(connector) && !error && principal)
    return (
      <div className="inline-block px-3 py-2 text-base font-semibold text-white uppercase bg-green-700 rounded-lg">
        Dfinity
        {principal.toString().substring(0, 12)}...{" "}
      </div>
    );

  return null;
}
