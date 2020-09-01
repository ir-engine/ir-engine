import { Behavior } from '../../common/interfaces/Behavior';
import { TransformComponent } from '../../transform/components/TransformComponent';
import { getComponent } from '../../ecs/functions/EntityFunctions';
import { Network } from '../components/Network';

export const addNetworkTransformToWorldState: Behavior = (entity) => {
    const transformComponent = getComponent(entity, TransformComponent)
    Network.instance.worldState.transforms.push({
        position: {
            x: transformComponent.position.x,
            y: transformComponent.position.y,
            z: transformComponent.position.z,
        },
        rotation: {
                x: transformComponent.rotation.x,
                y: transformComponent.rotation.y,
                z: transformComponent.rotation.z,
                w: transformComponent.rotation.w
        }
    })
};
