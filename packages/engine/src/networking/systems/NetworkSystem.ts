import { Entity } from '../../ecs/classes/Entity';
import { System } from '../../ecs/classes/System';
import { addComponent, createEntity } from '../../ecs/functions/EntityFunctions';
import { Network } from '../components/Network';
import { NetworkClient } from '../components/NetworkClient';
import { NetworkObject } from '../components/NetworkObject';
import { DefaultNetworkSchema } from '../defaults/DefaultNetworkSchema';
import { NetworkSchema } from '../interfaces/NetworkSchema';

export class NetworkSystem extends System {
  init (attributes) {

console.log("NetworkSystem schema: ")

    const { schema } = attributes
    // Create a Network entity (singleton)
    const networkEntity = createEntity();
    addComponent(networkEntity, Network);

    // Late initialization of network
      Network.instance.schema = schema
      console.log("Transport: " + Network.instance.schema.transport)
      console.log("Schema transport: ", schema.transport)
      Network.instance.transport = new (schema.transport)();
      Network.instance.transport.initialize();
      Network.instance.isInitialized = true;
      console.log("Network inited")
  }

  public static instance: NetworkSystem = null

  static queries: any = {
    network: {
      components: [Network]
    },
    networkObject: {
      components: [NetworkObject]
    },
    networkOwners: {
      components: [NetworkClient]
    }
  }

  public execute (): void {
    this.queryResults.network.all?.forEach((entity: Entity) => {
      // console.log(entity)
    })
  }
}
