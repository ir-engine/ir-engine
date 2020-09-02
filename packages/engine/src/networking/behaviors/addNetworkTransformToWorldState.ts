import { Behavior } from '../../common/interfaces/Behavior';
import { TransformComponent } from '../../transform/components/TransformComponent';
import { getComponent } from '../../ecs/functions/EntityFunctions';
import { Network } from '../components/Network';
import { NetworkObject } from '../components/NetworkObject';

export const addNetworkTransformToWorldState: Behavior = (entity) => {
    const transformComponent = getComponent(entity, TransformComponent)
    const networkObject = getComponent(entity, NetworkObject)

    Network.instance.worldState.transforms.push({
        networkId: networkObject.networkId,
        x: transformComponent.position.x,
        y: transformComponent.position.y,
        z: transformComponent.position.z,
        q: {
            x: transformComponent.rotation.x,
            y: transformComponent.rotation.y,
            z: transformComponent.rotation.z,
            w: transformComponent.rotation.w
        }
    })
};
