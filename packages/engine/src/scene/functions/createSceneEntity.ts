import { ComponentNames } from "../../common/constants/ComponentNames";
import { EntityComponentDataType, EntityCreateFunctionProps, EntityCreateFunctionType } from "../../common/constants/Object3DClassMap";
import { Entity } from "../../ecs/classes/Entity";
import { Engine } from "../../ecs/classes/Engine";
import { addComponent } from "../../ecs/functions/ComponentFunctions";
import { useWorld } from "../../ecs/functions/SystemHooks";
import { EnvMapComponent, EnvMapData } from "../components/EnvMapComponent";
import { FogData, FogComponent } from "../components/FogComponent";
import { NameComponent, NameData } from "../components/NameComponent";
import { AudioSettingsData, AudioSettingsComponent } from "../components/AudioSettingsComponent";
import { RenderSettingsData, RenderSettingsComponent } from "../components/RenderSettingsComponent";

export const createSceneEntity: EntityCreateFunctionType = (
  entity: Entity,
  componentData: EntityComponentDataType,
  props: EntityCreateFunctionProps
) => {
  if (componentData[ComponentNames.NAME]) {
    addComponent<NameData, {}>(entity, NameComponent, new NameData(componentData[ComponentNames.NAME].name))
  }

  if (componentData[ComponentNames.RENDERER_SETTINGS]) {
    addComponent<RenderSettingsData, {}>(
      entity,
      RenderSettingsComponent,
      new RenderSettingsData(componentData[ComponentNames.RENDERER_SETTINGS])
    )

    if (props.sceneProperty) {
      props.sceneProperty.isCSMEnabled = componentData[ComponentNames.RENDERER_SETTINGS].csm
    }
  }

  if (componentData[ComponentNames.AUDIO_SETTINGS]) {
    addComponent<AudioSettingsData, {}>(
      entity,
      AudioSettingsComponent,
      new AudioSettingsData(componentData[ComponentNames.AUDIO_SETTINGS])
    )
  }

  if (componentData[ComponentNames.ENVMAP]) {
    addComponent<EnvMapData, {}>(
      entity,
      EnvMapComponent,
      new EnvMapData(componentData[ComponentNames.ENVMAP])
    )
  }

  if (componentData[ComponentNames.FOG]) {
    addComponent<FogData, {}>(
      entity,
      FogComponent,
      new FogData(Engine.scene, componentData[ComponentNames.FOG])
    )
  }

  if (componentData[ComponentNames.MT_DATA]) {
    //if (isClient && Engine.isBot) {
    const { meta_data } = componentData[ComponentNames.MT_DATA]
    const world = useWorld()

    world.sceneMetadata = meta_data
    console.log('scene_metadata|' + meta_data)
    //}
  }
}
