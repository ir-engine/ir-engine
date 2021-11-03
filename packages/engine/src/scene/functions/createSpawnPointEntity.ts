import { ComponentNames } from "../../common/constants/ComponentNames";
import { EntityComponentDataType, EntityCreateFunctionType } from "../../common/constants/Object3DClassMap";
import { Entity } from "../../ecs/classes/Entity";
import { addComponent } from "../../ecs/functions/ComponentFunctions";
import { NameComponent, NameData } from "../components/NameComponent";
import { Object3DComponent, Object3DData } from "../components/Object3DComponent";
import { TransformComponent, TransformData } from "../../transform/components/TransformComponent";
import { Vector3, Quaternion, Euler, Object3D } from "three";
import { VisibleComponent, VisibleData } from "../components/VisibleComponent";
import { SpawnPointComponent, SpawnPointData } from "../components/SpawnPointComponent";

export const createSpawnPointEntity: EntityCreateFunctionType = (
  entity: Entity,
  componentData: EntityComponentDataType
) => {
  if (componentData[ComponentNames.NAME]) {
    addComponent<NameData, {}>(entity, NameComponent, new NameData(componentData[ComponentNames.NAME].name))
  }

  const obj3d = new Object3D()
  addComponent<Object3DData, {}>(entity, Object3DComponent, new Object3DData(obj3d))

  if (componentData[ComponentNames.TRANSFORM]) {
    const { position, rotation, scale } = componentData[ComponentNames.TRANSFORM]
    addComponent<TransformData, {}>(
      entity,
      TransformComponent,
      new TransformData(
        obj3d,
        {
          position: new Vector3(position.x, position.y, position.z),
          rotation: new Quaternion().setFromEuler(
            new Euler().setFromVector3(new Vector3(rotation.x, rotation.y, rotation.z), 'XYZ')
          ),
          scale: new Vector3(scale.x, scale.y, scale.z)
        }
      )
    )
  }

  if (componentData[ComponentNames.SPAWN_POINT]) {
    addComponent<SpawnPointData, {}>(
      entity,
      SpawnPointComponent,
      new SpawnPointData(obj3d, componentData[ComponentNames.SPAWN_POINT])
    )
  }

  if (componentData[ComponentNames.VISIBILE]) {
    addComponent<VisibleData, {}>(
      entity,
      VisibleComponent,
      new VisibleData(obj3d, componentData[ComponentNames.VISIBILE])
    )
  }
}