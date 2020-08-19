import { System } from '../../ecs/classes/System';
import { Network } from '../components/Network';
import { NetworkClient } from '../components/NetworkClient';
import { NetworkObject } from '../components/NetworkObject';
import { DefaultNetworkSchema } from '../defaults/DefaultNetworkSchema';
import { NetworkSchema } from '../interfaces/NetworkSchema';
import { NetworkGameState } from '../components/NetworkInterpolation';
import { createEntity, addComponent } from '../../ecs/functions/EntityFunctions';
import { Entity } from '../../ecs';

export class NetworkSystem extends System {
  init (schema?: NetworkSchema) {
    // Create a Network entity (singleton)
    const networkEntity = createEntity('network');
    addComponent(networkEntity, Network);

    // Late initialization of network
      Network.instance.schema = schema ?? DefaultNetworkSchema;
      Network.instance.transport = new (Network.instance.schema.transport)();
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
      console.log(entity)
    })
  }
}
