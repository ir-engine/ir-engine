import { Engine } from "@xr3ngine/engine/src/ecs/classes/Engine";
import { Network } from "@xr3ngine/engine/src/networking/components/Network";
import React, { useLayoutEffect, useReducer, useState } from "react";
import JSONTree from 'react-json-tree';

export const NetworkDebug = () => {
    const [networkData, setNetworkData] = useState({});
    const [isShowing, setShowing] = useState(false);

    const [, forceUpdate] = useReducer(x => x + 1, 0);
    const [remountCount, setRemountCount] = useState(0);
    const refresh = () => setRemountCount(remountCount + 1);
 
  useLayoutEffect(() => {
    let numberOfClients = Network.instance != null ? Object.keys(Network.instance.clients).length : 0;
    const numberOfNetworkObjects = Network.instance != null ? Object.keys(Network.instance.networkObjects).length : 0;
    const interval = setInterval(() => {
        if( Network.instance != null &&
            (Object.keys(Network.instance.clients).length !== numberOfClients ||
            Object.keys(Network.instance.networkObjects).length !== numberOfNetworkObjects)
        ) {
            setNetworkData({...Network.instance});
            forceUpdate();
            refresh();
        }
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const toggleShowing = () => {
    setShowing(!isShowing);
    forceUpdate();
    refresh();
  };

      if(Network.instance !== null)
      return (
        <div style={{ position: "absolute", overflowY: "auto", top: 0, zIndex: 100000, height: "auto", maxHeight: "100vh", width: "auto", maxWidth: "50%" }}>
            <button type="submit" value="toggleShowing" onClick={ toggleShowing }>{ isShowing ? "Hide" : "Show" }</button>
            { isShowing &&
            <div>
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
                <div>
              <h1>Engine Entities</h1>
                <JSONTree data={{...Engine.entities}} />
              </div>
              <button type="submit" value="Refresh" onClick={ refresh }>Refresh</button>
              </div>
            }
        </div>
      );
      return <div>Awaiting network connection...</div>; 
};

export default NetworkDebug;