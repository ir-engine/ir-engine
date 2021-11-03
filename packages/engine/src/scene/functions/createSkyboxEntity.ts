import { ComponentNames } from "../../common/constants/ComponentNames";
import { EntityComponentDataType, EntityCreateFunctionType } from "../../common/constants/Object3DClassMap";
import { Entity } from "../../ecs/classes/Entity";
import { addComponent } from "../../ecs/functions/ComponentFunctions";
import { NameComponent, NameData } from "../components/NameComponent";
import { Object3DComponent, Object3DData } from "../components/Object3DComponent";
import { Sky } from "../classes/Sky";
import { TransformComponent, TransformData } from "../../transform/components/TransformComponent";
import { Vector3, Quaternion, Euler } from "three";
import { SkyboxComponent, SkyboxData } from "../components/SkyboxComponent";
import { VisibleComponent, VisibleData } from "../components/VisibleComponent";

export const createSkyboxEntity: EntityCreateFunctionType = (
  entity: Entity,
  componentData: EntityComponentDataType
) => {
  if (componentData[ComponentNames.NAME]) {
    addComponent<NameData, {}>(entity, NameComponent, new NameData(componentData[ComponentNames.NAME].name))
  }

  const sky = new Sky()
  addComponent<Object3DData, {}>(entity, Object3DComponent, new Object3DData(sky))

  if (componentData[ComponentNames.TRANSFORM]) {
    const { position, rotation, scale } = componentData[ComponentNames.TRANSFORM]
    addComponent<TransformData, {}>(
      entity,
      TransformComponent,
      new TransformData(
        sky,
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

  if (componentData[ComponentNames.SKYBOX]) {
    addComponent<SkyboxData, {}>(
      entity,
      SkyboxComponent,
      new SkyboxData(sky, componentData[ComponentNames.SKYBOX])
    )
  }

  if (componentData[ComponentNames.VISIBILE]) {
    addComponent<VisibleData, {}>(
      entity,
      VisibleComponent,
      new VisibleData(sky, componentData[ComponentNames.VISIBILE])
    )
  }
}
