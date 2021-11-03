import { AmbientLight, DirectionalLight, HemisphereLight, Mesh, Object3D, PerspectiveCamera, PointLight, SpotLight } from "three"
import { Entity } from "../../ecs/classes/Entity"
import { MappedComponent } from "../../ecs/functions/ComponentFunctions"
import { MapComponent } from "../../map/MapComponent"
import { ParticleEmitterComponent } from "../../particles/components/ParticleEmitter"
import AudioSource from "../../scene/classes/AudioSource"
import Image from "../../scene/classes/Image"
import PostProcessing from "../../scene/classes/PostProcessing"
import { Sky } from "../../scene/classes/Sky"
import Video from "../../scene/classes/Video"
import { AmbientLightComponent, AmbientLightData } from "../../scene/components/AmbientLightComponent"
import { AudioComponent, AudioData } from "../../scene/components/AudioComponent"
import { AudioSettingsComponent, AudioSettingsData } from "../../scene/components/AudioSettingsComponent"
import { DirectionalLightComponent, DirectionalLightData } from "../../scene/components/DirectionalLightComponent"
import { EnvMapComponent, EnvMapData } from "../../scene/components/EnvMapComponent"
import { FogComponent, FogData } from "../../scene/components/FogComponent"
import { GroundPlaneComponent, GroundPlaneData } from "../../scene/components/GroundPlaneComponent"
import { HemisphereLightComponent } from "../../scene/components/HemisphereLightComponent"
import { ImageComponent, ImageData } from "../../scene/components/ImageComponent"
import { InteriorComponent, InteriorData } from "../../scene/components/InteriorComponent"
import { MetaData, MetaDataComponent } from "../../scene/components/MetaDataComponent"
import { PointLightComponent, PointLightData } from "../../scene/components/PointLightComponent"
import { PortalComponent } from "../../scene/components/PortalComponent"
import { PostProcessingComponent } from "../../scene/components/PostProcessingComponent"
import { RenderSettingsComponent, RenderSettingsData } from "../../scene/components/RenderSettingsComponent"
import { ScenePreviewCameraData, ScenePreviewCameraTagComponent } from "../../scene/components/ScenePreviewCameraComponent"
import { ShadowComponent, ShadowData } from "../../scene/components/ShadowComponent"
import { SkyboxComponent, SkyboxData } from "../../scene/components/SkyboxComponent"
import { SpawnPointComponent, SpawnPointData } from "../../scene/components/SpawnPointComponent"
import { SpotLightComponent, SpotLightData } from "../../scene/components/SpotLightComponent"
import { TriggerVolumeComponent, TriggerVolumeData } from "../../scene/components/TriggerVolumeComponent"
import { Userdata, UserdataComponent } from "../../scene/components/UserdataComponent"
import { VideoComponent, VideoData } from "../../scene/components/VideoComponent"
import { VisibleComponent, VisibleData } from "../../scene/components/VisibleComponent"
import { VolumetricComponent, VolumetricData } from "../../scene/components/VolumetricComponent"
import { createCubemapBakeEntity } from "../../scene/functions/createCubemapBakeEntity"
import { createDefaultEntity } from "../../scene/functions/createDefaultEntity"
import { createGroundPlaneEntity } from "../../scene/functions/createGroundPlaneEntity"
import { createHemisphereLightEntity } from "../../scene/functions/createHemisphereLightEntity"
import { createPostprocessingEntity } from "../../scene/functions/createPostprocessingEntity"
import { createSceneEntity } from "../../scene/functions/createSceneEntity"
import { createScenePreviewCameraEntity } from "../../scene/functions/createScenePreviewCameraEntity"
import { createSkyboxEntity } from "../../scene/functions/createSkyboxEntity"
import { createSpawnPointEntity } from "../../scene/functions/createSpawnPointEntity"
import { SceneLoadParams, WorldScene } from "../../scene/functions/SceneLoading"
import { TransformComponent, TransformData } from "../../transform/components/TransformComponent"
import { ComponentNames } from "./ComponentNames"

export type EntityCreateFunctionProps = {
  sceneProperty?: SceneLoadParams
  worldScene?: WorldScene
}
export type EntityComponentDataType = { [key in ComponentNames]: any }
export type EntityCreateFunctionType = (entity: Entity, componentData: EntityComponentDataType, props?: EntityCreateFunctionProps) => void

