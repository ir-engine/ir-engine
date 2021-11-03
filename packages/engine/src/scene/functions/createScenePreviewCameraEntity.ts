import { ComponentNames } from "../../common/constants/ComponentNames";
import { EntityComponentDataType, EntityCreateFunctionType } from "../../common/constants/Object3DClassMap";
import { Entity } from "../../ecs/classes/Entity";
import { addComponent } from "../../ecs/functions/ComponentFunctions";
import { NameComponent, NameData } from "../components/NameComponent";
import { Object3DComponent, Object3DData } from "../components/Object3DComponent";
import { TransformComponent, TransformData } from "../../transform/components/TransformComponent";
import { Vector3, Quaternion, Euler, PerspectiveCamera } from "three";
import { VisibleComponent, VisibleData } from "../components/VisibleComponent";
import { ScenePreviewCameraData, ScenePreviewCameraTagComponent } from "../components/ScenePreviewCameraComponent";
import { Engine } from "../../ecs/classes/Engine";

export const createScenePreviewCameraEntity: EntityCreateFunctionType = (
  entity: Entity,
  componentData: EntityComponentDataType
) => {
  if (componentData[ComponentNames.NAME]) {
    addComponent<NameData, {}>(entity, NameComponent, new NameData(componentData[ComponentNames.NAME].name))
  }

  const camera = new PerspectiveCamera()
  addComponent<Object3DData, {}>(entity, Object3DComponent, new Object3DData(camera))

  if (componentData[ComponentNames.TRANSFORM]) {
    const { position, rotation, scale } = componentData[ComponentNames.TRANSFORM]
    addComponent<TransformData, {}>(
      entity,
      TransformComponent,
      new TransformData(
        camera,
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

  if (componentData[ComponentNames.SCENE_PREVIEW_CAMERA]) {
    addComponent<ScenePreviewCameraData, {}>(
      entity,
      ScenePreviewCameraTagComponent,
      new ScenePreviewCameraData(camera, Engine.camera as PerspectiveCamera)
    )
  }

  if (componentData[ComponentNames.VISIBILE]) {
    addComponent<VisibleData, {}>(
      entity,
      VisibleComponent,
      new VisibleData(camera, componentData[ComponentNames.VISIBILE])
    )
  }
}
