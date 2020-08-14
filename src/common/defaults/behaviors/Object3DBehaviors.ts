import { Object3D } from "three"
import { SceneComponent } from "../../components/SceneComponent"
import { World } from "../../components/WorldComponent"
import { Behavior } from "../../interfaces/Behavior"
import { Entity, Component, TagComponent } from "../../../ecs"
import { Object3DComponent } from "../../components/Object3DComponent"
import {
  PositionalAudioTagComponent,
  AudioTagComponent,
  AudioListenerTagComponent,
  CameraTagComponent,
  OrthographicCameraTagComponent,
  PerspectiveCameraTagComponent,
  ArrayCameraTagComponent,
  CubeCameraTagComponent,
  ImmediateRenderObjectTagComponent,
  LightTagComponent,
  AmbientLightTagComponent,
  DirectionalLightTagComponent,
  HemisphereLightTagComponent,
  PointLightTagComponent,
  RectAreaLightTagComponent,
  SpotLightTagComponent,
  LightProbeTagComponent,
  AmbientLightProbeTagComponent,
  HemisphereLightProbeTagComponent,
  BoneTagComponent,
  GroupTagComponent,
  LODTagComponent,
  MeshTagComponent,
  InstancedMeshTagComponent,
  SkinnedMeshTagComponent,
  LineTagComponent,
  LineLoopTagComponent,
  LineSegmentsTagComponent,
  PointsTagComponent,
  SpriteTagComponent,
  SceneTagComponent
} from "../../components/Object3DTagComponents"
import { Skybox } from "../../../ecsy/components/Skybox"

export const addObject3DComponent: Behavior = (
  entity: Entity,
  args: { obj: any; objArgs: any; parentEntity?: Entity }
) => {
  const object3d = args.obj ? new args.obj(args.objArgs) : new Object3D()

  if (!World.instance.world.hasRegisteredComponent(Object3DComponent as any)) {
    World.instance.world.registerComponent(Object3DComponent)
  }
  // object3d = new args.obj(args.objArgs)
  entity.addComponent(Object3DComponent, { value: object3d })
  entity.getMutableComponent(Object3DComponent).value = object3d

  getComponentTags(object3d).forEach((component: any) => {
    entity.addComponent(component)
  })
  if (args.parentEntity === undefined) args.parentEntity = SceneComponent.instance.scene
  if (args.parentEntity && args.parentEntity.hasComponent(Object3DComponent as any)) {
    args.parentEntity.getComponent<Object3DComponent>(Object3DComponent).value.add(object3d)
  }
  // Add the obj to our scene graph
  else SceneComponent.instance.scene.add(object3d)
  return entity
}

export function removeObject3DComponent(entity, unparent = true) {
  const obj = entity.getComponent(Object3DComponent, true).value
  SceneComponent.instance.scene.remove(obj)

  if (unparent) {
    // Using "true" as the entity could be removed somewhere else
    obj.parent && obj.parent.remove(obj)
  }
  entity.removeComponent(Object3DComponent)

  for (let i = entity._ComponentTypes.length - 1; i >= 0; i--) {
    const Component = entity._ComponentTypes[i]

    if (Component.isObject3DTagComponent) {
      entity.removeComponent(Component)
    }
  }

  obj.entity = null
}

export function remove(entity, forceImmediate) {
  if (entity.hasComponent(Object3DComponent)) {
    const obj = entity.getObject3D()
    obj.traverse(o => {
      if (o.entity) {
        removeEntity(o.entity, forceImmediate)
      }
      o.entity = null
    })
    obj.parent && obj.parent.remove(obj)
  }
  removeEntity(entity, forceImmediate)
}

export function getObject3D(entity) {
  const component = entity.getComponent(Object3DComponent)
  return component && component.value
}