export type SceneEntityShapeConfigType = {
  shapes: ComponentNames | ComponentNames[],
  partialMatch?: boolean
  create: EntityCreateFunctionType
}

export const DefautSceneEntityShape: SceneEntityShapeConfigType = {
  shapes: ComponentNames.TRANSFORM,
  create: createDefaultEntity
}

export const SceneEntityShapes: SceneEntityShapeConfigType[] = [
  {
    shapes: [ComponentNames.RENDERER_SETTINGS, ComponentNames.ENVMAP, ComponentNames.FOG, ComponentNames.MT_DATA, ComponentNames.AUDIO_SETTINGS],
    partialMatch: true,
    create: createSceneEntity
  }, {
    shapes: ComponentNames.SKYBOX,
    create: createSkyboxEntity
  }, {
    shapes: ComponentNames.SCENE_PREVIEW_CAMERA,
    create: createScenePreviewCameraEntity
  }, {
    shapes: ComponentNames.CUBEMAP_BAKE,
    create: createCubemapBakeEntity
  }, {
    shapes: ComponentNames.GROUND_PLANE,
    create: createGroundPlaneEntity
  }, {
    shapes: ComponentNames.SPAWN_POINT,
    create: createSpawnPointEntity
  }, {
    shapes: ComponentNames.POSTPROCESSING,
    create: createPostprocessingEntity
  }, {
    shapes: ComponentNames.HEMISPHERE_LIGHT,
    create: createHemisphereLightEntity
  }
]

export const getShapeOfEntity = (componentNames: string[]): SceneEntityShapeConfigType | undefined => {
  for (let i = 0; i < SceneEntityShapes.length; i++) {
    const shapeConfig = SceneEntityShapes[i]

    if (Array.isArray(shapeConfig.shapes)) {
      const result = shapeConfig.shapes.filter(s => componentNames.includes(s))
      if (shapeConfig.partialMatch && result.length > 0) return shapeConfig
      else if (result.length === shapeConfig.shapes.length) return shapeConfig
    } else {
      if (componentNames.includes(shapeConfig.shapes)) return shapeConfig
    }
  }
}

export const SceneEntityComponents = [
  ComponentNames.MT_DATA,
  ComponentNames.RENDERER_SETTINGS,
  ComponentNames.AUDIO_SETTINGS,
  ComponentNames.FOG,
  ComponentNames.ENVMAP
]

export type ComponentMetaType = {
  order: number
  object3d?: any | {
    clientSide?: any
    serverSide?: any
  },
  component?: MappedComponent<any, any>
  componentData?: any
}


