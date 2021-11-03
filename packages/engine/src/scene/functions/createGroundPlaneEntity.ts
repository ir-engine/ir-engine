import { ComponentNames } from "../../common/constants/ComponentNames";
import { EntityComponentDataType, EntityCreateFunctionProps, EntityCreateFunctionType } from "../../common/constants/Object3DClassMap";
import { Entity } from "../../ecs/classes/Entity";
import { addComponent } from "../../ecs/functions/ComponentFunctions";
import { NameComponent, NameData } from "../components/NameComponent";
import { Object3DComponent, Object3DData } from "../components/Object3DComponent";
import { TransformComponent, TransformData } from "../../transform/components/TransformComponent";
import { Vector3, Quaternion, Euler, Mesh } from "three";
import { VisibleComponent, VisibleData } from "../components/VisibleComponent";
import { GroundPlaneComponent, GroundPlaneData } from "../components/GroundPlaneComponent";
import { createCollider } from "../../physics/functions/createCollider";

export const createGroundPlaneEntity: EntityCreateFunctionType = (
  entity: Entity,
  componentData: EntityComponentDataType,
  props: EntityCreateFunctionProps
) => {
  if (componentData[ComponentNames.NAME]) {
    addComponent<NameData, {}>(entity, NameComponent, new NameData(componentData[ComponentNames.NAME].name))
  }

  const mesh = new Mesh()
  addComponent<Object3DData, {}>(entity, Object3DComponent, new Object3DData(mesh))

  if (componentData[ComponentNames.TRANSFORM]) {
    const { position, rotation, scale } = componentData[ComponentNames.TRANSFORM]
    addComponent<TransformData, {}>(
      entity,
      TransformComponent,
      new TransformData(
        mesh,
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

  if (componentData[ComponentNames.GROUND_PLANE]) {
    addComponent<GroundPlaneData, {}>(
      entity,
      GroundPlaneComponent,
      new GroundPlaneData(mesh, componentData[ComponentNames.GROUND_PLANE])
    )

    if (!props.sceneProperty?.isEditor) createCollider(entity, mesh)
  }

  if (componentData[ComponentNames.VISIBILE]) {
    addComponent<VisibleData, {}>(
      entity,
      VisibleComponent,
      new VisibleData(mesh, componentData[ComponentNames.VISIBILE])
    )
  }
}