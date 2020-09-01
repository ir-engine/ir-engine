// Transform schema
// State schema

import { now } from "../../common/functions/now";
import { Engine } from "../../ecs/classes/Engine";
import { Network } from "../components/Network"

export const prepareWorldState = () => {
    // Set up a new frame for snapshot interpolation
    Network.instance.worldState = {
        time: now(),
        tick: Network.tick,
        states: [
        ],
        transforms: [
        ]
      }
};
