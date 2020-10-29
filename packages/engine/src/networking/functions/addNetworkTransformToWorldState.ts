import { Behavior } from '../../common/interfaces/Behavior';
import { getComponent } from '../../ecs/functions/EntityFunctions';
import { TransformComponent } from '../../transform/components/TransformComponent';
import { Network } from '../components/Network';
import { NetworkObject } from '../components/NetworkObject';

export const addNetworkTransformToWorldState: Behavior = (entity) => {
    const transformComponent = getComponent(entity, TransformComponent);
    const networkObject = getComponent(entity, NetworkObject);

    Network.instance.worldState.transforms.push({
        networkId: networkObject.networkId,
        x: transformComponent.position.x,
        y: transformComponent.position.y,
        z: transformComponent.position.z,
        qX: transformComponent.rotation.x,
        qY: transformComponent.rotation.y,
        qZ: transformComponent.rotation.z,
        qW: transformComponent.rotation.w
    });
};
