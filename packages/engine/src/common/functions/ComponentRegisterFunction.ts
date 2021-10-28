import { AmbientLight, HemisphereLight, PointLight, SpotLight, Vector3, Quaternion, Euler, DirectionalLight, PerspectiveCamera, Mesh, Vector2 } from "three"
import { Engine } from "../../ecs/classes/Engine"
import { Entity } from "../../ecs/classes/Entity"
import { World } from "../../ecs/classes/World"
import { addComponent, getComponent, removeComponent } from "../../ecs/functions/ComponentFunctions"
import { InteractableComponent, InteractableData } from "../../interaction/components/InteractableComponent"
import { createParticleEmitterObject } from "../../particles/functions/particleHelpers"
import { ColliderComponent } from "../../physics/components/ColliderComponent"
import { CollisionComponent } from "../../physics/components/CollisionComponent"
import { getAllShapesFromObject3D, createBody, createCollider } from "../../physics/functions/createCollider"
import { Clouds } from "../../scene/classes/Clouds"
import Image from "../../scene/classes/Image"
import { Interior } from "../../scene/classes/Interior"
import { Ocean } from "../../scene/classes/Ocean"
import { Water } from "../../scene/classes/Water"
import { AmbientLightComponent, AmbientLightData } from "../../scene/components/AmbientLightComponent"
import { AudioSettingsComponent, AudioSettingsData } from "../../scene/components/AudioSettingsComponent"
import { DirectionalLightComponent, DirectionalLightData } from "../../scene/components/DirectionalLightComponent"
import { FogComponent, FogData } from "../../scene/components/FogComponent"
import { HemisphereLightData, HemisphereLightComponent } from "../../scene/components/HemisphereLightComponent"
import { ImageComponent, ImageData } from "../../scene/components/ImageComponent"
import { InteriorComponent, InteriorData } from "../../scene/components/InteriorComponent"
import { Object3DComponent } from "../../scene/components/Object3DComponent"
import { PointLightComponent, PointLightData } from "../../scene/components/PointLightComponent"
import { ScenePreviewCameraData, ScenePreviewCameraTagComponent } from "../../scene/components/ScenePreviewCameraComponent"
import { ShadowComponent, ShadowData } from "../../scene/components/ShadowComponent"
import { SpawnPointComponent, SpawnPointData } from "../../scene/components/SpawnPointComponent"
import { SpotLightComponent, SpotLightData } from "../../scene/components/SpotLightComponent"
import { TriggerVolumeComponent, TriggerVolumeData } from "../../scene/components/TriggerVolumeComponent"
import { UpdatableComponent } from "../../scene/components/UpdatableComponent"
import { Userdata, UserdataComponent } from "../../scene/components/UserdataComponent"
import { VisibleComponent, VisibleData } from "../../scene/components/VisibleComponent"
import { addObject3DComponent } from "../../scene/functions/addObject3DComponent"
import { createGround } from "../../scene/functions/createGround"
import { createMap } from "../../scene/functions/createMap"
import { createAudio, createMediaServer, createVideo, createVolumetric } from "../../scene/functions/createMedia"
import { createPortal } from "../../scene/functions/createPortal"
import { loadGLTFModel } from "../../scene/functions/loadGLTFModel"
import { loadModelAnimation } from "../../scene/functions/loadModelAnimation"
import { SceneLoadParams, WorldScene } from "../../scene/functions/SceneLoading"
import { setCameraProperties } from "../../scene/functions/setCameraProperties"
import { BoxColliderProps } from "../../scene/interfaces/BoxColliderProps"
import { SceneDataComponent } from "../../scene/interfaces/SceneDataComponent"
import { TransformComponent, TransformData } from "../../transform/components/TransformComponent"
import { ComponentNames } from "../constants/ComponentNames"
import { isClient } from "./isClient"
import { NetworkWorldAction } from '../../networking/functions/NetworkWorldAction'
import { matchActionOnce } from '../../networking/functions/matchActionOnce'
import { SkyboxComponent, SkyboxData, SkyboxDataProps } from "../../scene/components/SkyboxComponent"
import { Sky } from "../../scene/classes/Sky"
import { RenderSettingsComponent, RenderSettingsData } from "../../scene/components/RenderSettingsComponent"
import { EnvMapComponent, EnvMapData } from "../../scene/components/EnvMapComponent"
import { PostProcessingComponent, PostProcessingData } from "../../scene/components/PostProcessingComponent"
import PostProcessing from "../../scene/classes/PostProcessing"
import { configureEffectComposer } from "../../renderer/functions/configureEffectComposer"

