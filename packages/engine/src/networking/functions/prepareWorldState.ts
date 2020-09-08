import { Network } from "../components/Network";

export const prepareWorldState = () => {
  console.log("Preparing world state")
    // Set up a new frame for snapshot interpolation
    Network.instance.worldState = {
      tick: Network.tick,
      transforms: [],
      inputs: [],
      clientsConnected: [],
      clientsDisconnected: [],
      createObjects: [],
      destroyObjects: []
      }
};
