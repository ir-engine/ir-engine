import { addObject3DComponent } from "@xr3ngine/engine/src/scene/behaviors/addObject3DComponent";
import { BoxBufferGeometry, Color, Mesh, MeshPhongMaterial } from "three";
import { NetworkPrefab } from '../../../networking/interfaces/NetworkPrefab';
import { ColliderComponent } from '../../../physics/components/ColliderComponent';
import { RigidBody } from '../../../physics/components/RigidBody';
import { TransformComponent } from '../../../transform/components/TransformComponent';

const boxGeometry = new BoxBufferGeometry(1, 1, 1);
const boxMaterial = new MeshPhongMaterial({ color: new Color(0.813410553336143494, 0.81341053336143494, 0.80206481294706464) });
const boxMesh = new Mesh(boxGeometry, boxMaterial);
boxMesh.name = 'simpleBox';
// Prefab is a pattern for creating an entity and component collection as a prototype
export const NetworkVehicle: NetworkPrefab = {
  // These will be created for all players on the network
  networkComponents: [
    // Transform system applies values from transform component to three.js object (position, rotation, etc)
    { type: TransformComponent },
    { type: ColliderComponent, data: { type: 'box', scale: { x: 1, y: 1, z: 1 }, mass: 1}},
    { type: RigidBody }
    // Local player input mapped to behaviors in the input map
  ],
  // These are only created for the local player who owns this prefab
  localClientComponents: [],
  serverComponents: [],
  onAfterCreate: [
    {
      behavior: addObject3DComponent,
      args: {
          obj3d: boxMesh
      }
  }],
  onBeforeDestroy: []
};
