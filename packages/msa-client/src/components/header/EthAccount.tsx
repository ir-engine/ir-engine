import { isConnected } from "../../eth/connectors";
import { Jazzicon } from "@ukstv/jazzicon-react";
import { useWeb3React } from "@web3-react/core";
import { Link } from "react-router-dom";

export default function EthAccount() {
  const { connector, account } = useWeb3React();

  if (isConnected(connector) && account)
    return (
      <Link to={account.toLowerCase()}>
        <div className="inline-block px-3 py-2 mr-4 text-base font-semibold text-white uppercase bg-green-700 rounded-lg">
          <div
            style={{ width: "15px", height: "15px" }}
            className="inline-block mr-2"
          >
            <Jazzicon address={account} />
          </div>
          {account.substring(0, 6)}...
          {account.substring(account.length - 4)} {" "}
        </div>
      </Link>
    );

  return null;
}