export function getComponentTags(object3d: Object3D): (Component<any> | TagComponent)[] {
  const components: Component<any>[] = []
  if (object3d.type === "Audio" && (object3d as any).panner !== undefined) {
    if (!World.instance.world.hasRegisteredComponent(PositionalAudioTagComponent))
      World.instance.world.registerComponent(PositionalAudioTagComponent)
    components.push(PositionalAudioTagComponent as any)
  }
  if (object3d.type === "Audio" && (object3d as any).panner !== undefined) {
    if (!World.instance.world.hasRegisteredComponent(PositionalAudioTagComponent))
      World.instance.world.registerComponent(PositionalAudioTagComponent)
    components.push(PositionalAudioTagComponent as any)
  } else if (object3d.type === "Audio") {
    if (!World.instance.world.hasRegisteredComponent(AudioTagComponent as any))
      World.instance.world.registerComponent(AudioTagComponent)
    components.push(AudioTagComponent as any)
  } else if (object3d.type === "AudioListener") {
    if (!World.instance.world.hasRegisteredComponent(AudioListenerTagComponent as any))
      World.instance.world.registerComponent(AudioListenerTagComponent)
    components.push(AudioListenerTagComponent as any)
  } else if ((object3d as any).isCamera) {
    if (!World.instance.world.hasRegisteredComponent(CameraTagComponent as any))
      World.instance.world.registerComponent(CameraTagComponent)
    components.push(CameraTagComponent as any)

    if ((object3d as any).isOrthographicCamera) {
      if (!World.instance.world.hasRegisteredComponent(OrthographicCameraTagComponent as any))
        World.instance.world.registerComponent(OrthographicCameraTagComponent)
      components.push(OrthographicCameraTagComponent as any)
    } else if ((object3d as any).isPerspectiveCamera) {
      if (!World.instance.world.hasRegisteredComponent(PerspectiveCameraTagComponent as any))
        World.instance.world.registerComponent(PerspectiveCameraTagComponent)
      components.push(PerspectiveCameraTagComponent as any)
    }
    if ((object3d as any).isArrayCamera) {
      if (!World.instance.world.hasRegisteredComponent(ArrayCameraTagComponent as any))
        World.instance.world.registerComponent(ArrayCameraTagComponent)
      components.push(ArrayCameraTagComponent as any)
    } else if (object3d.type === "CubeCamera") {
      if (!World.instance.world.hasRegisteredComponent(CubeCameraTagComponent as any))
        World.instance.world.registerComponent(CubeCameraTagComponent)
      components.push(CubeCameraTagComponent as any)
    } else if ((object3d as any).isImmediateRenderObject) {
      if (!World.instance.world.hasRegisteredComponent(ImmediateRenderObjectTagComponent as any))
        World.instance.world.registerComponent(ImmediateRenderObjectTagComponent)
      components.push(ImmediateRenderObjectTagComponent as any)
    }
  } else if ((object3d as any).isLight) {
    if (!World.instance.world.hasRegisteredComponent(LightTagComponent as any))
      World.instance.world.registerComponent(LightTagComponent)
    components.push(LightTagComponent as any)

    if ((object3d as any).isAmbientLight) {
      if (!World.instance.world.hasRegisteredComponent(AmbientLightTagComponent as any))
        World.instance.world.registerComponent(AmbientLightTagComponent)
      components.push(AmbientLightTagComponent as any)
    } else if ((object3d as any).isDirectionalLight) {
      if (!World.instance.world.hasRegisteredComponent(DirectionalLightTagComponent as any))
        World.instance.world.registerComponent(DirectionalLightTagComponent)
      components.push(DirectionalLightTagComponent as any)
    } else if ((object3d as any).isHemisphereLight) {
      if (!World.instance.world.hasRegisteredComponent(HemisphereLightTagComponent as any))
        World.instance.world.registerComponent(HemisphereLightTagComponent)
      components.push(HemisphereLightTagComponent as any)
    } else if ((object3d as any).isPointLight) {
      if (!World.instance.world.hasRegisteredComponent(PointLightTagComponent as any))
        World.instance.world.registerComponent(PointLightTagComponent)
      components.push(PointLightTagComponent as any)
    } else if ((object3d as any).isRectAreaLight) {
      if (!World.instance.world.hasRegisteredComponent(RectAreaLightTagComponent as any))
        World.instance.world.registerComponent(RectAreaLightTagComponent)
      components.push(RectAreaLightTagComponent as any)
    } else if ((object3d as any).isSpotLight) {
      if (!World.instance.world.hasRegisteredComponent(SpotLightTagComponent as any))
        World.instance.world.registerComponent(SpotLightTagComponent)
      components.push(SpotLightTagComponent as any)
    }
  } else if ((object3d as any).isLightProbe) {
    if (!World.instance.world.hasRegisteredComponent(LightProbeTagComponent as any))
      World.instance.world.registerComponent(LightProbeTagComponent)
    components.push(LightProbeTagComponent as any)

    if ((object3d as any).isAmbientLightProbe) {
      if (!World.instance.world.hasRegisteredComponent(AmbientLightProbeTagComponent as any))
        World.instance.world.registerComponent(AmbientLightProbeTagComponent)
      components.push(AmbientLightProbeTagComponent as any)
    } else if ((object3d as any).isHemisphereLightProbe) {
      if (!World.instance.world.hasRegisteredComponent(HemisphereLightProbeTagComponent as any))
        World.instance.world.registerComponent(HemisphereLightProbeTagComponent)
      components.push(HemisphereLightProbeTagComponent as any)
    }
  } else if ((object3d as any).isBone) {
    if (!World.instance.world.hasRegisteredComponent(BoneTagComponent as any))
      World.instance.world.registerComponent(BoneTagComponent)
    components.push(BoneTagComponent as any)
  } else if ((object3d as any).isGroup) {
    if (!World.instance.world.hasRegisteredComponent(GroupTagComponent as any))
      World.instance.world.registerComponent(GroupTagComponent)
    components.push(GroupTagComponent as any)
  } else if ((object3d as any).isLOD) {
    if (!World.instance.world.hasRegisteredComponent(LODTagComponent as any))
      World.instance.world.registerComponent(LODTagComponent)
    components.push(LODTagComponent as any)
  } else if ((object3d as any).isMesh) {
    if (!World.instance.world.hasRegisteredComponent(MeshTagComponent as any))
      World.instance.world.registerComponent(MeshTagComponent)
    components.push(MeshTagComponent as any)

    if ((object3d as any).isInstancedMesh) {
      if (!World.instance.world.hasRegisteredComponent(InstancedMeshTagComponent as any))
        World.instance.world.registerComponent(InstancedMeshTagComponent)
      components.push(InstancedMeshTagComponent as any)
    } else if ((object3d as any).isSkinnedMesh) {
      if (!World.instance.world.hasRegisteredComponent(SkinnedMeshTagComponent as any))
        World.instance.world.registerComponent(SkinnedMeshTagComponent)
      components.push(SkinnedMeshTagComponent as any)
    }
  } else if ((object3d as any).isLine) {
    if (!World.instance.world.hasRegisteredComponent(LineTagComponent as any))
      World.instance.world.registerComponent(LineTagComponent)
    components.push(LineTagComponent as any)

    if ((object3d as any).isLineLoop) {
      if (!World.instance.world.hasRegisteredComponent(LineLoopTagComponent as any))
        World.instance.world.registerComponent(LineLoopTagComponent)
      components.push(HemisphereLightProbeTagComponent as any)
    } else if ((object3d as any).isLineSegments) {
      if (!World.instance.world.hasRegisteredComponent(LineSegmentsTagComponent as any))
        World.instance.world.registerComponent(LineSegmentsTagComponent)
      components.push(LineSegmentsTagComponent as any)
    }
  } else if ((object3d as any).isPoints) {
    if (!World.instance.world.hasRegisteredComponent(PointsTagComponent as any))
      World.instance.world.registerComponent(PointsTagComponent)
    components.push(PointsTagComponent as any)
  } else if ((object3d as any).isSprite) {
    if (!World.instance.world.hasRegisteredComponent(SpriteTagComponent as any))
      World.instance.world.registerComponent(SpriteTagComponent)
    components.push(SpriteTagComponent as any)
  } else if ((object3d as any).isScene) {
    if (!World.instance.world.hasRegisteredComponent(SceneTagComponent as any))
      World.instance.world.registerComponent(SceneTagComponent)
    components.push(SceneTagComponent as any)
  } else if ((object3d as any).isSky) {
    if (!World.instance.world.hasRegisteredComponent(Skybox as any))
      World.instance.world.registerComponent(Skybox)
    components.push(SceneTagComponent as any)
  }
  return components
}
