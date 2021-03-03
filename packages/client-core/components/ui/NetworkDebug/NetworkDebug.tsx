import { Engine } from "@xr3ngine/engine/src/ecs/classes/Engine";
import { DebugHelpersSystem } from "@xr3ngine/engine/src/debug/systems/DebugHelpersSystem";
import { Network } from "@xr3ngine/engine/src/networking/classes/Network";
import React, { useEffect, useRef, useState } from "react";
import JSONTree from 'react-json-tree';
import { EngineEvents } from "@xr3ngine/engine/src/ecs/classes/EngineEvents";

export const NetworkDebug = () => {
  const [isShowing, setShowing] = useState(false);
  const [physicsDebug, setPhysicsDebug] = useState(false);
  const [avatarDebug, setAvatarDebug] = useState(false);

  const showingStateRef = useRef(isShowing);

  function setupListener() {
    window.addEventListener('keydown', downHandler);

  }

  // If pressed key is our target key then set to true
  function downHandler({ keyCode }) {
    if (keyCode === 192) { // `
      showingStateRef.current = !showingStateRef.current;
      setShowing(showingStateRef.current);
    }
  }

  // Add event listeners
  useEffect(() => {
    setupListener();
  }, []); // Empty array ensures that effect is only run on mount and unmount

  const [remountCount, setRemountCount] = useState(0);
  const refresh = () => setRemountCount(remountCount + 1);
  const togglePhysicsDebug = () => { 
    EngineEvents.instance.dispatchEvent({ type: DebugHelpersSystem.EVENTS.TOGGLE_PHYSICS, enabled: !physicsDebug })
    setPhysicsDebug(!physicsDebug);
  };

  const toggleAvatarDebug = () => { 
    EngineEvents.instance.dispatchEvent({ type: DebugHelpersSystem.EVENTS.TOGGLE_AVATAR, enabled: !avatarDebug })
    setAvatarDebug(!avatarDebug);
  };

  if (Network.instance !== null && isShowing) return (
    <div style={{ position: "absolute", overflowY: "auto", top: 0, zIndex: 100000, height: "auto", maxHeight: "95%", width: "auto", maxWidth: "50%" }}>
      <button type="submit" value="Refresh" onClick={refresh}>Refresh</button>
      <button type="button" value="Physics Debug" onClick={togglePhysicsDebug}>Physics Debug</button>
      <button type="button" value="Avatar Debug" onClick={toggleAvatarDebug}>Avatar Debug</button>
      <div>
        <div>
          <h1>Network Object</h1>
          <JSONTree data={{ ...Network.instance }} />
        </div>
        <div>
          <h1>Network Clients</h1>
          <JSONTree data={{ ...Network.instance.clients }} />
        </div>
        <div>
          <h1>Network Objects</h1>
          <JSONTree data={{ ...Network.instance.networkObjects }} />
        </div>
        <div>
          <h1>Engine Entities</h1>
          <JSONTree data={{ ...Engine.entities }} />
        </div>
      </div>
    </div>
  );
  else return null;
};

export default NetworkDebug;