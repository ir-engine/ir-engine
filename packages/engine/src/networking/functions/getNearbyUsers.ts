import {Network} from "../classes/Network";
import {NetworkObject} from "../components/NetworkObject";
import {getComponent} from "../../ecs/functions/EntityFunctions";
import {Object3DComponent} from "../../scene/components/Object3DComponent";


export default function(userId: string, maxMediaUsers= 8): Object3DComponent[] {
    const otherAvatars = [];
    let userAvatar;
    const clientIds = Object.keys(Network.instance.clients);
    for (const [, object]: [id: string, object: NetworkObject] of Object.entries(Network.instance.networkObjects)) {
        if (object.uniqueId === userId) userAvatar = object;
        else if (clientIds.includes(object.uniqueId)) otherAvatars.push(object);
    }
    if (userAvatar != null) {
        const userComponent = getComponent(userAvatar.component.entity, Object3DComponent);
        const userPosition = userComponent.value.position;
        if (userPosition != null) {
            const userDistances = [];
            otherAvatars.forEach(avatar => {
                const component = getComponent(avatar.component.entity, Object3DComponent);
                const position = component?.value?.position;
                if (position != null) userDistances.push({
                    id: avatar.uniqueId,
                    distance: Math.sqrt((position.x - userPosition.x) ** 2 + (position.y - userPosition.y) ** 2 + (position.z - userPosition.z) ** 2)
                });
            });
            return userDistances.sort((a, b) => a.distance - b.distance).slice(0, maxMediaUsers);
        }
    } else return [];
}