// TODO: Will be removed
export const ComponentMeta: { [key in ComponentNames]: ComponentMetaType } = {
  [ComponentNames.MT_DATA]: {
    order: -6,
    component: MetaDataComponent,
    componentData: MetaData
  },
  [ComponentNames._MT_DATA]: {
    object3d: Object3D,
    order: 11
  },
  [ComponentNames.USER_DATA]: {
    order: 5,
    component: UserdataComponent,
    componentData: Userdata
  },
  [ComponentNames.AMBIENT_LIGHT]: {
    object3d: AmbientLight,
    order: 1,
    component: AmbientLightComponent,
    componentData: AmbientLightData
  },
  [ComponentNames.DIRECTIONAL_LIGHT]: {
    object3d: DirectionalLight,
    order: 1,
    component: DirectionalLightComponent,
    componentData: DirectionalLightData
  },
  [ComponentNames.HEMISPHERE_LIGHT]: {
    object3d: HemisphereLight,
    order: 1,
    component: HemisphereLightComponent,
    componentData: HemisphereLightComponent
  },
  [ComponentNames.POINT_LIGHT]: {
    object3d: PointLight,
    order: 1,
    component: PointLightComponent,
    componentData: PointLightData
  },
  [ComponentNames.SPOT_LIGHT]: {
    object3d: SpotLight,
    order: 1,
    component: SpotLightComponent,
    componentData: SpotLightData
  },
  [ComponentNames.COLLIDABLE]: {
    order: 12,
  },
  [ComponentNames.FLOOR_PLAN]: {
    order: 2
  },
  [ComponentNames.GLTF_MODEL]: {
    order: 1,
  },
  [ComponentNames.LOOP_ANIMATION]: {
    order: 3
  },
  [ComponentNames.INTERACT]: {
    order: 4,
  },
  [ComponentNames.GROUND_PLANE]: {
    object3d: Mesh,
    order: 1,
    component: GroundPlaneComponent,
    componentData: GroundPlaneData
  },
  [ComponentNames.MAP]: {
    order : 2,
    component: MapComponent,
  },
  [ComponentNames.IMAGE]: {
    object3d: Image,
    order: 2,
    component: ImageComponent,
    componentData: ImageData
  },
  [ComponentNames.VIDEO]: {
    object3d: {
      client: Video,
      server: Object3D,
    },
    order: 2,
    component: VideoComponent,
    componentData: VideoData
  },
  [ComponentNames.AUDIO]: {
    object3d: {
      client: AudioSource,
      server: Object3D,
    },
    order: 2,
    component: AudioComponent,
    componentData: AudioData
  },
  [ComponentNames.VOLUMETRIC]: {
    object3d: Object3D,
    order: 2,
    component: VolumetricComponent,
    componentData: VolumetricData
  },
  [ComponentNames.TRANSFORM]: {
    order: 7,
    component: TransformComponent,
    componentData: TransformData
  },
  [ComponentNames.FOG]: {
    order: -8,
    component: FogComponent,
    componentData: FogData
  },
  [ComponentNames.SKYBOX]: {
    object3d: Sky,
    order: 1,
    component: SkyboxComponent,
    componentData: SkyboxData
  },
  [ComponentNames.AUDIO_SETTINGS]: {
    order: -7,
    component: AudioSettingsComponent,
    componentData: AudioSettingsData
  },
  [ComponentNames.RENDERER_SETTINGS]: {
    order: -10,
    component: RenderSettingsComponent,
    componentData: RenderSettingsData
  },
  [ComponentNames.SPAWN_POINT]: {
    object3d: Object3D,
    order: 1,
    component: SpawnPointComponent,
    componentData: SpawnPointData
  },
  [ComponentNames.SCENE_PREVIEW_CAMERA]: {
    object3d: PerspectiveCamera,
    order: 1,
    component: ScenePreviewCameraTagComponent,
    componentData: ScenePreviewCameraData
  },
  [ComponentNames.SHADOW]: {
    order: 8,
    component: ShadowComponent,
    componentData: ShadowData
  },
  [ComponentNames.COLLIDER]: {
    order: 9
  },
  [ComponentNames.BOX_COLLIDER]: {
    order: 9
  },
  [ComponentNames.MESH_COLLIDER]: {
    order: 9
  },
  [ComponentNames.TRIGGER_VOLUME]: {
    object3d: Mesh,
    order: 1,
    component: TriggerVolumeComponent,
    componentData: TriggerVolumeData
  },
  [ComponentNames.LINK]: {
    object3d: Object3D,
    order: 2
  },
  [ComponentNames.PARTICLE_EMITTER]: {
    order: 1,
    component: ParticleEmitterComponent,
  },
  [ComponentNames.CLOUDS]: {
    order: 1
  },
  [ComponentNames.OCEAN]: {
    order: 1,
  },
  [ComponentNames.WATER]: {
    order: 1
  },
  [ComponentNames.INTERIOR]: {
    order: 1,
    component: InteriorComponent,
    componentData: InteriorData
  },
  [ComponentNames.POSTPROCESSING]: {
    object3d: PostProcessing,
    order: 1,
    component: PostProcessingComponent,
  },
  [ComponentNames.CAMERA_PROPERTIES]: {
    order: 1,
  },
  [ComponentNames.ENVMAP]: {
    order: -9,
    component: EnvMapComponent,
    componentData: EnvMapData
  },
  [ComponentNames.PORTAL]: {
    object3d: Mesh,
    order: 1,
    component: PortalComponent,
  },
  [ComponentNames.PROJECT]: {
    order: 6
  },
  [ComponentNames.VISIBILE]: {
    order: 9,
    component: VisibleComponent,
    componentData: VisibleData
  },
  [ComponentNames.GROUP]: {
    object3d: Object3D,
    order: 1
  },
  [ComponentNames.CUBEMAP_BAKE]: {
    order: 1
  },
  [ComponentNames.NAME]: {
    order: 2
  },
  [ComponentNames.ENTITY_METADATA]: {
    order: 0
  },
}
