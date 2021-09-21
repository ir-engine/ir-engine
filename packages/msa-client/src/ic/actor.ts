import * as Profile from "../ic/canisters_generated/profile";
import * as Wall from "../ic/canisters_generated/wall";
import {
  Actor,
  ActorConfig,
  HttpAgent,
  HttpAgentOptions,
  Identity,
} from "@dfinity/agent";

export const createActor = (
  canisterId: string,
  options: {
    agentOptions?: HttpAgentOptions | undefined;
    actorOptions?: ActorConfig | undefined;
  },
  idlFactory: any
) => {
  const agent = new HttpAgent({ ...options?.agentOptions });
  // Fetch root key for certificate validation during development

  if (process.env.NODE_ENV !== "production") {
    agent.fetchRootKey().catch((err) => {
      console.warn(
        "Unable to fetch root key. Check to ensure that your local replica is running"
      );
      console.error(err);
    });
  }

  // Creates an actor with using the candid interface and the HttpAgent
  return Actor.createActor(idlFactory, {
    agent,
    canisterId,
    ...options?.actorOptions,
  });
};

function _createActors(options: {
  agentOptions?: HttpAgentOptions | undefined;
  actorOptions?: ActorConfig | undefined;
}) {
  if (
    !process.env.REACT_APP_PROFILE_CANISTER_ID ||
    !process.env.REACT_APP_WALL_CANISTER_ID
  ) {
    console.error("Canister ID environment variables not set");
    return null;
  }

  return {
    profile: createActor(
      process.env.REACT_APP_PROFILE_CANISTER_ID,
      options,
      Profile.idlFactory
    ),
    wall: createActor(
      process.env.REACT_APP_WALL_CANISTER_ID,
      options,
      Wall.idlFactory
    ),
  };
}

export function createActors(identity: Identity) {
  return _createActors({
    agentOptions: {
      host: process.env.REACT_APP_IC_HOST,
      identity,
    },
  });
}

export function createAnonymousActors() {
  if (!process.env.REACT_APP_IC_HOST) {
    console.error("Environment variable REACT_APP_IC_HOST not set");
    return null;
  }

  return _createActors({
    agentOptions: {
      host: process.env.REACT_APP_IC_HOST,
    },
  });
}
