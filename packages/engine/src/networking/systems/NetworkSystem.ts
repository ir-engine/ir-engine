import { Entity } from '../../ecs/classes/Entity';
import { System } from '../../ecs/classes/System';
import { addComponent, createEntity } from '../../ecs/functions/EntityFunctions';
import { Network } from '../components/Network';
import { NetworkClient } from '../components/NetworkClient';
import { NetworkObject } from '../components/NetworkObject';
import { createFixedTimestep } from '../../common/functions/Timer';
import { TransformComponent } from '../../transform/components/TransformComponent';
import { State } from '../../state/components/State';
import { Input } from '../../input/components/Input';
import { LocalInputReceiver } from '../../input/components/LocalInputReceiver';
import { sendClientInput as sendClientInput } from '../behaviors/sendClientInput';
import { NetworkInterpolation } from '../components/NetworkInterpolation';
import { CreateSnapshot } from '../functions/NetworkInterpolationFunctions';
import { addComponentDeltasWorldState } from '../behaviors/addComponentDeltasWorldState';
import { addNetworkTransformToWorldState } from './addNetworkTransformToWorldState';
import { handleIncomingMessages } from './handleIncomingMessages';
import { prepareWorldState } from './prepareWorldState';
import { sendOutgoingMessages } from './sendOutgoingMessages';

export class NetworkSystem extends System {
  public static instance: NetworkSystem = null

  fixedExecute:(delta:number)=>void = null

  constructor() {
    super()
    // TODO: Move network timestep to config
    this.fixedExecute = createFixedTimestep(30, this.onFixedExecute.bind(this))
  }

  connectToServer(ip: string, port: number){
    Network.instance.transport.initialize(ip, port);
    Network.instance.isInitialized = true;
  }

  init (attributes) {
    NetworkSystem.instance = this

    const { schema } = attributes
    // Create a Network entity (singleton)
    const networkEntity = createEntity();
    addComponent(networkEntity, Network);
    addComponent(networkEntity, NetworkInterpolation);
    // Late initialization of network
    Network.instance.schema = schema;
    Network.instance.transport = new (schema.transport)();
    console.log('TRANSPORT INSTANCE:')
    console.log(Network.instance.transport)

    console.log(`SERVER_MODE: ${process.env.SERVER_MODE}`);

    if (process.env.SERVER_MODE != undefined && process.env.SERVER_MODE !== 'client') {
      Network.instance.transport.initialize();
    }
    console.log("NetworkSystem ready, run connectToServer to... connect to the server!")
  }

  execute(delta):void {
    if(!Network.instance.isInitialized) return
    this.fixedExecute(delta)
  }

  onFixedExecute(delta) {
    // CLIENT only
    if(!Network.instance.transport.isServer)
    {
    this.queryResults.networkInputSender.all?.forEach((entity: Entity) => {
      sendClientInput(entity)
    })
  }

    // Handle incoming messages
    this.queryResults.network.all?.forEach((entity: Entity) => {
      handleIncomingMessages(entity)
    })
 
    // Server-only
    if(Network.instance.transport.isServer){
      prepareWorldState()
      
      // this.queryResults.networkObjects.all?.forEach((entity: Entity) => {
      //   addComponentDeltasWorldState(entity)
      // })

      this.queryResults.networkTransforms.all?.forEach((entity: Entity) => {
        addNetworkTransformToWorldState(entity)
      })
      
      const snapshot = CreateSnapshot(Network.instance.worldState)
      NetworkInterpolation.instance.add(snapshot)
    }

      // Send all queued messages
      this.queryResults.network.all?.forEach((entity: Entity) => {
        sendOutgoingMessages(entity)
      })
  }

  static queries: any = {
    network: {
      components: [Network]
    },
    networkInterpolation: {
      components: [NetworkInterpolation]
    },
    networkObjects: {
      components: [NetworkObject]
    },
    networkInput: {
      components: [NetworkObject, Input]
    },
    networkInputSender: {
      components: [NetworkObject, Input, LocalInputReceiver]
    },
    networkStates: {
      components: [NetworkObject, State]
    },
    networkTransforms: {
      components: [NetworkObject, TransformComponent]
    },
    networkOwners: {
      components: [NetworkClient]
    }
  }

}

