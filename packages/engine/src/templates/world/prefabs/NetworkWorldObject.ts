import { addObject3DComponent } from "@xr3ngine/engine/src/scene/behaviors/addObject3DComponent";
import { BoxBufferGeometry, Color, Mesh, MeshPhongMaterial } from "three";
import { isClient } from "@xr3ngine/engine/src/common/functions/isClient";
import { NetworkPrefab } from '../../../networking/interfaces/NetworkPrefab';
import { ColliderComponent } from '../../../physics/components/ColliderComponent';
import { RigidBody } from '../../../physics/components/RigidBody';
import { TransformComponent } from '../../../transform/components/TransformComponent';


// Prefab is a pattern for creating an entity and component collection as a prototype
export const NetworkWorldObject: NetworkPrefab = {
  // These will be created for all players on the network
  networkComponents: [
    // Transform system applies values from transform component to three.js object (position, rotation, etc)
    { type: TransformComponent }
    // Local player input mapped to behaviors in the input map
  ],
  // These are only created for the local player who owns this prefab
  localClientComponents: [],
  serverComponents: [],
  onAfterCreate: [],
  onBeforeDestroy: []
};
