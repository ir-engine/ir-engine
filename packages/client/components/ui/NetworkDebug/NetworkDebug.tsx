import { Network } from "@xr3ngine/engine/src/networking/components/Network";
import { setDropState } from "@xr3ngine/engine/src/templates/character/behaviors/setDropState";
import React, { useReducer, useLayoutEffect, useState } from "react";
import JSONTree from 'react-json-tree';

export const NetworkDebug = () => {
    const [networkData, setNetworkData] = useState({});
    const [, forceUpdate] = useReducer(x => x + 1, 0);
    const [remountCount, setRemountCount] = useState(0);
    const refresh = () => setRemountCount(remountCount + 1);

  useLayoutEffect(() => {
    let numberOfClients = Network.instance != null ? Object.keys(Network.instance.clients).length : 0;
    const numberOfNetworkObjects = Network.instance != null ? Object.keys(Network.instance.networkObjects).length : 0;
    const interval = setInterval(() => {
        console.log("Checking state");
        if( Network.instance != null &&
            Object.keys(Network.instance.clients).length !== numberOfClients ||
            Object.keys(Network.instance.networkObjects).length !== numberOfNetworkObjects
        ) {
            console.log("Setting network data")
            setNetworkData({...Network.instance});
            forceUpdate();
            refresh();
        }
    }, 1000);
    return () => clearInterval(interval);
  }, []);

      if(Network.instance !== null)
      return (
        <div style={{ position: "absolute" }}>
            <div>
              <h1>Network Object</h1>
              <JSONTree data={{...Network.instance}} />
              </div>
              <div>
              <h1>Network Clients</h1>
              <JSONTree data={{...Network.instance.clients}} />
              </div>
              <div>
              <h1>Network Objects</h1>
              <JSONTree data={{...Network.instance.networkObjects}} />
              </div>
        </div>
      );
      return <div>Awaiting network connection...</div>; 
};

export default NetworkDebug;