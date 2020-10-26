import { Network } from "../components/Network";

export const prepareWorldState = () => {
    // Set up a new frame for snapshot interpolation
    Network.instance.worldState = {
      tick: Network.tick,
      transforms: [],
      inputs: [],
      clientsConnected: [],
      clientsDisconnected: [],
      createObjects: [],
      destroyObjects: []
      };
};
