import { Engine } from "../ecs/classes/Engine";
import { EngineEvents } from "../ecs/classes/EngineEvents";
import { System } from "../ecs/classes/System";
import { Network } from "../networking/classes/Network";

export const setupBotHooks = (): void => {
  // expose all our interfaces for local dev for the bot tests
  globalThis.Engine = Engine;
  globalThis.EngineEvents = EngineEvents;
  globalThis.Network = Network;
  Engine.activeSystems.getAll().forEach((system: System) => {
    globalThis[system.name] = system.constructor;
  })
}