type RegisterFunctionParams = {
  world: World,
  entity: Entity,
  component: SceneDataComponent,
  worldScene?: WorldScene,
  sceneProperty?: SceneLoadParams
}

type ComponentRegisterType = {
  [key in ComponentNames]: (params: RegisterFunctionParams) => void
}

export const ComponentRegisterFunction: ComponentRegisterType = {
  [ComponentNames.MT_DATA]: (params: RegisterFunctionParams): void => {
    //if (isClient && Engine.isBot) {
    const { meta_data } = params.component.data

    params.world.sceneMetadata = meta_data
    console.log('scene_metadata|' + meta_data)
    //}
  },

  [ComponentNames._MT_DATA]: (params: RegisterFunctionParams): void => {
    addComponent<InteractableData, {}>(
      params.entity,
      InteractableComponent,
      new InteractableData({ data: { action: '_metadata' } })
    )

    const transform = getComponent(params.entity, TransformComponent)

    // if (isClient && Engine.isBot) {
    const { _data } = params.component.data
    const { x, y, z } = transform.position
    params.world.worldMetadata[_data] = x + ',' + y + ',' + z
    console.log('metadata|' + x + ',' + y + ',' + z + '|' + _data)
    // }
  },

  [ComponentNames.USER_DATA]: (params: RegisterFunctionParams): void => {
    addComponent<Userdata, {}>(params.entity, UserdataComponent, new Userdata({ data: params.component.data }))
  },

  [ComponentNames.AMBIENT_LIGHT]: (params: RegisterFunctionParams): void => {
    const object3DComponent = getComponent(params.entity, Object3DComponent)
    addComponent<AmbientLightData, {}>(
      params.entity,
      AmbientLightComponent,
      new AmbientLightData(object3DComponent.value as AmbientLight, params.component.data.color)
    )
  },

  [ComponentNames.DIRECTIONAL_LIGHT]: (params: RegisterFunctionParams): void => {
    // createDirectionalLight(params.entity, params.component, params.sceneProperty || {} as ScenePropertyType)

    // TODO: Check for CSM
    if (!isClient) return
    const object3DComponent = getComponent(params.entity, Object3DComponent)
    addComponent<DirectionalLightData, {}>(
      params.entity,
      DirectionalLightComponent,
      new DirectionalLightData(object3DComponent.value as DirectionalLight, params.component.data)
    )
  },

  [ComponentNames.HEMISPHERE_LIGHT]: (params: RegisterFunctionParams): void => {
    const object3DComponent = getComponent(params.entity, Object3DComponent)
    addComponent<HemisphereLightData, {}>(
      params.entity,
      HemisphereLightComponent,
      new HemisphereLightData(object3DComponent.value as HemisphereLight, params.component.data)
    )
  },

  [ComponentNames.POINT_LIGHT]: (params: RegisterFunctionParams): void => {
    const object3DComponent = getComponent(params.entity, Object3DComponent)
    addComponent<PointLightData, {}>(
      params.entity,
      PointLightComponent,
      new PointLightData(object3DComponent.value as PointLight, params.component.data)
    )
  },

  [ComponentNames.SPOT_LIGHT]: (params: RegisterFunctionParams): void => {
    const object3DComponent = getComponent(params.entity, Object3DComponent)
    addComponent<SpotLightData, {}>(
      params.entity,
      SpotLightComponent,
      new SpotLightData(object3DComponent.value as SpotLight, params.component.data)
    )
  },

  [ComponentNames.COLLIDABLE]: (params: RegisterFunctionParams): void => {},

  [ComponentNames.FLOOR_PLAN]: (params: RegisterFunctionParams): void => {},

  // TODO: Not converted
  [ComponentNames.GLTF_MODEL]: (params: RegisterFunctionParams): void => {
    if (!params.worldScene) {
      console.warn('World scene object is not defined or null')
      return
    }

    loadGLTFModel(params.worldScene, params.entity, params.component, params.sceneProperty || {} as SceneLoadParams)
  },

  // TODO: Not converted
  [ComponentNames.LOOP_ANIMATION]: (params: RegisterFunctionParams): void => {
    loadModelAnimation(params.entity, params.component)
  },

  [ComponentNames.INTERACT]: (params: RegisterFunctionParams): void => {
    if (params.component.data.interactable) {
      addComponent<InteractableData, {}>(
        params.entity,
        InteractableComponent,
        new InteractableData({ data: params.component.data })
      )
    }
  },

  [ComponentNames.GROUND_PLANE]: (params: RegisterFunctionParams): void => {
    createGround(params.entity, params.component.data, params.sceneProperty?.isEditor)
  },

  [ComponentNames.IMAGE]: (params: RegisterFunctionParams): void => {
    const object3DComponent = getComponent(params.entity, Object3DComponent)
    addComponent<ImageData, {}>(
      params.entity,
      ImageComponent,
      new ImageData(object3DComponent.value as Image, params.component.data)
    )
  },

  [ComponentNames.VIDEO]: (params: RegisterFunctionParams): void => {
    // if livestream, server will send the video info to the client
    if (isClient) {
      // if(!component.data.isLivestream) {
      createVideo(params.entity, params.component.data)
      // }
      // addComponent(entity, LivestreamComponent)
      // } else if(component.data.isLivestream) {
      // @todo
      // addComponent(entity, LivestreamProxyComponent, { src: component.data.src })
    } else {
      createMediaServer(params.entity, params.component.data)
    }
  },

  // TODO: to be converted
  [ComponentNames.MAP]: (params: RegisterFunctionParams): void => {
    if (!params.worldScene) {
      console.warn('World scene object is not defined or null')
      return
    }
    if (isClient) params.worldScene.loaders.push(createMap(params.entity, params.component.data))
  },

  [ComponentNames.AUDIO]: (params: RegisterFunctionParams): void => {
    if (isClient) createAudio(params.entity, params.component.data)
    else createMediaServer(params.entity, params.component.data)
  },

  [ComponentNames.VOLUMETRIC]: (params: RegisterFunctionParams): void => {
    if (isClient) createVolumetric(params.entity, params.component.data)
    else createMediaServer(params.entity, params.component.data)
  },

  [ComponentNames.TRANSFORM]: (params: RegisterFunctionParams): void => {
    const { position, rotation, scale } = params.component.data
    const object3DComponent = getComponent(params.entity, Object3DComponent)
    addComponent<TransformData, {}>(
      params.entity,
      TransformComponent,
      new TransformData(
        object3DComponent.value,
        {
          position: new Vector3(position.x, position.y, position.z),
          rotation: new Quaternion().setFromEuler(
            new Euler().setFromVector3(new Vector3(rotation.x, rotation.y, rotation.z), 'XYZ')
          ),
          scale: new Vector3(scale.x, scale.y, scale.z)
        }
      )
    )
  },

  [ComponentNames.FOG]: (params: RegisterFunctionParams): void => {
    addComponent<FogData, {}>(
      params.entity,
      FogComponent,
      new FogData(Engine.scene, params.component.data)
    )
  },

  [ComponentNames.SKYBOX]: (params: RegisterFunctionParams): void => {
    const object3dComponent = getComponent(params.entity, Object3DComponent)

    addComponent<SkyboxData, {}>(
      params.entity,
      SkyboxComponent,
      new SkyboxData(object3dComponent.value as Sky, params.component.data as SkyboxDataProps)
    )
  },

  [ComponentNames.AUDIO_SETTINGS]: (params: RegisterFunctionParams): void => {
    addComponent<AudioSettingsData, {}>(
      params.entity,
      AudioSettingsComponent,
      new AudioSettingsData(params.component.data)
    )
  },

  [ComponentNames.RENDERER_SETTINGS]: (params: RegisterFunctionParams): void => {
    addComponent<RenderSettingsData, {}>(
      params.entity,
      RenderSettingsComponent,
      new RenderSettingsData(params.component.data)
    )

    if (params.sceneProperty) {
      params.sceneProperty.isCSMEnabled = params.component.data.csm
    }
  },

  [ComponentNames.SPAWN_POINT]: (params: RegisterFunctionParams): void => {
    const object3DComponent = getComponent(params.entity, Object3DComponent)
    addComponent<SpawnPointData, {}>(
      params.entity,
      SpawnPointComponent,
      new SpawnPointData(object3DComponent.value, params.sceneProperty?.isEditor)
    )
  },

  [ComponentNames.SCENE_PREVIEW_CAMERA]: (params: RegisterFunctionParams): void => {
    const object3DComponent = getComponent(params.entity, Object3DComponent)
    addComponent<ScenePreviewCameraData, {}>(
      params.entity,
      ScenePreviewCameraTagComponent,
      new ScenePreviewCameraData(object3DComponent.value as PerspectiveCamera, Engine.camera as PerspectiveCamera)
    )

    if (isClient && Engine.activeCameraEntity) {
      const cameraTransformComponent = getComponent(Engine.activeCameraEntity, TransformComponent)
      const inputTransformComponent = getComponent(params.entity, TransformComponent)

      cameraTransformComponent.position = inputTransformComponent.position
      cameraTransformComponent.rotation = inputTransformComponent.rotation
    }
  },

  [ComponentNames.SHADOW]: (params: RegisterFunctionParams): void => {
    const object3DComponent = getComponent(params.entity, Object3DComponent)
    addComponent<ShadowData, {}>(
      params.entity,
      ShadowComponent,
      new ShadowData(object3DComponent.value, params.component.data)
    )
  },

  // TODO: To be converted
  [ComponentNames.COLLIDER]: (params: RegisterFunctionParams): void => {
    const object3d = getComponent(params.entity, Object3DComponent)
    if (object3d) {
      const shapes = getAllShapesFromObject3D(params.entity, object3d.value as any, params.component.data)
      const body = createBody(params.entity, params.component.data, shapes)
      addComponent(params.entity, ColliderComponent, { body })
      addComponent(params.entity, CollisionComponent, { collisions: [] })
    }
  },

  // TODO: To be converted
  [ComponentNames.BOX_COLLIDER]: (params: RegisterFunctionParams): void => {
    const boxColliderProps: BoxColliderProps = params.component.data
    const transform = getComponent(params.entity, TransformComponent)

    const shape = params.world.physics.createShape(
      new PhysX.PxBoxGeometry(transform.scale.x, transform.scale.y, transform.scale.z),
      undefined,
      boxColliderProps as any
    )

    const body = createBody(params.entity, { bodyType: 0 }, [shape])
    addComponent(params.entity, ColliderComponent, { body })
    addComponent(params.entity, CollisionComponent, { collisions: [] })

    if (
      boxColliderProps.removeMesh === 'true' ||
      (typeof boxColliderProps.removeMesh === 'boolean' && boxColliderProps.removeMesh === true)
    ) {
      const obj = getComponent(params.entity, Object3DComponent)
      if (obj?.value) {
        if (obj.value.parent) obj.value.removeFromParent()
        removeComponent(params.entity, Object3DComponent)
      }
    }
  },

  [ComponentNames.TRIGGER_VOLUME]: (params: RegisterFunctionParams): void => {
    const object3dComponent = getComponent(params.entity, Object3DComponent)

    addComponent<TriggerVolumeData, {}>(
      params.entity,
      TriggerVolumeComponent,
      new TriggerVolumeData(object3dComponent.value as Mesh, params.component.data)
    )

    createCollider(params.entity, object3dComponent.value as Mesh)
  },

  [ComponentNames.LINK]: (params: RegisterFunctionParams): void => {
    // addObject3DComponent(params.entity, new Object3D(), params.component.data)
    addComponent<InteractableData, {}>(
      params.entity,
      InteractableComponent,
      new InteractableData({ data: { action: 'link' } })
    )
  },

  // TODO: to be converted
  [ComponentNames.PARTICLE_EMITTER]: (params: RegisterFunctionParams): void => {
    createParticleEmitterObject(params.entity, params.component.data)
  },

  // TODO: to be converted
  [ComponentNames.CLOUDS]: (params: RegisterFunctionParams): void => {
    isClient && addObject3DComponent(params.entity, new Clouds(), params.component.data)
    isClient && addComponent(params.entity, UpdatableComponent, {})
  },

  // TODO: to be converted
  [ComponentNames.OCEAN]: (params: RegisterFunctionParams): void => {
    isClient && addObject3DComponent(params.entity, new Ocean(), params.component.data)
    isClient && addComponent(params.entity, UpdatableComponent, {})
  },

  // TODO: to be converted
  [ComponentNames.WATER]: (params: RegisterFunctionParams): void => {
    isClient && addObject3DComponent(params.entity, new Water(), params.component.data)
    isClient && addComponent(params.entity, UpdatableComponent, {})
  },

  [ComponentNames.INTERIOR]: (params: RegisterFunctionParams): void => {
    if (isClient) {
      const object3DComponent = getComponent(params.entity, Object3DComponent)
      addComponent<InteriorData, {}>(
        params.entity,
        InteriorComponent,
        new InteriorData(object3DComponent.value as Interior, {
          cubeMap: params.component.data.cubeMap,
          tiling: params.component.data.tiling,
          size: new Vector2(params.component.data.size.x, params.component.data.size.y),
        })
      )
    }
  },

  [ComponentNames.POSTPROCESSING]: (params: RegisterFunctionParams): void => {
    const object3DComponent = getComponent(params.entity, Object3DComponent)

    addComponent<PostProcessingData, {}>(
      params.entity,
      PostProcessingComponent,
      new PostProcessingData(object3DComponent.value as PostProcessing, params.component.data.options)
    )

    if (!params.sceneProperty?.isEditor) {
      configureEffectComposer()
    }
  },

  [ComponentNames.CAMERA_PROPERTIES]: (params: RegisterFunctionParams): void => {
    if (isClient) {
      matchActionOnce(NetworkWorldAction.spawnAvatar.matches, (spawnAction) => {
        if (spawnAction.userId === Engine.userId) {
          setCameraProperties(Engine.defaultWorld.localClientEntity, params.component.data)
          return true
        }
        return false
      })
    }
  },

  [ComponentNames.ENVMAP]: (params: RegisterFunctionParams): void => {
    addComponent<EnvMapData, {}>(
      params.entity,
      EnvMapComponent,
      new EnvMapData(params.component.data)
    )
  },

  [ComponentNames.PORTAL]: (params: RegisterFunctionParams): void => {
    createPortal(params.entity, params.component.data)
  },

  /* intentionally empty - these are only for the editor */
  [ComponentNames.GROUP]: (params: RegisterFunctionParams): void => { },
  [ComponentNames.PROJECT]: (params: RegisterFunctionParams): void => { },  // loaded prior to engine init

  [ComponentNames.VISIBILE]: (params: RegisterFunctionParams): void => {
    if (isClient) {
      const object3DComponent = getComponent(params.entity, Object3DComponent)

      addComponent<VisibleData, {}>(
        params.entity,
        VisibleComponent,
        new VisibleData(object3DComponent.value, params.component.data)
      )
    }
  },

  [ComponentNames.MESH_COLLIDER]: (params: RegisterFunctionParams): void => { },
  [ComponentNames.NAME]: (params: RegisterFunctionParams): void => { },
  [ComponentNames.CUBEMAP_BAKE]: (params: RegisterFunctionParams): void => { },
  [ComponentNames.ENTITY_METADATA]: (params: RegisterFunctionParams): void => { },
}
