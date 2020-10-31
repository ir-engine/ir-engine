import { DataConsumer, DataProducer } from 'mediasoup-client/lib/types';
import isNullOrUndefined from '../../common/functions/isNullOrUndefined';
import { addComponent, getComponent, hasComponent, removeEntity } from '../../ecs/functions/EntityFunctions';
import { TransformComponent } from '../../transform/components/TransformComponent';
import { Network } from '../components/Network';
import { NetworkObject } from '../components/NetworkObject';
import { createNetworkPrefab } from './createNetworkPrefab';
import { initializeNetworkObject } from './initializeNetworkObject';

export const handleClientConnected = (args: { id: any; name: any, socket: any; media: any }) => {

};
